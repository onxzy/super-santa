package models

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        int            `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"-"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	Username         string `json:"username" gorm:"uniqueIndex:idx_username_group"` // Username unique within group
	Email            string `json:"email"`
	PasswordVerifier string `json:"-"` // Password verifier for SRP

	GroupID int  `json:"-" gorm:"uniqueIndex:idx_username_group"` // Foreign key to group
	IsAdmin bool `json:"is_admin"`

	PublicKeySecret     string `json:"-"` // User public key encrypted with group secret
	PrivateKeyEncrypted string `json:"-"` // Encrypted user private key with password

	Wishes string `json:"wishes"`
}

// BeforeCreate hook to generate UUID
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	// Check if group exists
	var count int64
	if err := tx.Model(&Group{}).Where("id = ?", u.GroupID).Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		return errors.New("group does not exist")
	}

	return
}

// BeforeSave hook to enforce one admin per group
func (u *User) BeforeSave(tx *gorm.DB) error {
	if u.IsAdmin {
		var count int64
		// Check if another admin exists for this group
		if err := tx.Model(&User{}).Where("group_id = ? AND is_admin = ? AND id <> ?", u.GroupID, true, u.ID).Count(&count).Error; err != nil {
			return err
		}
		if count > 0 {
			return errors.New("group already has an admin")
		}
	}
	return nil
}
