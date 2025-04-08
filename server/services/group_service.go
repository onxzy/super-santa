package services

import (
	"errors"
	"onxzy/super-santa-server/database"
	"onxzy/super-santa-server/database/models"
	"onxzy/super-santa-server/services/group"
	"strings"
)

type GroupService struct {
	groupStore *database.GroupStore
}

func NewGroupService(groupStore *database.GroupStore) *GroupService {
	return &GroupService{
		groupStore: groupStore,
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
	g, err := s.groupStore.GetGroup(groupID)
	if err != nil {
		if errors.Is(err, database.ErrGroupNotFound) {
			return nil, group.ErrGroupNotFound
		}
		return nil, err
	}

	return g, nil
}

func (s *GroupService) GetGroupInfo(groupID string) (*group.GroupInfo, error) {
	g, err := s.groupStore.GetGroup(groupID)
	if err != nil {
		if errors.Is(err, database.ErrGroupNotFound) {
			return nil, group.ErrGroupNotFound
		}
		return nil, err
	}

	return &group.GroupInfo{
		ID:   g.ID,
		Name: g.Name,
	}, nil
}
