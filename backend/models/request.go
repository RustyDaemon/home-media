package models

import (
	"time"

	"gorm.io/gorm"
)

// Request represents a media request in the system
type Request struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `gorm:"autoCreateTime" json:"-"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime" json:"-"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	CreatedAtUnix int64 `gorm:"-" json:"created_at"`
	UpdatedAtUnix int64 `gorm:"-" json:"updated_at"`

	Title   string `json:"title"`
	URL     string `json:"url"`
	Comment string `json:"comment"`
	Status  string `gorm:"default:'Awaiting'" json:"status"` // "Awaiting", "Approved", "Declined", "Bought"

	UserID   uint   `gorm:"not null" json:"user_id"`
	Username string `gorm:"-" json:"username"` // Populated from User relation

	// Relations
	User User `gorm:"foreignKey:UserID" json:"-"`
}

// AfterFind hook to convert timestamps
func (r *Request) AfterFind(tx *gorm.DB) error {
	r.CreatedAtUnix = r.CreatedAt.Unix()
	r.UpdatedAtUnix = r.UpdatedAt.Unix()
	return nil
}

// RequestFormData represents the structure for creating/updating requests
type RequestFormData struct {
	Title   string `json:"title"`
	URL     string `json:"url"`
	Comment string `json:"comment"`
	Status  string `json:"status"`
}

// Validate checks if the request data is valid
func (r *RequestFormData) Validate() error {
	if r.Title == "" && r.URL == "" {
		return gorm.ErrInvalidData
	}
	return nil
}
