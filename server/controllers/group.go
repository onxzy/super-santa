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

	authRouter := router.Group("").Use(authMiddleware.Auth)
	authRouter.GET("", gc.GetGroup)
	authRouter.PUT("/wishes", gc.UpdateWishes)
	authRouter.GET("/draw", gc.InitDraw)
	authRouter.POST("/draw", gc.FinishDraw)
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
		Results:        nil,
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
		// TODO: Add error handling
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
	claims := c.MustGet("claims").(*authService.AuthClaims)
	userID := claims.Subject

	var req dto.UpdateWishesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Get user from service
	user, err := gc.userService.GetUser(userID)
	if err != nil {
		if err == userService.ErrUserNotFound {
			c.JSON(404, gin.H{"error": "User not found"})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Update user
	user.Wishes = req.Wishes
	if err := gc.userService.UpdateUser(user); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, &dto.UpdateWishesResponse{
		Wishes: user.Wishes,
	})
}

// TODO: Add error handling
func (gc *GroupController) InitDraw(c *gin.Context) {
	claims := c.MustGet("claims").(*authService.AuthClaims)
	groupID := claims.GroupID

	if !claims.IsAdmin {
		c.JSON(403, gin.H{"error": "Forbidden"})
		return
	}

	// Get group from service
	group, err := gc.groupService.GetGroup(groupID)
	if err != nil {
		if err == groupService.ErrGroupNotFound {
			c.JSON(404, gin.H{"error": "Group not found"})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	if group.Results != nil {
		c.JSON(409, gin.H{"error": "Draw already done"})
		return
	}

	publicKeys, err := gc.groupService.InitDraw(groupID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, &dto.InitDrawResponse{
		PublicKeysSecret: publicKeys,
	})
}

// TODO: Add error handling
func (gc *GroupController) FinishDraw(c *gin.Context) {
	claims := c.MustGet("claims").(*authService.AuthClaims)
	groupID := claims.GroupID

	if !claims.IsAdmin {
		c.JSON(403, gin.H{"error": "Forbidden"})
		return
	}

	group, err := gc.groupService.GetGroup(groupID)
	if err != nil {
		if err == groupService.ErrGroupNotFound {
			c.JSON(404, gin.H{"error": "Group not found"})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	if group.Results != nil {
		c.JSON(409, gin.H{"error": "Draw already done"})
		return
	}

	var req dto.FinishDrawRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if _, err := gc.groupService.FinishDraw(groupID, req.PublicKeys); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.Status(200)
}
