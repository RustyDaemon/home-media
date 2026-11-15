package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `gorm:"autoCreateTime" json:"-"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime" json:"-"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Username           string `gorm:"unique;not null" json:"username"`
	PasswordHash       string `gorm:"not null" json:"-"`
	MustChangePassword bool   `gorm:"default:false" json:"must_change_password"`
	IsGuest            bool   `gorm:"default:false" json:"is_guest"`
	DefaultLanguageID  *uint  `gorm:"default:null" json:"default_language_id"`

	// Relations
	DefaultLanguage *LanguageOption `gorm:"foreignKey:DefaultLanguageID" json:"default_language,omitempty"`
}
