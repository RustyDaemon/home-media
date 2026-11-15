package helpers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// ErrorType represents different categories of errors
type ErrorType string

const (
	ErrorTypeValidation   ErrorType = "validation"
	ErrorTypeNotFound     ErrorType = "not_found"
	ErrorTypeInternal     ErrorType = "internal"
	ErrorTypeUnauthorized ErrorType = "unauthorized"
	ErrorTypeForbidden    ErrorType = "forbidden"
	ErrorTypeConflict     ErrorType = "conflict"
	ErrorTypeBadRequest   ErrorType = "bad_request"
	ErrorTypeTooManyReqs  ErrorType = "too_many_requests"
)

// ErrorResponse represents a standardized error response
type ErrorResponse struct {
	Success bool      `json:"success"`
	Error   ErrorType `json:"error"`
	Message string    `json:"message"`
	Details string    `json:"details,omitempty"`
}

// SuccessResponse represents a standardized success response
type SuccessResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
}

// RespondWithError sends a standardized error response
func RespondWithError(c *gin.Context, statusCode int, errorType ErrorType, message string, details ...string) {
	var detailsStr string
	if len(details) > 0 {
		detailsStr = details[0]
	}

	response := ErrorResponse{
		Success: false,
		Error:   errorType,
		Message: message,
		Details: detailsStr,
	}

	c.JSON(statusCode, response)
}

// RespondWithSuccess sends a standardized success response
func RespondWithSuccess(c *gin.Context, data interface{}, message ...string) {
	var msg string
	if len(message) > 0 {
		msg = message[0]
	}

	response := SuccessResponse{
		Success: true,
		Data:    data,
		Message: msg,
	}

	c.JSON(http.StatusOK, response)
}

// RespondWithCreated sends a standardized success response for created resources
func RespondWithCreated(c *gin.Context, data interface{}, message ...string) {
	var msg string
	if len(message) > 0 {
		msg = message[0]
	} else {
		msg = "Resource created successfully"
	}

	response := SuccessResponse{
		Success: true,
		Data:    data,
		Message: msg,
	}

	c.JSON(http.StatusCreated, response)
}

func RespondNotFound(c *gin.Context, resource string) {
	RespondWithError(c, http.StatusNotFound, ErrorTypeNotFound, resource+" not found")
}

func RespondValidationError(c *gin.Context, err error) {
	RespondWithError(c, http.StatusBadRequest, ErrorTypeValidation, "Validation failed", err.Error())
}

func RespondInternalError(c *gin.Context, message string, details ...string) {
	RespondWithError(c, http.StatusInternalServerError, ErrorTypeInternal, message, details...)
}

func RespondBadRequest(c *gin.Context, message string, details ...string) {
	RespondWithError(c, http.StatusBadRequest, ErrorTypeBadRequest, message, details...)
}
