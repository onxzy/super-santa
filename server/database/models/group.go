package models

import (
	"database/sql/driver"
	"strings"
	"time"

	"gorm.io/gorm"
)

type Results []string

func (r *Results) Scan(src any) error {
	*r = strings.Split(src.(string), "\n")
	return nil
}

func (r Results) Value() (driver.Value, error) {
	if len(r) == 0 {
		return nil, nil
	}
	return strings.Join(r, "\n"), nil
}

type Group struct {
	ID        int            `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"-"`
	DeletedAt gorm.DeletedAt `gorm:"index"`

	Name           string `json:"name"`
	SecretVerifier string `json:"-"` // SRP Verifier for group's secret

	Results Results `json:"results" gorm:"type:text"` // Results of the draw

	Users []User `json:"users" gorm:"foreignKey:GroupID;constraint:OnDelete:CASCADE"`
}
