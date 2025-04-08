package dto

type CreateUserRequest struct {
	Username         string `json:"username" binding:"required"`
	Email            string `json:"email" binding:"required,email"`
	PasswordVerifier string `json:"password_verifier" binding:"required"`

	PublicKeySecret     string `json:"public_key_secret" binding:"required"`
	PrivateKeyEncrypted string `json:"private_key_encrypted" binding:"required"`
}

type UpdateWishesRequest struct {
	Wishes string `json:"wishes" binding:"required"`
}

type UpdateWishesResponse struct {
	Wishes string `json:"wishes"`
}
