package database

import (
	"database/sql"
	"home-media-backend/models"
	"home-media-backend/seeding"
	"log"
	"strings"

	sqlite3 "github.com/mattn/go-sqlite3"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

// SQLite's built-in LOWER() and NOCASE collation fold ASCII only, so search
// and sorting would be case-sensitive for non-ASCII titles. Register a driver
// variant whose connections expose Unicode-aware equivalents instead.
const driverName = "sqlite3_unicode"

func init() {
	sql.Register(driverName, &sqlite3.SQLiteDriver{
		ConnectHook: func(conn *sqlite3.SQLiteConn) error {
			if err := conn.RegisterFunc("unicode_lower", strings.ToLower, true); err != nil {
				return err
			}
			return conn.RegisterCollation("NOCASE_UNICODE", func(a, b string) int {
				return strings.Compare(strings.ToLower(a), strings.ToLower(b))
			})
		},
	})
}

// Initialize initializes the database connection and runs migrations
func Initialize(dbPath string) {
	var err error
	DB, err = gorm.Open(sqlite.Dialector{DriverName: driverName, DSN: dbPath}, &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate the schema
	err = DB.AutoMigrate(
		&models.Media{},
		&models.MediaType{},
		&models.ContentType{},
		&models.AvailabilityOption{},
		&models.EditionOption{},
		&models.User{},
		&models.LanguageOption{},
		&models.Request{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	removeDeprecatedConstraints(DB)
	removeDeprecatedColumns(DB)
	removeDeprecatedTables(DB)

	seeding.SeedDropdownOptions(DB)
	seeding.SeedDefaultUser(DB)
}

func removeDeprecatedConstraints(db *gorm.DB) {
	if db.Migrator().HasTable("media") {
		if db.Migrator().HasConstraint(&models.Media{}, "fk_media_disc_type") {
			if err := db.Migrator().DropConstraint(&models.Media{}, "fk_media_disc_type"); err != nil {
				log.Println("Note: Foreign key fk_media_disc_type doesn't exist or already dropped")
			}
		}
		if db.Migrator().HasConstraint(&models.Media{}, "fk_media_region_code") {
			if err := db.Migrator().DropConstraint(&models.Media{}, "fk_media_region_code"); err != nil {
				log.Println("Note: Foreign key fk_media_region_code doesn't exist or already dropped")
			}
		}
		if db.Migrator().HasConstraint(&models.Media{}, "fk_media_aspect_ratio") {
			if err := db.Migrator().DropConstraint(&models.Media{}, "fk_media_aspect_ratio"); err != nil {
				log.Println("Note: Foreign key fk_media_aspect_ratio doesn't exist or already dropped")
			}
		}
		if db.Migrator().HasConstraint(&models.Media{}, "fk_media_hdr") {
			if err := db.Migrator().DropConstraint(&models.Media{}, "fk_media_hdr"); err != nil {
				log.Println("Note: Foreign key fk_media_hdr doesn't exist or already dropped")
			}
		}
		if db.Migrator().HasConstraint(&models.Media{}, "fk_media_codec") {
			if err := db.Migrator().DropConstraint(&models.Media{}, "fk_media_codec"); err != nil {
				log.Println("Note: Foreign key fk_media_codec doesn't exist or already dropped")
			}
		}
		if db.Migrator().HasConstraint(&models.Media{}, "fk_media_resolution") {
			if err := db.Migrator().DropConstraint(&models.Media{}, "fk_media_resolution"); err != nil {
				log.Println("Note: Foreign key fk_media_resolution doesn't exist or already dropped")
			}
		}
	}
}

func removeDeprecatedColumns(db *gorm.DB) {
	if db.Migrator().HasTable("media") {
		if db.Migrator().HasColumn(&models.Media{}, "disc_type_id") {
			if err := db.Migrator().DropColumn(&models.Media{}, "disc_type_id"); err != nil {
				log.Println("Warning: Failed to drop column disc_type_id:", err)
			} else {
				log.Println("Dropped deprecated column: disc_type_id from media table")
			}
		}
		if db.Migrator().HasColumn(&models.Media{}, "region_code_id") {
			if err := db.Migrator().DropColumn(&models.Media{}, "region_code_id"); err != nil {
				log.Println("Warning: Failed to drop column region_code_id:", err)
			} else {
				log.Println("Dropped deprecated column: region_code_id from media table")
			}
		}
		if db.Migrator().HasColumn(&models.Media{}, "aspect_ratio_id") {
			if err := db.Migrator().DropColumn(&models.Media{}, "aspect_ratio_id"); err != nil {
				log.Println("Warning: Failed to drop column aspect_ratio_id:", err)
			} else {
				log.Println("Dropped deprecated column: aspect_ratio_id from media table")
			}
		}
		if db.Migrator().HasColumn(&models.Media{}, "year") {
			if err := db.Migrator().DropColumn(&models.Media{}, "year"); err != nil {
				log.Println("Warning: Failed to drop column year:", err)
			} else {
				log.Println("Dropped deprecated column: year from media table")
			}
		}
		if db.Migrator().HasColumn(&models.Media{}, "hdr_id") {
			if err := db.Migrator().DropColumn(&models.Media{}, "hdr_id"); err != nil {
				log.Println("Warning: Failed to drop column hdr_id:", err)
			} else {
				log.Println("Dropped deprecated column: hdr_id from media table")
			}
		}
		if db.Migrator().HasColumn(&models.Media{}, "codec_id") {
			if err := db.Migrator().DropColumn(&models.Media{}, "codec_id"); err != nil {
				log.Println("Warning: Failed to drop column codec_id:", err)
			} else {
				log.Println("Dropped deprecated column: codec_id from media table")
			}
		}
		if db.Migrator().HasColumn(&models.Media{}, "resolution_id") {
			if err := db.Migrator().DropColumn(&models.Media{}, "resolution_id"); err != nil {
				log.Println("Warning: Failed to drop column resolution_id:", err)
			} else {
				log.Println("Dropped deprecated column: resolution_id from media table")
			}
		}
	}

	// Remove advanced_mode column from users table
	if db.Migrator().HasTable("users") {
		if db.Migrator().HasColumn(&models.User{}, "advanced_mode") {
			if err := db.Migrator().DropColumn(&models.User{}, "advanced_mode"); err != nil {
				log.Println("Warning: Failed to drop column advanced_mode:", err)
			} else {
				log.Println("Dropped deprecated column: advanced_mode from users table")
			}
		}
	}
}

func removeDeprecatedTables(db *gorm.DB) {
	deprecatedTables := []string{
		"disc_type_options",
		"region_code_options",
		"aspect_ratio_options",
		"codec_options",
		"resolution_options",
		"hdr_options",
		"user_preferences",
	}

	for _, tableName := range deprecatedTables {
		if db.Migrator().HasTable(tableName) {
			if err := db.Migrator().DropTable(tableName); err != nil {
				log.Printf("Warning: Failed to drop table %s: %v\n", tableName, err)
			} else {
				log.Printf("Dropped deprecated table: %s\n", tableName)
			}
		}
	}
}
