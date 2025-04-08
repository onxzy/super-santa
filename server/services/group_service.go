package services

import (
	"errors"
	"onxzy/super-santa-server/database"
	"onxzy/super-santa-server/database/models"
	"onxzy/super-santa-server/services/groupService"
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
