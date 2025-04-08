package auth

import "errors"

var (
	ErrSrpAuthenticator = errors.New("bad SRP authenticator")
)

type InvalidTokenError struct {
	Err error
}

func (e *InvalidTokenError) Error() string {
	return "invalid token: " + e.Err.Error()
}

type InvalidSessionError struct {
	Err error
}

func (e *InvalidSessionError) Error() string {
	return "invalid session: " + e.Err.Error()
}
