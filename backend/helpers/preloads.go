package helpers

import (
	"home-media-backend/models"

	"gorm.io/gorm"
)

// PreloadAllMediaRelations applies all standard preloads for Media models
// This consolidates the repeated preload chains used across multiple handlers
func PreloadAllMediaRelations(db *gorm.DB) *gorm.DB {
	return db.
		Preload("MediaType").
		Preload("ContentType").
		Preload("Availability").
		Preload("Audio").
		Preload("Subtitles").
		Preload("Edition")
}

// GetMediaWithPreloads returns a query builder with all Media preloads applied
func GetMediaWithPreloads(db *gorm.DB) *gorm.DB {
	return PreloadAllMediaRelations(db.Model(&models.Media{}))
}

// GetAllDropdownOptions fetches all dropdown options in a single transaction
func GetAllDropdownOptions(db *gorm.DB) (*models.DropdownOptions, error) {
	var options models.DropdownOptions

	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Find(&options.MediaTypes).Error; err != nil {
			return err
		}
		if err := tx.Find(&options.ContentTypes).Error; err != nil {
			return err
		}
		if err := tx.Find(&options.Availability).Error; err != nil {
			return err
		}
		if err := tx.Find(&options.Languages).Error; err != nil {
			return err
		}
		if err := tx.Find(&options.Editions).Error; err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return &options, nil
}
