package services

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"onxzy/super-santa-server/database"
	"onxzy/super-santa-server/services/authService"
	"onxzy/super-santa-server/services/groupService"
	"onxzy/super-santa-server/services/userService"
	"onxzy/super-santa-server/utils"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/tadglines/go-pkgs/crypto/srp"
)

type AuthService struct {
	srp               *srp.SRP
	loginSessionStore map[string]authService.LoginSession

	config     *utils.Config
	groupStore *database.GroupStore
	userStore  *database.UserStore
}

func NewAuthService(config *utils.Config, groupStore *database.GroupStore, userStore *database.UserStore) *AuthService {
	srpInstance, _ := srp.NewSRP("rfc5054.2048", sha256.New, nil)
	return &AuthService{
		srp:               srpInstance,
		config:            config,
		groupStore:        groupStore,
		userStore:         userStore,
		loginSessionStore: make(map[string]authService.LoginSession),
	}
}

func (a *AuthService) CreateGroupJWT(groupID int) (string, error) {
	group, err := a.groupStore.GetGroup(groupID)
	if err != nil {
		if errors.Is(err, database.ErrGroupNotFound) {
			return "", groupService.ErrGroupNotFound
		}
		return "", err
	}

	claims := authService.GroupClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "super-santa",
			Subject:   "guest",
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(a.config.Auth.JWT.GroupExpire) * time.Second)),
		},
		GroupID: group.ID,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(a.config.Auth.JWT.Secret))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func (a *AuthService) VerifyGroupJWT(tokenString string) (groupID int, err error) {
	claims := &authService.GroupClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, &authService.InvalidTokenError{Err: errors.New("unexpected signing method")}
		}
		return []byte(a.config.Auth.JWT.Secret), nil
	})
	if err != nil {
		return -1, &authService.InvalidTokenError{Err: err}
	}
	if !token.Valid || claims.Subject != "guest" {
		return -1, &authService.InvalidTokenError{Err: errors.New("invalid token")}
	}

	return claims.GroupID, nil
}

func (a *AuthService) CreateAuthJWT(userID int) (string, error) {
	user, err := a.userStore.GetUser(userID)
	if err != nil {
		if errors.Is(err, database.ErrUserNotFound) {
			return "", userService.ErrUserNotFound
		}
		return "", err
	}

	claims := authService.AuthClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "super-santa",
			Subject:   strconv.Itoa(user.ID),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(a.config.Auth.JWT.AuthExpire) * time.Second)),
		},
		GroupID: user.GroupID,
		IsAdmin: user.IsAdmin,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(a.config.Auth.JWT.Secret))
}

func (a *AuthService) VerifyAuthJWT(tokenString string) (*authService.AuthClaims, error) {
	claims := &authService.AuthClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, &authService.InvalidTokenError{Err: errors.New("unexpected signing method")}
		}
		return []byte(a.config.Auth.JWT.Secret), nil
	})
	if err != nil {
		return nil, &authService.InvalidTokenError{Err: err}
	}
	if !token.Valid || claims.Subject == "guest" {
		return nil, &authService.InvalidTokenError{Err: errors.New("invalid token")}
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
		return nil, nil, authService.ErrSrpAuthenticator
	}

	// Compute server's authenticator to send back to client
	serverAuth = serverSession.ComputeAuthenticator(clientAuth)

	return sessionKey, serverAuth, nil
}

func (a *AuthService) srpGetChallenge(id string, verifier string) (serverSession *srp.ServerSession, challenge *authService.SrpChallenge, err error) {
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

	challenge = &authService.SrpChallenge{
		Salt:         hex.EncodeToString(salt),
		ServerPubKey: hex.EncodeToString(serverPubKey),
	}

	return serverSession, challenge, nil
}

func (a *AuthService) InitiateGroupLogin(groupID int) (sessionID string, challenge *authService.SrpChallenge, err error) {
	group, err := a.groupStore.GetGroup(groupID)
	if err != nil {
		if errors.Is(err, database.ErrGroupNotFound) {
			return "", nil, groupService.ErrGroupNotFound
		}
		return "", nil, err
	}

	serverSession, challenge, err := a.srpGetChallenge(strconv.Itoa(group.ID), group.SecretVerifier)
	if err != nil {
		return "", nil, err
	}

	sessionID = generateSessionID(authService.LoginSessionTypeGroup, groupID)
	a.loginSessionStore[sessionID] = authService.LoginSession{
		// FIXME: VULN  LoginType:     authService.LoginSessionTypeGroup,
		ServerSession: serverSession,
		ID:            groupID,
	}

	return sessionID, challenge, nil
}

func (a *AuthService) InitiateUserLogin(groupID int, email string) (sessionID string, challenge *authService.SrpChallenge, err error) {
	user, err := a.userStore.GetGroupUserByEmail(groupID, email)
	if err != nil {
		if errors.Is(err, database.ErrUserNotFound) {
			return "", nil, userService.ErrUserNotFound
		}
		return "", nil, err
	}

	serverSession, challenge, err := a.srpGetChallenge(user.Email, user.PasswordVerifier)
	if err != nil {
		return "", nil, err
	}

	sessionID = generateSessionID(authService.LoginSessionTypeUser, user.ID)
	a.loginSessionStore[sessionID] = authService.LoginSession{
		// FIXME: VULN  LoginType:     authService.LoginSessionTypeUser,
		ServerSession: serverSession,
		ID:            user.ID,
	}

	return sessionID, challenge, nil
}

func (a *AuthService) CompleteLogin(sessionID string, authData *authService.SrpAuth) (loginID int, session *authService.SrpSession, err error) {

	loginSession, exists := a.loginSessionStore[sessionID]
	if !exists {
		return -1, nil, &authService.InvalidSessionError{Err: errors.New("invalid session ID")}
	}

	// FIXME: VULN don't check for session type

	defer delete(a.loginSessionStore, sessionID)

	// Decode authentication data
	clientPubKey, err := hex.DecodeString(authData.ClientPubKey)
	if err != nil {
		return -1, nil, err
	}
	clientAuth, err := hex.DecodeString(authData.ClientAuth)
	if err != nil {
		return -1, nil, err
	}
	if len(clientPubKey) == 0 || len(clientAuth) == 0 {
		return -1, nil, errors.New("invalid authentication data")
	}

	// Verify the authenticator
	sessionKey, serverAuth, err := a.srpCompleteLogin(loginSession.ServerSession, clientPubKey, clientAuth)
	if err != nil {
		return -1, nil, err
	}

	return loginSession.ID, &authService.SrpSession{
		SessionKey: hex.EncodeToString(sessionKey),
		ServerAuth: hex.EncodeToString(serverAuth),
	}, nil
}

func generateSessionID(prefix authService.LoginSessionType, ID int) string {
	// Generate 32 random bytes (256 bits of entropy)
	randomBytes := make([]byte, 32)
	if _, err := rand.Read(randomBytes); err != nil {
		// Fall back to less secure method if secure random fails
		h := sha256.New()
		h.Write([]byte(time.Now().String()))
		randomBytes = h.Sum(nil)
	}

	return string(prefix) + "-" + hex.EncodeToString(randomBytes)
}
