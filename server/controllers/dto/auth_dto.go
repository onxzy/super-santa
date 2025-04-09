package dto

import (
	"onxzy/super-santa-server/services/authService"
	"time"
)

type GetUserResponse struct {
	ID        int       `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Username string `json:"username"`
	Email    string `json:"email"`

	GroupID int  `json:"group_id"`
	IsAdmin bool `json:"is_admin"`

	PublicKeySecret     string `json:"public_key_secret"`     // User public key encrypted with group secret
	PrivateKeyEncrypted string `json:"private_key_encrypted"` // Encrypted user private key with password

	Wishes string `json:"wishes"`
}

type GetGroupAuthRequest struct {
	GroupToken string `json:"group_token" binding:"required"`
}

type GetGroupAuthResponse struct {
	GroupID int `json:"group_id"`
}

type GetGroupChallengeResponse struct {
	SessionID string                   `json:"session_id"`
	Challenge authService.SrpChallenge `json:"group_challenge"`
}

type GroupLoginRequest struct {
	SessionID string `json:"session_id" binding:"required"`
	GroupAuth struct {
		ClientPubKey string `json:"client_pub_key" binding:"required"`
		ClientAuth   string `json:"client_auth" binding:"required"`
	} `json:"group_auth" binding:"required"`
}

type GroupLoginResponse struct {
	Token      string `json:"token"`
	ServerAuth string `json:"server_auth"`
}

type GetLoginChallengeRequest struct {
	GroupToken string `json:"group_token" binding:"required"`
	Email      string `json:"email" binding:"required,email"`
}

type GetLoginChallengeResponse struct {
	SessionID string                   `json:"session_id"`
	Challenge authService.SrpChallenge `json:"user_challenge"`
}

type LoginRequest struct {
	SessionID string `json:"session_id" binding:"required"`
	UserAuth  struct {
		ClientPubKey string `json:"client_pub_key" binding:"required"`
		ClientAuth   string `json:"client_auth" binding:"required"`
	} `json:"user_auth" binding:"required"`
}

type LoginResponse struct {
	ServerAuth string `json:"server_auth"`
	Token      string `json:"token"`
}
