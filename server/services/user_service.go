package services

import (
	"errors"
	"onxzy/super-santa-server/database"
	"onxzy/super-santa-server/database/models"
	"onxzy/super-santa-server/services/user"
)

type UserService struct {
	groupStore *database.GroupStore
}

func NewUserService(groupStore *database.GroupStore) *UserService {
	return &UserService{
		groupStore: groupStore,
	}
}

func (s *UserService) GetUser(userID string) (*models.User, error) {
	u, err := s.groupStore.GetUser(userID)
	if err != nil {
		if errors.Is(err, database.ErrUserNotFound) {
			return nil, user.ErrUserNotFound
		}
		return nil, err
	}

	return u, nil
}
