package handlers

import (
	"fmt"
	"home-media-backend/database"
	"home-media-backend/helpers"
	"home-media-backend/models"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// mediaSorts whitelists sortBy values for GetMedia; Join is the LEFT JOIN a
// joined sort column needs. Keys must stay in sync with the frontend's
// MediaSortField union (frontend/src/types/media.ts) — unknown keys get a 400
// so drift fails loudly instead of silently sorting by created_at.
var mediaSorts = map[string]struct {
	Expr string
	Join string
}{
	"title":      {Expr: "title COLLATE NOCASE_UNICODE"},
	"created_at": {Expr: "created_at"},
	"updated_at": {Expr: "updated_at"},
	"ean":        {Expr: "ean COLLATE NOCASE_UNICODE"},
	"media_type": {
		Expr: "media_types.label COLLATE NOCASE_UNICODE",
		Join: "LEFT JOIN media_types ON media_types.id = media.media_type_id",
	},
	"availability": {
		Expr: "availability_options.label COLLATE NOCASE_UNICODE",
		Join: "LEFT JOIN availability_options ON availability_options.id = media.availability_id",
	},
}

// GetMedia returns media items with optional search, filters, sorting and pagination
func GetMedia(c *gin.Context) {
	sortBy := c.DefaultQuery("sortBy", "created_at")
	sort, ok := mediaSorts[sortBy]
	if !ok {
		helpers.RespondBadRequest(c, "Invalid sortBy value", sortBy)
		return
	}
	sortOrder := c.DefaultQuery("sortOrder", "desc")
	if sortOrder != "asc" && sortOrder != "desc" {
		sortOrder = "desc"
	}

	base := database.DB.Model(&models.Media{})

	search := c.Query("search")
	if search != "" {
		pattern := "%" + helpers.EscapeLikePattern(strings.ToLower(search)) + "%"
		// unicode_lower takes a Go string, so a NULL argument errors the whole
		// query; ean is nullable, hence the COALESCE.
		base = base.Where(
			`unicode_lower(title) LIKE ? ESCAPE '\' OR unicode_lower(COALESCE(ean, '')) LIKE ? ESCAPE '\'`,
			pattern, pattern,
		)
	}

	if typeID, _ := strconv.Atoi(c.Query("type")); typeID > 0 {
		base = base.Where("media_type_id = ?", typeID)
	}
	if statusID, _ := strconv.Atoi(c.Query("status")); statusID > 0 {
		base = base.Where("availability_id = ?", statusID)
	}
	if langID, _ := strconv.Atoi(c.Query("language")); langID > 0 {
		base = base.Where(
			"EXISTS (SELECT 1 FROM media_audio ma WHERE ma.media_id = media.id AND ma.language_option_id = ?)"+
				" OR EXISTS (SELECT 1 FROM media_subtitles ms WHERE ms.media_id = media.id AND ms.language_option_id = ?)",
			langID, langID,
		)
	}

	var total int64
	if err := base.Session(&gorm.Session{}).Count(&total).Error; err != nil {
		helpers.RespondInternalError(c, "Failed to count media", err.Error())
		return
	}

	query := base.Session(&gorm.Session{}).Preload("Audio").Preload("Subtitles")
	if sort.Join != "" {
		query = query.Joins(sort.Join)
	}
	// media.id breaks ties so LIMIT/OFFSET pages are stable when many rows
	// share a sort value (e.g. the same media type).
	query = query.Order(sort.Expr + " " + sortOrder + ", media.id " + sortOrder)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	// limit <= 0 means "return all"
	limit, _ := strconv.Atoi(c.Query("limit"))
	if limit > 0 {
		query = query.Limit(limit).Offset((page - 1) * limit)
	}

	var media []models.Media
	if err := query.Find(&media).Error; err != nil {
		helpers.RespondInternalError(c, "Failed to fetch media", err.Error())
		return
	}

	summaries := make([]models.MediaSummary, len(media))
	for i, item := range media {
		summaries[i] = item.ToSummary()
	}

	helpers.RespondWithSuccess(c, models.MediaListResponse{
		Items: summaries,
		Total: total,
		Page:  page,
		Limit: limit,
	})
}

// GetMediaByID returns a single media item by ID
func GetMediaByID(c *gin.Context) {
	id := c.Param("id")
	var media models.Media

	if err := database.DB.Preload("Audio").Preload("Subtitles").
		First(&media, id).Error; err != nil {
		helpers.RespondNotFound(c, "Media")
		return
	}

	summary := media.ToSummary()
	helpers.RespondWithSuccess(c, summary)
}

// syncMediaLanguages replaces the media row's Audio and Subtitles associations
// with the language options matching the deduplicated IDs from the form.
// Association Replace clears stale join rows and appends the new set in one
// call, so an empty ID list simply clears the association.
func syncMediaLanguages(tx *gorm.DB, media *models.Media, formData models.MediaFormData) error {
	for _, assoc := range []struct {
		name string
		ids  []uint
	}{
		{"Audio", formData.Audio},
		{"Subtitles", formData.Subtitles},
	} {
		options := []models.LanguageOption{}
		if unique := helpers.DeduplicateUintSlice(assoc.ids); len(unique) > 0 {
			if err := tx.Find(&options, unique).Error; err != nil {
				return fmt.Errorf("failed to load %s language options: %w", assoc.name, err)
			}
		}
		if err := tx.Model(media).Association(assoc.name).Replace(&options); err != nil {
			return fmt.Errorf("failed to set %s associations: %w", assoc.name, err)
		}
	}
	return nil
}

// CreateMedia creates a new media item
func CreateMedia(c *gin.Context) {
	var formData models.MediaFormData

	if err := c.ShouldBindJSON(&formData); err != nil {
		helpers.RespondBadRequest(c, "Invalid request data", err.Error())
		return
	}

	media := models.Media{
		Title:           formData.Title,
		EAN:             formData.EAN,
		Notes:           formData.Notes,
		AdditionalMedia: formData.AdditionalMedia,
		Watched:         formData.Watched,
		Rating:          formData.Rating,
		WatchNotes:      formData.WatchNotes,
	}

	media.MediaTypeID = formData.MediaType
	media.ContentTypeID = formData.ContentType
	media.AvailabilityID = formData.Availability
	media.EditionID = formData.Edition

	// Create the media row and set its associations atomically so a mid-sequence
	// failure can't leave the record with partially-applied associations.
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&media).Error; err != nil {
			return fmt.Errorf("failed to create media: %w", err)
		}
		return syncMediaLanguages(tx, &media, formData)
	})
	if err != nil {
		helpers.RespondInternalError(c, "Failed to create media", err.Error())
		return
	}

	database.DB.Preload("Audio").Preload("Subtitles").
		First(&media, media.ID)

	summary := media.ToSummary()
	helpers.RespondWithCreated(c, summary)
}

// UpdateMedia updates an existing media item
func UpdateMedia(c *gin.Context) {
	id := c.Param("id")
	var media models.Media

	if err := database.DB.First(&media, id).Error; err != nil {
		helpers.RespondNotFound(c, "Media")
		return
	}

	var formData models.MediaFormData
	if err := c.ShouldBindJSON(&formData); err != nil {
		helpers.RespondBadRequest(c, "Invalid request data", err.Error())
		return
	}

	media.Title = formData.Title
	media.EAN = formData.EAN
	media.Notes = formData.Notes
	media.AdditionalMedia = formData.AdditionalMedia
	media.Watched = formData.Watched
	media.Rating = formData.Rating
	media.WatchNotes = formData.WatchNotes

	media.MediaTypeID = formData.MediaType
	media.ContentTypeID = formData.ContentType
	media.AvailabilityID = formData.Availability
	media.EditionID = formData.Edition

	// Persist the field updates and replace associations atomically so a
	// mid-sequence failure can't leave the record half-updated.
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(&media).Error; err != nil {
			return fmt.Errorf("failed to update media: %w", err)
		}
		return syncMediaLanguages(tx, &media, formData)
	})
	if err != nil {
		helpers.RespondInternalError(c, "Failed to update media", err.Error())
		return
	}

	database.DB.Preload("Audio").Preload("Subtitles").
		First(&media, media.ID)

	summary := media.ToSummary()
	helpers.RespondWithSuccess(c, summary)
}

// DeleteMedia deletes a media item
func DeleteMedia(c *gin.Context) {
	id := c.Param("id")

	var media models.Media
	if err := database.DB.First(&media, id).Error; err != nil {
		helpers.RespondNotFound(c, "Media")
		return
	}

	// Clear associations and delete the row atomically so a mid-sequence failure
	// can't leave the record with partially-cleared associations.
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&media).Association("Audio").Clear(); err != nil {
			return fmt.Errorf("failed to clear audio associations: %w", err)
		}

		if err := tx.Model(&media).Association("Subtitles").Clear(); err != nil {
			return fmt.Errorf("failed to clear subtitle associations: %w", err)
		}

		if err := tx.Delete(&media).Error; err != nil {
			return fmt.Errorf("failed to delete media: %w", err)
		}

		return nil
	})
	if err != nil {
		helpers.RespondInternalError(c, "Failed to delete media", err.Error())
		return
	}

	helpers.RespondWithSuccess(c, nil, "Media deleted successfully")
}

// BulkMediaIDs is the request body for bulk media operations
type BulkMediaIDs struct {
	IDs []uint `json:"ids" binding:"required,min=1,dive,gt=0"`
}

// BulkWatchedRequest is the request body for bulk watched updates
type BulkWatchedRequest struct {
	IDs     []uint `json:"ids" binding:"required,min=1,dive,gt=0"`
	Watched *bool  `json:"watched" binding:"required"`
}

// BulkDeleteMedia deletes multiple media items and their language associations
func BulkDeleteMedia(c *gin.Context) {
	var req BulkMediaIDs
	if err := c.ShouldBindJSON(&req); err != nil {
		helpers.RespondValidationError(c, err)
		return
	}

	var deleted int64
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec("DELETE FROM media_audio WHERE media_id IN ?", req.IDs).Error; err != nil {
			return fmt.Errorf("failed to clear audio associations: %w", err)
		}

		if err := tx.Exec("DELETE FROM media_subtitles WHERE media_id IN ?", req.IDs).Error; err != nil {
			return fmt.Errorf("failed to clear subtitle associations: %w", err)
		}

		result := tx.Delete(&models.Media{}, req.IDs)
		if result.Error != nil {
			return fmt.Errorf("failed to delete media: %w", result.Error)
		}
		deleted = result.RowsAffected

		return nil
	})
	if err != nil {
		helpers.RespondInternalError(c, "Failed to delete media", err.Error())
		return
	}

	helpers.RespondWithSuccess(c, gin.H{"deleted": deleted}, "Media deleted successfully")
}

// BulkSetWatched sets the watched flag on multiple media items
func BulkSetWatched(c *gin.Context) {
	var req BulkWatchedRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helpers.RespondValidationError(c, err)
		return
	}

	// Batch updates skip GORM hooks, so updated_at must be set explicitly
	result := database.DB.Model(&models.Media{}).
		Where("id IN ?", req.IDs).
		Updates(map[string]interface{}{
			"watched":    *req.Watched,
			"updated_at": time.Now(),
		})
	if result.Error != nil {
		helpers.RespondInternalError(c, "Failed to update watched status", result.Error.Error())
		return
	}

	helpers.RespondWithSuccess(c, gin.H{"updated": result.RowsAffected}, "Watched status updated successfully")
}

// GetRandomUnwatched returns a random unwatched media item
func GetRandomUnwatched(c *gin.Context) {
	var media []models.Media

	// Let the database pick the random row so we never load the full unwatched
	// set into memory.
	if err := database.DB.Where("watched = ?", false).
		Order("RANDOM()").
		Limit(1).
		Preload("Audio").
		Preload("Subtitles").
		Find(&media).Error; err != nil {
		helpers.RespondInternalError(c, "Failed to fetch unwatched media", err.Error())
		return
	}

	if len(media) == 0 {
		helpers.RespondNotFound(c, "No unwatched media found")
		return
	}

	helpers.RespondWithSuccess(c, media[0].ToSummary())
}

// ToggleWatched toggles the watched status of a media item
func ToggleWatched(c *gin.Context) {
	id := c.Param("id")
	var media models.Media

	if err := database.DB.First(&media, id).Error; err != nil {
		helpers.RespondNotFound(c, "Media")
		return
	}

	// Toggle the watched status
	media.Watched = !media.Watched

	if err := database.DB.Save(&media).Error; err != nil {
		helpers.RespondInternalError(c, "Failed to update watched status", err.Error())
		return
	}

	summary := media.ToSummary()
	helpers.RespondWithSuccess(c, summary)
}
