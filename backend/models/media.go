package models

import (
	"time"

	"gorm.io/gorm"
)

// Media represents a media item in the collection
type Media struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `gorm:"autoCreateTime" json:"-"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime" json:"-"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	CreatedAtUnix int64 `gorm:"-" json:"created_at"`
	UpdatedAtUnix int64 `gorm:"-" json:"updated_at"`

	MediaTypeID uint      `gorm:"not null" json:"-" binding:"required"`
	MediaType   MediaType `gorm:"foreignKey:MediaTypeID" json:"media_type"`
	Title       string    `gorm:"not null" json:"title" binding:"required"`

	ContentTypeID uint        `gorm:"not null" json:"-" binding:"required"`
	ContentType   ContentType `gorm:"foreignKey:ContentTypeID" json:"content_type"`

	AvailabilityID uint               `gorm:"not null" json:"-" binding:"required"`
	Availability   AvailabilityOption `gorm:"foreignKey:AvailabilityID" json:"availability"`

	EAN string `json:"ean"`

	Audio     []LanguageOption `gorm:"many2many:media_audio;" json:"audio"`
	Subtitles []LanguageOption `gorm:"many2many:media_subtitles;" json:"subtitles"`

	EditionID uint          `json:"-"`
	Edition   EditionOption `gorm:"foreignKey:EditionID" json:"edition"`

	Notes           string `json:"notes"`
	AdditionalMedia string `json:"additional_media"`
	Watched         bool   `gorm:"default:false" json:"watched"`
	Rating          *int   `gorm:"check:rating >= 1 AND rating <= 5" json:"rating"`
	WatchNotes      string `json:"watch_notes"`
}

// MediaFormData represents the structure for creating/updating media items
type MediaFormData struct {
	MediaType       uint   `json:"media_type" binding:"required"`
	ContentType     uint   `json:"content_type" binding:"required"`
	Availability    uint   `json:"availability" binding:"required"`
	Title           string `json:"title" binding:"required"`
	EAN             string `json:"ean"`
	Audio           []uint `json:"audio"`
	Subtitles       []uint `json:"subtitles"`
	Edition         uint   `json:"edition"`
	Notes           string `json:"notes"`
	AdditionalMedia string `json:"additional_media"`
	Watched         bool   `json:"watched"`
	Rating          *int   `json:"rating"`
	WatchNotes      string `json:"watch_notes"`
}

// AfterFind GORM hook to convert timestamps to Unix format
func (m *Media) AfterFind(tx *gorm.DB) error {
	m.CreatedAtUnix = m.CreatedAt.Unix()
	m.UpdatedAtUnix = m.UpdatedAt.Unix()
	return nil
}

// BeforeCreate GORM hook to set timestamps
func (m *Media) BeforeCreate(tx *gorm.DB) error {
	now := time.Now()
	m.CreatedAt = now
	m.UpdatedAt = now
	m.CreatedAtUnix = now.Unix()
	m.UpdatedAtUnix = now.Unix()
	return nil
}

// BeforeUpdate GORM hook to update timestamps
func (m *Media) BeforeUpdate(tx *gorm.DB) error {
	now := time.Now()
	m.UpdatedAt = now
	m.UpdatedAtUnix = now.Unix()
	return nil
}

// MediaListResponse is the paginated payload returned by the media list endpoint
type MediaListResponse struct {
	Items []MediaSummary `json:"items"`
	Total int64          `json:"total"`
	Page  int            `json:"page"`
	Limit int            `json:"limit"`
}

// MediaSummary represents a compact version of media for list views
// Only includes IDs for relationships to reduce payload size
type MediaSummary struct {
	ID              uint   `json:"id"`
	Title           string `json:"title"`
	EAN             string `json:"ean,omitempty"`
	CreatedAtUnix   int64  `json:"created_at"`
	UpdatedAtUnix   int64  `json:"updated_at"`
	Notes           string `json:"notes,omitempty"`
	AdditionalMedia string `json:"additional_media,omitempty"`

	MediaTypeID    uint   `json:"media_type_id"`
	ContentTypeID  uint   `json:"content_type_id"`
	AvailabilityID uint   `json:"availability_id"`
	EditionID      uint   `json:"edition_id"`
	AudioIDs       []uint `json:"audio_ids"`
	SubtitleIDs    []uint `json:"subtitle_ids"`
	Watched        bool   `json:"watched"`
	Rating         *int   `json:"rating,omitempty"`
	WatchNotes     string `json:"watch_notes,omitempty"`
}

// ToSummary converts a full Media object to a compact MediaSummary
func (m *Media) ToSummary() MediaSummary {
	audioIDs := make([]uint, len(m.Audio))
	for i, audio := range m.Audio {
		audioIDs[i] = audio.ID
	}

	subtitleIDs := make([]uint, len(m.Subtitles))
	for i, subtitle := range m.Subtitles {
		subtitleIDs[i] = subtitle.ID
	}

	return MediaSummary{
		ID:              m.ID,
		Title:           m.Title,
		EAN:             m.EAN,
		CreatedAtUnix:   m.CreatedAtUnix,
		UpdatedAtUnix:   m.UpdatedAtUnix,
		Notes:           m.Notes,
		AdditionalMedia: m.AdditionalMedia,
		MediaTypeID:     m.MediaTypeID,
		ContentTypeID:   m.ContentTypeID,
		AvailabilityID:  m.AvailabilityID,
		EditionID:       m.EditionID,
		AudioIDs:        audioIDs,
		SubtitleIDs:     subtitleIDs,
		Watched:         m.Watched,
		Rating:          m.Rating,
		WatchNotes:      m.WatchNotes,
	}
}
