package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Group struct {
	ID        string         `gorm:"primaryKey" json:"id"` // ID is a UUID v4 string
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"-"`
	DeletedAt gorm.DeletedAt `gorm:"index"`

	Name           string `json:"name"`
	SecretVerifier string `json:"-"` // SRP Verifier for group's secret

	Results string `json:"results"`

	Users []User `json:"users" gorm:"foreignKey:GroupID;constraint:OnDelete:CASCADE"`
}

func (group *Group) BeforeCreate(tx *gorm.DB) (err error) {
	// UUID version 4
	group.ID = uuid.NewString()
	return
}
