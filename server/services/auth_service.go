package services

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"onxzy/super-santa-server/database"
	"onxzy/super-santa-server/services/auth"
	"onxzy/super-santa-server/services/group"
	"onxzy/super-santa-server/services/user"
	"onxzy/super-santa-server/utils"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/tadglines/go-pkgs/crypto/srp"
)

type AuthService struct {
	srp               *srp.SRP
	loginSessionStore map[string]auth.LoginSession

	config     *utils.Config
	groupStore *database.GroupStore
}

func NewAuthService(config *utils.Config, groupStore *database.GroupStore) *AuthService {
	srpInstance, _ := srp.NewSRP("rfc5054.2048", sha256.New, nil)
	return &AuthService{
		srp:               srpInstance,
		config:            config,
		groupStore:        groupStore,
		loginSessionStore: make(map[string]auth.LoginSession),
	}
}

func (a *AuthService) CreateGroupJWT(groupID string) (string, error) {
	g, err := a.groupStore.GetGroup(groupID)
	if err != nil {
		if errors.Is(err, database.ErrGroupNotFound) {
			return "", group.ErrGroupNotFound
		}
		return "", err
	}

	claims := auth.GroupClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "super-santa",
			Subject:   "guest",
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(a.config.Auth.JWT.GroupExpire) * time.Second)),
		},
		GroupID: g.ID,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(a.config.Auth.JWT.Secret))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func (a *AuthService) VerifyGroupJWT(tokenString string) (groupID string, err error) {
	claims := &auth.GroupClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, &auth.InvalidTokenError{Err: errors.New("unexpected signing method")}
		}
		return []byte(a.config.Auth.JWT.Secret), nil
	})
	if err != nil {
		return "", &auth.InvalidTokenError{Err: err}
	}
	if !token.Valid || claims.Subject != "guest" {
		return "", &auth.InvalidTokenError{Err: errors.New("invalid token")}
	}

	return claims.GroupID, nil
}

func (a *AuthService) CreateAuthJWT(userID string) (string, error) {
	u, err := a.groupStore.GetUser(userID)
	if err != nil {
		if errors.Is(err, database.ErrUserNotFound) {
			return "", user.ErrUserNotFound
		}
		return "", err
	}

	claims := auth.AuthClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			// TODO: Make this configurable
			Issuer:    "super-santa",
			Subject:   u.ID,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(a.config.Auth.JWT.AuthExpire) * time.Second)),
		},
		GroupID: u.GroupID,
		IsAdmin: u.IsAdmin,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(a.config.Auth.JWT.Secret))
}

func (a *AuthService) VerifyAuthJWT(tokenString string) (*auth.AuthClaims, error) {
	claims := &auth.AuthClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, &auth.InvalidTokenError{Err: errors.New("unexpected signing method")}
		}
		return []byte(a.config.Auth.JWT.Secret), nil
	})
	if err != nil {
		return nil, &auth.InvalidTokenError{Err: err}
	}
	if !token.Valid || claims.Subject == "guest" {
		return nil, &auth.InvalidTokenError{Err: errors.New("invalid token")}
	}

	return claims, nil
}

func (a *AuthService) srpCompleteLogin(serverSession *srp.ServerSession, clientPubKey []byte, clientAuth []byte) (sessionKey []byte, serverAuth []byte, err error) {
	// Compute the server's session key using client's public key A
	sessionKey, err = serverSession.ComputeKey(clientPubKey)
	if err != nil {
		return nil, nil, err
	}

	// Verify client's authenticator
	if !serverSession.VerifyClientAuthenticator(clientAuth) {
		return nil, nil, auth.ErrSrpAuthenticator
	}

	// Compute server's authenticator to send back to client
	serverAuth = serverSession.ComputeAuthenticator(clientAuth)

	return sessionKey, serverAuth, nil
}

func (a *AuthService) srpGetChallenge(id string, verifier string) (serverSession *srp.ServerSession, challenge *auth.SrpChallenge, err error) {
	parts := strings.Split(verifier, ".")
	if len(parts) != 2 {
		return nil, nil, errors.New("verifier is not valid")
	}

	// Hex decode both parts
	verifierBytes, err := hex.DecodeString(parts[0])
	if err != nil {
		return nil, nil, err
	}

	salt, err := hex.DecodeString(parts[1])
	if err != nil {
		return nil, nil, err
	}

	serverSession = a.srp.NewServerSession([]byte(id), salt, verifierBytes)

	serverPubKey := serverSession.GetB()

	challenge = &auth.SrpChallenge{
		Salt:         hex.EncodeToString(salt),
		ServerPubKey: hex.EncodeToString(serverPubKey),
	}

	return serverSession, challenge, nil
}

func (a *AuthService) InitiateGroupLogin(groupID string) (sessionID string, challenge *auth.SrpChallenge, err error) {
	g, err := a.groupStore.GetGroup(groupID)
	if err != nil {
		if errors.Is(err, database.ErrGroupNotFound) {
			return "", nil, group.ErrGroupNotFound
		}
		return "", nil, err
	}

	serverSession, challenge, err := a.srpGetChallenge(groupID, g.SecretVerifier)
	if err != nil {
		return "", nil, err
	}

	sessionID = generateSessionID(auth.LoginSessionTypeGroup, groupID)
	a.loginSessionStore[sessionID] = auth.LoginSession{
		LoginType:     auth.LoginSessionTypeGroup,
		ServerSession: serverSession,
		ID:            groupID,
	}

	return sessionID, challenge, nil
}

func (a *AuthService) InitiateUserLogin(groupID string, email string) (sessionID string, challenge *auth.SrpChallenge, err error) {
	u, err := a.groupStore.GetGroupUserByEmail(groupID, email)
	if err != nil {
		if errors.Is(err, database.ErrUserNotFound) {
			return "", nil, user.ErrUserNotFound
		}
		return "", nil, err
	}

	serverSession, challenge, err := a.srpGetChallenge(u.Email, u.PasswordVerifier)
	if err != nil {
		return "", nil, err
	}

	sessionID = generateSessionID(auth.LoginSessionTypeUser, u.ID)
	a.loginSessionStore[sessionID] = auth.LoginSession{
		LoginType:     auth.LoginSessionTypeUser,
		ServerSession: serverSession,
		ID:            u.ID,
	}

	return sessionID, challenge, nil
}

func (a *AuthService) CompleteLogin(sessionType auth.LoginSessionType, sessionID string, authData *auth.SrpAuth) (loginID string, session *auth.SrpSession, err error) {
	loginSession, exists := a.loginSessionStore[sessionID]
	if !exists {
		return "", nil, &auth.InvalidSessionError{Err: errors.New("invalid session ID")}
	}
	if loginSession.LoginType != sessionType {
		return "", nil, &auth.InvalidSessionError{Err: errors.New("session type mismatch")}
	}

	defer delete(a.loginSessionStore, sessionID)

	// Decode authentication data
	clientPubKey, err := hex.DecodeString(authData.ClientPubKey)
	if err != nil {
		return "", nil, err
	}
	clientAuth, err := hex.DecodeString(authData.ClientAuth)
	if err != nil {
		return "", nil, err
	}
	if len(clientPubKey) == 0 || len(clientAuth) == 0 {
		return "", nil, errors.New("invalid authentication data")
	}

	// Verify the authenticator
	sessionKey, serverAuth, err := a.srpCompleteLogin(loginSession.ServerSession, clientPubKey, clientAuth)
	if err != nil {
		return "", nil, err
	}

	return loginSession.ID, &auth.SrpSession{
		SessionKey: hex.EncodeToString(sessionKey),
		ServerAuth: hex.EncodeToString(serverAuth),
	}, nil
}

// FIXME: Use a cryptographically secure random generator
func generateSessionID(prefix auth.LoginSessionType, ID string) string {
	h := sha256.New()
	h.Write([]byte(ID))
	h.Write([]byte(time.Now().String()))
	hash := h.Sum(nil)

	return string(prefix) + "-" + hex.EncodeToString(hash)
}
