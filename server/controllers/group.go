package controllers

import (
	"onxzy/super-santa-server/controllers/dto"
	"onxzy/super-santa-server/database/models"
	"onxzy/super-santa-server/middlewares"
	"onxzy/super-santa-server/services"
	"onxzy/super-santa-server/services/authService"
	"onxzy/super-santa-server/services/groupService"
	"onxzy/super-santa-server/services/userService"

	"github.com/gin-gonic/gin"
)

type GroupController struct {
	authService  *services.AuthService
	groupService *services.GroupService
	userService  *services.UserService
}

func NewGroupController(groupService *services.GroupService, authService *services.AuthService, userService *services.UserService) *GroupController {
	return &GroupController{
		groupService: groupService,
		authService:  authService,
		userService:  userService,
	}
}
func (gc *GroupController) RegisterRoutes(router *gin.RouterGroup, authMiddleware *middlewares.AuthMiddleware) {
	router.POST("", gc.CreateGroup)
	router.GET("/info/:group_id", gc.GetGroupInfo)
	router.POST("/join", gc.JoinGroup)

	authRouter := router.Group("/").Use(authMiddleware.Auth)
	authRouter.GET("", gc.GetGroup)
}

// Create Group

type CreateGroupResponse = models.Group

func (gc *GroupController) CreateGroup(c *gin.Context) {
	// Validate request
	var req dto.CreateGroupRequest
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
		// FIXME: Handle error properly
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Return group
	c.JSON(201, group)
}

// Get Group Info

type GetGroupInfoResponse = groupService.GroupInfo

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
	claims := c.MustGet("claims").(*authService.AuthClaims)
	groupID := claims.GroupID

	// Get group from service
	group, err := gc.groupService.GetGroup(groupID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, group)
}

func (gc *GroupController) JoinGroup(c *gin.Context) {
	req := &dto.JoinGroupRequest{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// FIXME: Get groupID
	groupID, err := gc.authService.VerifyGroupJWT(req.GroupToken)
	if err != nil {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	// Check that group exists
	_, err = gc.groupService.GetGroup(groupID)
	if err != nil {
		if err == groupService.ErrGroupNotFound {
			c.JSON(404, gin.H{"error": "Group not found"})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	user := &models.User{
		Username:            req.User.Username,
		Email:               req.User.Email,
		PasswordVerifier:    req.User.PasswordVerifier,
		PublicKeySecret:     req.User.PublicKeySecret,
		PrivateKeyEncrypted: req.User.PrivateKeyEncrypted,
		GroupID:             groupID,
		IsAdmin:             false,
	}

	err = gc.userService.CreateUser(user)
	if err != nil {
		if err == userService.ErrUserAlreadyExists {
			c.JSON(409, gin.H{"error": "User already exists"})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, user)

}

func (gc *GroupController) UpdateWishes(c *gin.Context) {

}
