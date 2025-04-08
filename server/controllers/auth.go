package controllers

import (
	"errors"
	"onxzy/super-santa-server/controllers/dto"
	"onxzy/super-santa-server/middlewares"
	"onxzy/super-santa-server/services"
	"onxzy/super-santa-server/services/auth"
	"onxzy/super-santa-server/services/group"
	"onxzy/super-santa-server/services/user"
	"onxzy/super-santa-server/utils"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	config       *utils.Config
	groupService *services.GroupService
	authService  *services.AuthService
	userService  *services.UserService
}

func NewAuthController(confg *utils.Config, groupService *services.GroupService, authService *services.AuthService, userService *services.UserService) *AuthController {
	return &AuthController{
		config:       confg,
		groupService: groupService,
		authService:  authService,
		userService:  userService,
	}
}

func (ac *AuthController) RegisterRoutes(router *gin.RouterGroup, authMiddleware *middlewares.AuthMiddleware) {
	router.GET("/group/:group_id/challenge", ac.GetGroupChallenge)
	router.POST("/group", ac.PostGroupLogin)
	router.GET("/group", ac.GetGroup)

	router.POST("/login/challenge", ac.GetLoginChallenge)
	router.POST("/login", ac.PostUserLogin)
	router.GET("/login", authMiddleware.Auth, ac.GetUser)
}

// GetUser
func (ac *AuthController) GetUser(c *gin.Context) {
	claims := c.MustGet("claims").(*auth.AuthClaims)
	u, err := ac.userService.GetUser(claims.Subject)
	if err != nil {
		if errors.Is(err, user.ErrUserNotFound) {
			c.JSON(404, gin.H{"error": err.Error()})
			return
		}

		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, &dto.GetUserResponse{
		ID:        u.ID,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,

		Username: u.Username,
		Email:    u.Email,

		GroupID: u.GroupID,
		IsAdmin: u.IsAdmin,

		PublicKeySecret:     u.PublicKeySecret,
		PrivateKeyEncrypted: u.PrivateKeyEncrypted,

		Wishes: u.Wishes,
	})
}

// Group Auth

func (ac *AuthController) GetGroup(c *gin.Context) {
	// Get the Authorization header
	var req dto.GetGroupAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	groupID, err := ac.authService.VerifyGroupJWT(req.GroupToken)
	if err != nil {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	c.JSON(200, dto.GetGroupAuthResponse{GroupID: groupID})
}

// Group Challenge

func (ac *AuthController) GetGroupChallenge(c *gin.Context) {
	groupID := c.Param("group_id")
	if groupID == "" {
		c.JSON(400, gin.H{"error": "group_id is required"})
		return
	}

	sessionID, groupChallenge, err := ac.authService.InitiateGroupLogin(groupID)
	if err != nil {
		if errors.Is(err, group.ErrGroupNotFound) {
			c.JSON(404, gin.H{"error": err.Error()})
			return
		}

		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, dto.GetGroupChallengeResponse{
		SessionID: sessionID,
		Challenge: *groupChallenge,
	})
}

// Group Login

func (ac *AuthController) PostGroupLogin(c *gin.Context) {
	var req dto.GroupLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	groupAuth := &auth.SrpAuth{
		ClientPubKey: req.GroupAuth.ClientPubKey,
		ClientAuth:   req.GroupAuth.ClientAuth,
	}

	groupID, session, err := ac.authService.CompleteLogin(auth.LoginSessionTypeGroup, req.SessionID, groupAuth)
	if err != nil {
		var invalidSession *auth.InvalidSessionError
		if errors.As(err, &invalidSession) {
			c.JSON(401, gin.H{"error": "Unauthorized", "details": invalidSession.Error()})
			return
		}
		if errors.Is(err, auth.ErrSrpAuthenticator) {
			c.JSON(403, gin.H{"error": "Forbidden"})
			return
		}

		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	token, err := ac.authService.CreateGroupJWT(groupID)
	if err != nil {
		if errors.Is(err, group.ErrGroupNotFound) {
			c.JSON(404, gin.H{"error": err.Error()})
			return
		}

		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.SetCookie("auth", token, 3600, "/", "", false, true)
	c.JSON(200, dto.GroupLoginResponse{
		Token:      token,
		ServerAuth: session.ServerAuth,
	})
}

// Login Challenge

func (ac *AuthController) GetLoginChallenge(c *gin.Context) {
	var req dto.GetLoginChallengeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	groupID, err := ac.authService.VerifyGroupJWT(req.GroupToken)
	if err != nil {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	sessionID, challenge, err := ac.authService.InitiateUserLogin(groupID, req.Email)
	if err != nil {
		if errors.Is(err, user.ErrUserNotFound) {
			c.JSON(404, gin.H{"error": err.Error()})
			return
		}

		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, dto.GetLoginChallengeResponse{
		SessionID: sessionID,
		Challenge: *challenge,
	})

}

// User Login

func (ac *AuthController) PostUserLogin(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	userAuth := &auth.SrpAuth{
		ClientPubKey: req.UserAuth.ClientPubKey,
		ClientAuth:   req.UserAuth.ClientAuth,
	}

	userID, session, err := ac.authService.CompleteLogin(auth.LoginSessionTypeUser, req.SessionID, userAuth)
	if err != nil {
		var invalidSession *auth.InvalidSessionError
		if errors.As(err, &invalidSession) {
			c.JSON(401, gin.H{"error": "Unauthorized", "details": invalidSession.Error()})
			return
		}
		if errors.Is(err, auth.ErrSrpAuthenticator) {
			c.JSON(403, gin.H{"error": "Forbidden"})
			return
		}

		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	token, err := ac.authService.CreateAuthJWT(userID)
	if err != nil {
		if errors.Is(err, user.ErrUserNotFound) {
			c.JSON(404, gin.H{"error": err.Error()})
			return
		}

		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, dto.LoginResponse{
		ServerAuth: session.ServerAuth,
		Token:      token,
	})
}
