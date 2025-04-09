package authService

import (
	"github.com/golang-jwt/jwt/v4"
	"github.com/tadglines/go-pkgs/crypto/srp"
)

type GroupClaims struct {
	jwt.RegisteredClaims
	GroupID int `json:"group_id"`
}

type AuthClaims struct {
	jwt.RegisteredClaims
	GroupID int    `json:"group_id"`
	Email   string `json:"email"`
	IsAdmin bool   `json:"is_admin"`
}

type LoginSessionType string

const (
	LoginSessionTypeGroup LoginSessionType = "group"
	LoginSessionTypeUser  LoginSessionType = "user"
)

type LoginSession struct {
	// FIXME: VULN LoginType     LoginSessionType
	ServerSession *srp.ServerSession
	ID            int
}

type SrpChallenge struct {
	Salt         string `json:"salt"`
	ServerPubKey string `json:"server_pub_key"`
}

type SrpAuth struct {
	ClientPubKey string `json:"client_pub_key"`
	ClientAuth   string `json:"client_auth"`
}

type SrpSession struct {
	ServerAuth string `json:"server_auth"`
	SessionKey string `json:"session_key"`
}
