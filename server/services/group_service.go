package services

import (
	"crypto/rand"
	"errors"
	"fmt"
	"onxzy/super-santa-server/database"
	"onxzy/super-santa-server/database/models"
	"onxzy/super-santa-server/services/groupService"
	"strings"

	"github.com/lestrrat-go/jwx/v3/jwa"
	"github.com/lestrrat-go/jwx/v3/jwe"
	"github.com/lestrrat-go/jwx/v3/jwk"
)

type GroupService struct {
	groupStore       *database.GroupStore
	drawSessionStore map[string]groupService.DrawSession
}

func NewGroupService(groupStore *database.GroupStore) *GroupService {
	return &GroupService{
		groupStore:       groupStore,
		drawSessionStore: make(map[string]groupService.DrawSession),
	}
}

func (s *GroupService) CreateGroup(group *models.Group, admin *models.User) error {
	group.Users = []models.User{*admin}
	group.Users[0].IsAdmin = true

	parts := strings.Split(group.SecretVerifier, ".")
	if len(parts) != 2 {
		return errors.New("verifier is not valid")
	}

	return s.groupStore.CreateGroup(group)
}

func (s *GroupService) GetGroup(groupID string) (*models.Group, error) {
	group, err := s.groupStore.GetGroup(groupID)
	if err != nil {
		if errors.Is(err, database.ErrGroupNotFound) {
			return nil, groupService.ErrGroupNotFound
		}
		return nil, err
	}

	return group, nil
}

func (s *GroupService) GetGroupInfo(groupID string) (*groupService.GroupInfo, error) {
	group, err := s.groupStore.GetGroup(groupID)
	if err != nil {
		if errors.Is(err, database.ErrGroupNotFound) {
			return nil, groupService.ErrGroupNotFound
		}
		return nil, err
	}

	return &groupService.GroupInfo{
		ID:   group.ID,
		Name: group.Name,
	}, nil
}

// TODO: Custom error types
func (s *GroupService) InitDraw(groupID string) (publicKeys []string, err error) {
	group, err := s.GetGroup(groupID)
	if err != nil {
		return nil, err
	}

	// Get users from the group
	users := group.Users
	if len(users) < 3 {
		return nil, errors.New("not enough users for a draw") // 460
	}

	// Shuffle the users list
	// Fisher-Yates shuffle implementation using crypto/rand for secure randomness
	for i := len(users) - 1; i > 0; i-- {
		var randomBytes [8]byte
		if _, err := rand.Read(randomBytes[:]); err != nil {
			return nil, fmt.Errorf("failed to generate random number: %w", err) // 500
		}

		// Convert bytes to an integer and get random index in range [0, i]
		var randomInt uint64
		for k, b := range randomBytes {
			randomInt |= uint64(b) << (8 * k)
		}
		j := int(randomInt % uint64(i+1))

		// Swap elements
		users[i], users[j] = users[j], users[i]
	}

	// Create a list of user IDs for the draw session
	userIDs := make([]string, len(users))
	for i, user := range users {
		userIDs[i] = user.ID
	}

	// Create and store the draw session
	s.drawSessionStore[groupID] = groupService.DrawSession{
		UserIDs: userIDs,
	}

	// Return a list of public key secrets
	publicKeySecrets := make([]string, len(users))
	for i, user := range users {
		publicKeySecrets[i] = user.PublicKeySecret
	}

	return publicKeySecrets, nil
}

// TODO: Custom error types
func (s *GroupService) FinishDraw(groupID string, publicKeys []string) (results []string, err error) {
	group, err := s.GetGroup(groupID)
	if err != nil {
		return nil, err
	}

	session, exists := s.drawSessionStore[groupID]
	if !exists {
		return nil, errors.New("draw session does not exist") // 461
	}

	defer delete(s.drawSessionStore, groupID)

	if len(publicKeys) != len(session.UserIDs) {
		return nil, errors.New("public keys do not match user IDs") // 400
	}

	results = make([]string, len(session.UserIDs))
	for i, userID := range session.UserIDs {

		pubKey, err := jwk.ParseKey([]byte(publicKeys[i]))
		if err != nil {
			return nil, fmt.Errorf("failed to parse public key: %w", err) // 400
		}

		if pubKey.KeyType() != jwa.RSA() {
			return nil, fmt.Errorf("invalid public key type") // 400
		}

		if alg, exist := pubKey.Algorithm(); !exist || alg != jwa.RSA_OAEP_256() {
			return nil, fmt.Errorf("invalid public key algorithm") // 400
		}

		encrypted, err := jwe.Encrypt([]byte(userID), jwe.WithKey(jwa.RSA_OAEP_256(), pubKey))
		if err != nil {
			return nil, fmt.Errorf("failed to encrypt user ID: %w", err) // 500
		}

		results[i] = string(encrypted)
	}

	group.Results = results
	if err := s.groupStore.UpdateGroup(group); err != nil {
		return nil, fmt.Errorf("failed to update group: %w", err)
	}

	return results, nil
}
