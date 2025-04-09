package groupService

import "errors"

var (
	ErrGroupNotFound       = errors.New("group not found")
	ErrNotEnoughUsers      = errors.New("not enough users")
	ErrDrawSessionNotFound = errors.New("draw session not found")
)

type InvalidPublicKeyError struct {
	Err error
}

func (e *InvalidPublicKeyError) Error() string {
	return "invalid public key: " + e.Err.Error()
}
