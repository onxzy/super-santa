package dto

import (
	"onxzy/super-santa-server/database/models"
)

type CreateGroupRequest struct {
	Name           string            `json:"name" binding:"required"`
	SecretVerifier string            `json:"secret_verifier" binding:"required"`
	Admin          CreateUserRequest `json:"admin" binding:"required"`
}

type GetGroupResponse = models.Group

type JoinGroupRequest struct {
	GroupToken string            `json:"group_token" binding:"required"`
	User       CreateUserRequest `json:"user" binding:"required"`
}

type JoinGroupResponse = models.Group
