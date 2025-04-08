package controllers

import (
	"onxzy/super-santa-server/database/models"
	"onxzy/super-santa-server/middlewares"
	"onxzy/super-santa-server/services"
	"onxzy/super-santa-server/services/auth"
	"onxzy/super-santa-server/services/group"

	"github.com/gin-gonic/gin"
)

type GroupController struct {
	groupService *services.GroupService
}

func NewGroupController(groupService *services.GroupService) *GroupController {
	return &GroupController{
		groupService: groupService,
	}
}
func (gc *GroupController) RegisterRoutes(router *gin.RouterGroup, authMiddleware *middlewares.AuthMiddleware) {
	router.POST("/", gc.CreateGroup)
	router.GET("/info/:group_id", gc.GetGroupInfo)

	authRouter := router.Group("/").Use(authMiddleware.Auth)
	authRouter.GET("/", gc.GetGroup)
}

type CreateGroupRequest struct {
	Name           string            `json:"name" binding:"required"`
	SecretVerifier string            `json:"secret_verifier" binding:"required"`
	Admin          CreateUserRequest `json:"admin" binding:"required"`
}

type CreateUserRequest struct {
	Username         string `json:"username" binding:"required"`
	Email            string `json:"email" binding:"required,email"`
	PasswordVerifier string `json:"password_verifier" binding:"required"`

	PublicKeySecret     string `json:"public_key_secret" binding:"required"`
	PrivateKeyEncrypted string `json:"private_key_encrypted" binding:"required"`
}

// Create Group

type CreateGroupResponse = models.Group

func (gc *GroupController) CreateGroup(c *gin.Context) {
	// Validate request
	var req CreateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	group := &models.Group{
		Name:           req.Name,
		SecretVerifier: req.SecretVerifier,
		Results:        "",
	}

	admin := &models.User{
		Username:            req.Admin.Username,
		Email:               req.Admin.Email,
		PasswordVerifier:    req.Admin.PasswordVerifier,
		PublicKeySecret:     req.Admin.PublicKeySecret,
		PrivateKeyEncrypted: req.Admin.PrivateKeyEncrypted,
		IsAdmin:             true,
	}

	if err := gc.groupService.CreateGroup(group, admin); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Return group
	c.JSON(201, group)
}

// Get Group Info

type GetGroupInfoResponse = group.GroupInfo

func (gc *GroupController) GetGroupInfo(c *gin.Context) {
	// Get group ID from URL
	groupID := c.Param("group_id")
	// Get group info from service
	groupInfo, err := gc.groupService.GetGroupInfo(groupID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	// Return group info
	c.JSON(200, groupInfo)
}

// Get Group

func (gc *GroupController) GetGroup(c *gin.Context) {
	claims := c.MustGet("claims").(*auth.AuthClaims)
	groupID := claims.GroupID

	// Get group from service
	group, err := gc.groupService.GetGroup(groupID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, group)

	// // Convert users to DTOs
	// userDTOs := make([]dto.UserDTO, len(group.Users))
	// for i, user := range group.Users {
	// 	userDTOs[i] = dto.UserDTO{
	// 		ID:       user.ID,
	// 		Username: user.Username,
	// 		Email:    user.Email,
	// 		IsAdmin:  user.IsAdmin,
	// 	}
	// }

	// // Return group
	// c.JSON(200, &dto.GetGroupResponse{
	// 	ID:        group.ID,
	// 	CreatedAt: group.CreatedAt,
	// 	Name:      group.Name,
	// 	Results:   group.Results,
	// 	Users:     userDTOs,
	// })
}

func (gc *GroupController) JoinGroup(c *gin.Context) {

}

func (gc *GroupController) UpdateWishes(c *gin.Context) {

}
