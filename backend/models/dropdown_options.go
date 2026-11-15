package models

// MediaType represents the type of media (DVD, Blu-ray, etc.)
type MediaType struct {
	ID    uint   `gorm:"primaryKey" json:"id"`
	Value string `gorm:"unique;not null" json:"value"`
	Label string `gorm:"not null" json:"label"`
}

// ContentType represents the content category (Movie, TV Series, etc.)
type ContentType struct {
	ID    uint   `gorm:"primaryKey" json:"id"`
	Value string `gorm:"unique;not null" json:"value"`
	Label string `gorm:"not null" json:"label"`
}

// AvailabilityOption represents the availability status of media
type AvailabilityOption struct {
	ID    uint   `gorm:"primaryKey" json:"id"`
	Value string `gorm:"unique;not null" json:"value"`
	Label string `gorm:"not null" json:"label"`
}

type LanguageOption struct {
	ID    uint   `gorm:"primaryKey" json:"id"`
	Value string `gorm:"unique;not null" json:"value"`
	Label string `gorm:"not null" json:"label"`
	Flag  string `gorm:"not null" json:"flag"`
}

// EditionOption represents edition types (Collector's, Steelbook, etc.)
type EditionOption struct {
	ID    uint   `gorm:"primaryKey" json:"id"`
	Value string `gorm:"unique;not null" json:"value"`
	Label string `gorm:"not null" json:"label"`
}

// DropdownOptions aggregates all dropdown options for frontend consumption
type DropdownOptions struct {
	MediaTypes   []MediaType          `json:"media_types"`
	ContentTypes []ContentType        `json:"content_types"`
	Availability []AvailabilityOption `json:"availability"`
	Languages    []LanguageOption     `json:"languages"`
	Editions     []EditionOption      `json:"editions"`
}
