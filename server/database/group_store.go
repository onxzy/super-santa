package database

import (
	"context"
	"errors"
	"onxzy/super-santa-server/database/models"

	"go.uber.org/fx"
	"gorm.io/gorm"
)

type GroupStore struct {
	db *DB
}

var (
	ErrGroupNotFound     = errors.New("group not found")
	ErrUserNotFound      = errors.New("user not found")
	ErrUserAlreadyExists = errors.New("user already exists")
)

func NewRoomStore(lc fx.Lifecycle, db *DB) *GroupStore {
	s := &GroupStore{db: db}

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			if err := db.gorm.AutoMigrate(&models.Group{}, &models.User{}); err != nil {
				return err
			}
			return nil
		},
	})

	return s
}

// Room

func (s *GroupStore) CreateGroup(group *models.Group) error {
	return s.db.gorm.Create(group).Error
}

func (s *GroupStore) GetGroup(id string) (*models.Group, error) {
	var group models.Group
	if err := s.db.gorm.Preload("Users").Where("ID = ?", id).First(&group).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrGroupNotFound
		}
		return nil, err
	}
	return &group, nil
}

func (s *GroupStore) DeleteGroup(id string) error {
	return s.db.gorm.Delete(&models.Group{}, id).Error
}

func (s *GroupStore) GetAllGroups() ([]models.Group, error) {
	var groups []models.Group
	if err := s.db.gorm.Find(&groups).Error; err != nil {
		return nil, err
	}
	return groups, nil
}

// User

func (s *GroupStore) CreateUser(user *models.User) error {
	return s.db.gorm.Create(user).Error
}

func (s *GroupStore) GetUser(id string) (*models.User, error) {
	var user models.User
	if err := s.db.gorm.Where("ID = ?", id).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (s *GroupStore) GetGroupUserByEmail(groupID string, email string) (*models.User, error) {
	var user models.User
	if err := s.db.gorm.Where("email = ? AND group_id = ?", email, groupID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (s *GroupStore) GetGroupUsers(roomID string) ([]models.User, error) {
	var users []models.User
	if err := s.db.gorm.Where("group_id = ?", roomID).Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (s *GroupStore) UpdateUser(user *models.User) error {
	return s.db.gorm.Save(user).Error
}

func (s *GroupStore) DeleteUser(id string) error {
	return s.db.gorm.Delete(&models.User{}, id).Error
}
