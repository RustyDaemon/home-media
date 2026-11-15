package handlers

import (
	"home-media-backend/database"
	"home-media-backend/helpers"
	"home-media-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetRequests returns all requests
func GetRequests(c *gin.Context) {
	var requests []models.Request

	query := database.DB.Preload("User")

	if err := query.Order("created_at DESC").Find(&requests).Error; err != nil {
		helpers.RespondInternalError(c, "Failed to fetch requests", err.Error())
		return
	}

	// Populate username from user relation
	for i := range requests {
		requests[i].Username = requests[i].User.Username
	}

	helpers.RespondWithSuccess(c, requests)
}

// GetRequestByID returns a single request by ID
func GetRequestByID(c *gin.Context) {
	id := c.Param("id")

	var request models.Request
	if err := database.DB.Preload("User").First(&request, id).Error; err != nil {
		helpers.RespondNotFound(c, "Request not found")
		return
	}

	// Check if guest user is accessing their own request
	userID, _ := c.Get("userID")
	isGuest, _ := c.Get("isGuest")

	if isGuest.(bool) && request.UserID != userID.(uint) {
		helpers.RespondWithError(c, http.StatusForbidden, helpers.ErrorTypeForbidden, "You can only view your own requests")
		return
	}

	request.Username = request.User.Username

	helpers.RespondWithSuccess(c, request)
}

// CreateRequest creates a new request
func CreateRequest(c *gin.Context) {
	var formData models.RequestFormData
	if err := c.ShouldBindJSON(&formData); err != nil {
		helpers.RespondWithError(c, http.StatusBadRequest, helpers.ErrorTypeValidation, err.Error())
		return
	}

	// Validate that at least title or URL is provided
	if err := formData.Validate(); err != nil {
		helpers.RespondWithError(c, http.StatusBadRequest, helpers.ErrorTypeValidation, "Either title or URL must be provided")
		return
	}

	userID, _ := c.Get("userID")

	request := models.Request{
		Title:   formData.Title,
		URL:     formData.URL,
		Comment: formData.Comment,
		UserID:  userID.(uint),
		Status:  "Awaiting", // Default status for new requests
	}

	// Admin can override status
	if formData.Status != "" {
		request.Status = formData.Status
	}

	if err := database.DB.Create(&request).Error; err != nil {
		helpers.RespondInternalError(c, "Failed to create request", err.Error())
		return
	}

	// Load user relation to populate username
	database.DB.Preload("User").First(&request, request.ID)
	request.Username = request.User.Username

	helpers.RespondWithCreated(c, request, "Request created successfully")
}

// UpdateRequest updates an existing request
func UpdateRequest(c *gin.Context) {
	id := c.Param("id")

	var request models.Request
	if err := database.DB.First(&request, id).Error; err != nil {
		helpers.RespondNotFound(c, "Request not found")
		return
	}

	var formData models.RequestFormData
	if err := c.ShouldBindJSON(&formData); err != nil {
		helpers.RespondWithError(c, http.StatusBadRequest, helpers.ErrorTypeValidation, err.Error())
		return
	}

	// Validate that at least title or URL is provided
	if err := formData.Validate(); err != nil {
		helpers.RespondWithError(c, http.StatusBadRequest, helpers.ErrorTypeValidation, "Either title or URL must be provided")
		return
	}

	// Update fields
	request.Title = formData.Title
	request.URL = formData.URL
	request.Comment = formData.Comment

	// Admin can update status
	if formData.Status != "" {
		request.Status = formData.Status
	}

	if err := database.DB.Save(&request).Error; err != nil {
		helpers.RespondInternalError(c, "Failed to update request", err.Error())
		return
	}

	// Load user relation to populate username
	database.DB.Preload("User").First(&request, request.ID)
	request.Username = request.User.Username

	helpers.RespondWithSuccess(c, request)
}

// DeleteRequest deletes a request
func DeleteRequest(c *gin.Context) {
	id := c.Param("id")

	var request models.Request
	if err := database.DB.First(&request, id).Error; err != nil {
		helpers.RespondNotFound(c, "Request not found")
		return
	}

	if err := database.DB.Delete(&request).Error; err != nil {
		helpers.RespondInternalError(c, "Failed to delete request", err.Error())
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// UpdateRequestStatus updates only the status of a request (admin only)
func UpdateRequestStatus(c *gin.Context) {
	id := c.Param("id")

	var request models.Request
	if err := database.DB.First(&request, id).Error; err != nil {
		helpers.RespondNotFound(c, "Request not found")
		return
	}

	var data struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&data); err != nil {
		helpers.RespondWithError(c, http.StatusBadRequest, helpers.ErrorTypeValidation, err.Error())
		return
	}

	// Validate status values
	validStatuses := map[string]bool{
		"Awaiting": true,
		"Approved": true,
		"Declined": true,
		"Bought":   true,
	}

	if !validStatuses[data.Status] {
		helpers.RespondWithError(c, http.StatusBadRequest, helpers.ErrorTypeValidation, "Invalid status value")
		return
	}

	request.Status = data.Status

	if err := database.DB.Save(&request).Error; err != nil {
		helpers.RespondInternalError(c, "Failed to update request status", err.Error())
		return
	}

	// Load user relation to populate username
	database.DB.Preload("User").First(&request, request.ID)
	request.Username = request.User.Username

	helpers.RespondWithSuccess(c, request)
}
