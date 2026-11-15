package seeding

import (
	"home-media-backend/models"
	"log"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// seedOnValue holds the ON CONFLICT clause shared by every dropdown table: each
// model has a unique `value` column, so re-seeding inserts only missing rows and
// leaves existing ones untouched (matching the previous FirstOrCreate behaviour).
var seedOnValue = clause.OnConflict{
	Columns:   []clause.Column{{Name: "value"}},
	DoNothing: true,
}

// SeedDropdownOptions seeds the database with initial dropdown options
func SeedDropdownOptions(db *gorm.DB) {
	mediaTypes := []models.MediaType{
		{Value: "dvd", Label: "DVD"},
		{Value: "bluray", Label: "Blu-ray"},
		{Value: "bluray_4k", Label: "Blu-ray 4K"},
	}

	contentTypes := []models.ContentType{
		{Value: "-", Label: "-"},
		{Value: "movie", Label: "Movie"},
		{Value: "music", Label: "Music"},
		{Value: "series", Label: "TV Series"},
		{Value: "documentary", Label: "Documentary"},
		{Value: "concert", Label: "Concert"},
		{Value: "cartoon", Label: "Cartoon"},
		{Value: "anime", Label: "Anime"},
		{Value: "other", Label: "Other"},
	}

	availabilityOptions := []models.AvailabilityOption{
		{Value: "available", Label: "Available"},
		{Value: "delivery", Label: "On Delivery"},
		{Value: "gave_to_friend", Label: "Gave to Friend"},
		{Value: "borrowed", Label: "Borrowed Out"},
		{Value: "lost", Label: "Lost/Missing"},
		{Value: "damaged", Label: "Damaged"},
	}

	languageOptions := []models.LanguageOption{
		{Value: "-", Label: "-", Flag: ""},
		{Value: "english", Label: "English", Flag: "🇺🇸"},
		{Value: "german", Label: "German", Flag: "🇩🇪"},
		{Value: "polish", Label: "Polish", Flag: "🇵🇱"},
		{Value: "french", Label: "French", Flag: "🇫🇷"},
		{Value: "spanish", Label: "Spanish", Flag: "🇪🇸"},
		{Value: "italian", Label: "Italian", Flag: "🇮🇹"},
		{Value: "swedish", Label: "Swedish", Flag: "🇸🇪"},
		{Value: "finnish", Label: "Finnish", Flag: "🇫🇮"},
		{Value: "ukrainian", Label: "Ukrainian", Flag: "🇺🇦"},
		{Value: "danish", Label: "Danish", Flag: "🇩🇰"},
		{Value: "czech", Label: "Czechian", Flag: "🇨🇿"},
		{Value: "norwegian", Label: "Norwegian", Flag: "🇳🇴"},
		{Value: "icelandic", Label: "Icelandic", Flag: "🇮🇸"},
		{Value: "portuguese", Label: "Portuguese", Flag: "🇵🇹"},

		{Value: "others", Label: "Others", Flag: "🏳️"},
	}

	editionOptions := []models.EditionOption{
		{Value: "-", Label: "-"},
		{Value: "standard_edition", Label: "Standard Edition"},
		{Value: "collectors_edition", Label: "Collector's Edition"},
		{Value: "steelbook", Label: "Steelbook (steel case)"},
		{Value: "limited_edition", Label: "Limited Edition"},
		{Value: "directors_cut", Label: "Director's Cut"},
		{Value: "extended_edition", Label: "Extended Edition"},
	}

	// Upsert every option set in one transaction, one batch per table.
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Clauses(seedOnValue).CreateInBatches(&mediaTypes, len(mediaTypes)).Error; err != nil {
			return err
		}
		if err := tx.Clauses(seedOnValue).CreateInBatches(&contentTypes, len(contentTypes)).Error; err != nil {
			return err
		}
		if err := tx.Clauses(seedOnValue).CreateInBatches(&availabilityOptions, len(availabilityOptions)).Error; err != nil {
			return err
		}
		if err := tx.Clauses(seedOnValue).CreateInBatches(&languageOptions, len(languageOptions)).Error; err != nil {
			return err
		}
		return tx.Clauses(seedOnValue).CreateInBatches(&editionOptions, len(editionOptions)).Error
	})
	if err != nil {
		log.Printf("Failed to seed dropdown options: %v", err)
		return
	}

	log.Println("Database seeded with dropdown options")
}

// SeedDefaultUser creates the default admin user if no users exist
func SeedDefaultUser(db *gorm.DB) {
	var count int64
	db.Model(&models.User{}).Count(&count)

	if count == 0 {
		hashedAdminPassword, err := bcrypt.GenerateFromPassword([]byte("admin"), bcrypt.DefaultCost)
		if err != nil {
			log.Fatal("Failed to hash admin password:", err)
		}

		adminUser := models.User{
			Username:           "admin",
			PasswordHash:       string(hashedAdminPassword),
			MustChangePassword: true,
			IsGuest:            false,
		}

		if err := db.Create(&adminUser).Error; err != nil {
			log.Fatal("Failed to create admin user:", err)
		}

		log.Println("Created default admin user")
		log.Println("⚠️  Please change the password after first login!")

		hashedGuestPassword, err := bcrypt.GenerateFromPassword([]byte("guest"), bcrypt.DefaultCost)
		if err != nil {
			log.Fatal("Failed to hash guest password:", err)
		}

		guestUser := models.User{
			Username:           "guest",
			PasswordHash:       string(hashedGuestPassword),
			MustChangePassword: false,
			IsGuest:            true,
		}

		if err := db.Create(&guestUser).Error; err != nil {
			log.Fatal("Failed to create guest user:", err)
		}

		log.Println("Created guest user")
	}
}
