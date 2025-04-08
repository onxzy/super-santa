package database

import (
	"context"
	"errors"
	"onxzy/super-santa-server/database/models"
	"strings"

	"go.uber.org/fx"
	"gorm.io/gorm"
)

type UserStore struct {
	db *DB
}

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrUserAlreadyExists = errors.New("user already exists")
)

func NewUserStore(lc fx.Lifecycle, db *DB) *UserStore {
	s := &UserStore{db: db}

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			if err := db.gorm.AutoMigrate(&models.User{}); err != nil {
				return err
			}
			return nil
		},
	})

	return s
}

// User

func (s *UserStore) CreateUser(user *models.User) error {
	if err := s.db.gorm.Create(user).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return ErrUserAlreadyExists
		}
		if strings.Contains(err.Error(), "UNIQUE constraint") {
			return ErrUserAlreadyExists
		}
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrGroupNotFound
		}
		return err
	}
	return nil
}

func (s *UserStore) GetUser(id string) (*models.User, error) {
	var user models.User
	if err := s.db.gorm.Where("ID = ?", id).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (s *UserStore) GetGroupUserByEmail(groupID string, email string) (*models.User, error) {
	var user models.User
	if err := s.db.gorm.Where("email = ? AND group_id = ?", email, groupID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (s *UserStore) GetGroupUsers(groupID string) ([]models.User, error) {
	var users []models.User
	if err := s.db.gorm.Where("group_id = ?", groupID).Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (s *UserStore) UpdateUser(user *models.User) error {
	return s.db.gorm.Save(user).Error
}

func (s *UserStore) DeleteUser(id string) error {
	return s.db.gorm.Delete(&models.User{}, id).Error
}
