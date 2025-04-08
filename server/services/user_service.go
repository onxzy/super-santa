package services

import (
	"errors"
	"onxzy/super-santa-server/database"
	"onxzy/super-santa-server/database/models"
	"onxzy/super-santa-server/services/userService"
)

type UserService struct {
	userStore *database.UserStore
}

func NewUserService(userStore *database.UserStore) *UserService {
	return &UserService{
		userStore: userStore,
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
	if err := s.userStore.CreateUser(user); err != nil {
		if errors.Is(err, database.ErrUserAlreadyExists) {
			return userService.ErrUserAlreadyExists
		}
		return err
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
