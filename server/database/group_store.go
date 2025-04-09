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
	ErrGroupNotFound = errors.New("group not found")
)

func NewGroupStore(lc fx.Lifecycle, db *DB) *GroupStore {
	s := &GroupStore{db: db}

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			if err := db.gorm.AutoMigrate(&models.Group{}); err != nil {
				return err
			}
			return nil
		},
	})

	return s
}

func (s *GroupStore) CreateGroup(group *models.Group) error {
	return s.db.gorm.Create(group).Error
}

func (s *GroupStore) GetGroup(id int) (*models.Group, error) {
	var group models.Group
	if err := s.db.gorm.Preload("Users").Where("ID = ?", id).First(&group).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrGroupNotFound
		}
		return nil, err
	}
	return &group, nil
}

func (s *GroupStore) UpdateGroup(group models.Group) error {
	group.Users = nil // Clear the Users field to avoid updating it
	return s.db.gorm.Save(group).Error
}

func (s *GroupStore) DeleteGroup(id int) error {
	return s.db.gorm.Delete(&models.Group{}, id).Error
}

func (s *GroupStore) GetAllGroups() ([]models.Group, error) {
	var groups []models.Group
	if err := s.db.gorm.Find(&groups).Error; err != nil {
		return nil, err
	}
	return groups, nil
}
