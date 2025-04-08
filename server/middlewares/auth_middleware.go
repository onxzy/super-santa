package middlewares

import (
	"onxzy/super-santa-server/services"
	"onxzy/super-santa-server/utils"

	"github.com/gin-gonic/gin"
)

type AuthMiddleware struct {
	authService *services.AuthService
	config      *utils.Config
}

func NewAuthMiddleware(authService *services.AuthService, config *utils.Config) *AuthMiddleware {
	return &AuthMiddleware{
		authService: authService,
		config:      config,
	}
}

func (am *AuthMiddleware) Auth(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		c.Abort()
		return
	}

	// Check if the header starts with "Bearer "
	const bearerPrefix = "Bearer "
	if len(authHeader) <= len(bearerPrefix) || authHeader[:len(bearerPrefix)] != bearerPrefix {
		c.JSON(401, gin.H{"error": "Invalid authorization format"})
		c.Abort()
		return
	}

	// Extract the token
	token := authHeader[len(bearerPrefix):]

	claims, err := am.authService.VerifyAuthJWT(token)
	if err != nil {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		c.Abort()
		return
	}

	c.Set("claims", claims)
}
