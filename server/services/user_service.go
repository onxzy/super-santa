package services

import (
	"errors"
	"onxzy/super-santa-server/database"
	"onxzy/super-santa-server/database/models"
	"onxzy/super-santa-server/services/groupService"
	"onxzy/super-santa-server/services/userService"

	"go.uber.org/zap"
)

type UserService struct {
	userStore   *database.UserStore
	groupStore  *database.GroupStore
	mailService *MailService
	logger      *zap.Logger
}

func NewUserService(userStore *database.UserStore, groupStore *database.GroupStore, mailService *MailService, logger *zap.Logger) *UserService {
	return &UserService{
		userStore:   userStore,
		groupStore:  groupStore,
		mailService: mailService,
		logger:      logger.Named("user-service"),
	}
}

func (s *UserService) GetUser(userID string) (*models.User, error) {
	user, err := s.userStore.GetUser(userID)
	if err != nil {
		if errors.Is(err, database.ErrUserNotFound) {
			return nil, userService.ErrUserNotFound
		}
		return nil, err
	}

	return user, nil
}

func (s *UserService) CreateUser(user *models.User) error {
	group, err := s.groupStore.GetGroup(user.GroupID)
	if err != nil {
		if errors.Is(err, database.ErrGroupNotFound) {
			return groupService.ErrGroupNotFound
		}
		return err
	}

	if err := s.userStore.CreateUser(user); err != nil {
		if errors.Is(err, database.ErrUserAlreadyExists) {
			return userService.ErrUserAlreadyExists
		}
		return err
	}

	// Find the admin user to notify
	var adminUser *models.User
	for _, groupUser := range group.Users {
		if groupUser.IsAdmin {
			adminCopy := groupUser // Create a copy to avoid memory issues with pointer in the loop
			adminUser = &adminCopy
			break
		}
	}

	if adminUser == nil {
		s.logger.Error("No admin found for group", zap.String("groupID", group.ID))
	} else {
		// Send email notifications
		if err := s.mailService.SendUserJoinedNotification(group, user, adminUser); err != nil {
			s.logger.Error("Failed to send user joined emails",
				zap.String("groupID", group.ID),
				zap.String("userID", user.ID),
				zap.Error(err))
			// Continue even if email fails
		}
	}

	return nil
}

func (s *UserService) UpdateUser(user *models.User) error {
	if err := s.userStore.UpdateUser(user); err != nil {
		if errors.Is(err, database.ErrUserNotFound) {
			return userService.ErrUserNotFound
		}
		return err
	}

	return nil
}

func (s *UserService) DeleteUser(userID string) error {
	return s.userStore.DeleteUser(userID)
}
