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
	"go.uber.org/zap"
)

type GroupService struct {
	groupStore       *database.GroupStore
	drawSessionStore map[string]groupService.DrawSession
	mailService      *MailService
	logger           *zap.Logger
}

func NewGroupService(groupStore *database.GroupStore, mailService *MailService, logger *zap.Logger) *GroupService {
	return &GroupService{
		groupStore:       groupStore,
		drawSessionStore: make(map[string]groupService.DrawSession),
		mailService:      mailService,
		logger:           logger.Named("group-service"),
	}
}

func (s *GroupService) CreateGroup(group *models.Group, admin *models.User) error {
	group.Users = []models.User{*admin}
	group.Users[0].IsAdmin = true

	parts := strings.Split(group.SecretVerifier, ".")
	if len(parts) != 2 {
		return errors.New("verifier is not valid")
	}

	if err := s.groupStore.CreateGroup(group); err != nil {
		return err
	}

	// Send email notification to admin
	if err := s.mailService.SendGroupCreationNotification(group, admin); err != nil {
		s.logger.Error("Failed to send group creation email",
			zap.String("groupID", group.ID),
			zap.String("adminID", admin.ID),
			zap.Error(err))
		// Continue even if email fails
	}

	return nil
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

func (s *GroupService) InitDraw(groupID string) (publicKeys []string, err error) {
	group, err := s.GetGroup(groupID)
	if err != nil {
		return nil, err
	}

	// Get users from the group
	users := group.Users
	if len(users) < 3 {
		return nil, groupService.ErrNotEnoughUsers // 460
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

func (s *GroupService) FinishDraw(groupID string, publicKeys []string) (results []string, err error) {
	group, err := s.GetGroup(groupID)
	if err != nil {
		return nil, err
	}

	session, exists := s.drawSessionStore[groupID]
	if !exists {
		return nil, groupService.ErrDrawSessionNotFound // 461
	}

	defer delete(s.drawSessionStore, groupID)

	if len(publicKeys) != len(session.UserIDs) {
		return nil, &groupService.InvalidPublicKeyError{Err: errors.New("public keys do not match user IDs")} // 400
	}

	results = make([]string, len(session.UserIDs))
	for i, userID := range session.UserIDs {

		pubKey, err := jwk.ParseKey([]byte(publicKeys[i]))
		if err != nil {
			return nil, &groupService.InvalidPublicKeyError{Err: fmt.Errorf("failed to parse public key: %w", err)} // 400
		}

		if pubKey.KeyType() != jwa.RSA() {
			return nil, &groupService.InvalidPublicKeyError{Err: errors.New("invalid public key type")} // 400
		}

		if alg, exist := pubKey.Algorithm(); !exist || alg != jwa.RSA_OAEP_256() {
			return nil, &groupService.InvalidPublicKeyError{Err: errors.New("invalid public key algorithm")} // 400
		}

		encrypted, err := jwe.Encrypt([]byte(userID), jwe.WithKey(jwa.RSA_OAEP_256(), pubKey))
		if err != nil {
			return nil, fmt.Errorf("failed to encrypt user ID: %w", err) // 500
		}

		results[i] = string(encrypted)
	}

	group.Results = results
	// Create a copy of the group before updating
	groupCopy := *group
	if err := s.groupStore.UpdateGroup(groupCopy); err != nil {
		return nil, fmt.Errorf("failed to update group: %w", err)
	}

	if err := s.mailService.SendDrawCompletionNotification(group, group.Users); err != nil {
		s.logger.Error("Failed to send draw completion emails",
			zap.String("groupID", groupID),
			zap.Error(err))
	}

	return results, nil
}
