package handlers

import (
	"fmt"
	"home-media-backend/database"
	"home-media-backend/helpers"
	"home-media-backend/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret []byte

// MinPasswordLength is the shortest password accepted when changing it. Keep
// in sync with changePasswordSchema in frontend/src/schemas/auth.ts.
const MinPasswordLength = 6

// InitializeAuth sets up the JWT secret from config
func InitializeAuth(secret string) {
	jwtSecret = []byte(secret)
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

type UpdateDefaultLanguageRequest struct {
	DefaultLanguageID *uint `json:"default_language_id"`
}

type AuthResponse struct {
	Token              string `json:"token"`
	MustChangePassword bool   `json:"must_change_password"`
	Username           string `json:"username"`
	IsGuest            bool   `json:"is_guest"`
	DefaultLanguageID  *uint  `json:"default_language_id"`
}

type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	IsGuest  bool   `json:"is_guest"`
	jwt.RegisteredClaims
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helpers.RespondValidationError(c, err)
		return
	}

	var user models.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		helpers.RespondWithError(c, http.StatusUnauthorized, helpers.ErrorTypeUnauthorized, "Invalid credentials")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		helpers.RespondWithError(c, http.StatusUnauthorized, helpers.ErrorTypeUnauthorized, "Invalid credentials")
		return
	}

	// The guest account always exists; refuse it unless guest mode is on.
	// Same message as a wrong password so the response reveals nothing.
	if user.IsGuest && !c.GetBool("guestModeEnabled") {
		helpers.RespondWithError(c, http.StatusUnauthorized, helpers.ErrorTypeUnauthorized, "Invalid credentials")
		return
	}

	token, err := generateToken(user.ID, user.Username, user.IsGuest)
	if err != nil {
		helpers.RespondInternalError(c, "Failed to generate token")
		return
	}

	helpers.RespondWithSuccess(c, AuthResponse{
		Token:              token,
		MustChangePassword: user.MustChangePassword,
		Username:           user.Username,
		IsGuest:            user.IsGuest,
		DefaultLanguageID:  user.DefaultLanguageID,
	})
}

func GetGuestModeStatus(c *gin.Context) {
	configEnabled, exists := c.Get("guestModeEnabled")
	if !exists || !configEnabled.(bool) {
		helpers.RespondWithSuccess(c, gin.H{
			"enabled": false,
		})
		return
	}

	helpers.RespondWithSuccess(c, gin.H{
		"enabled": true,
	})
}

func ChangePassword(c *gin.Context) {
	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helpers.RespondValidationError(c, err)
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		helpers.RespondWithError(c, http.StatusUnauthorized, helpers.ErrorTypeUnauthorized, "Unauthorized")
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		helpers.RespondNotFound(c, "User")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.OldPassword)); err != nil {
		helpers.RespondWithError(c, http.StatusUnauthorized, helpers.ErrorTypeUnauthorized, "Invalid old password")
		return
	}

	// Mirror the frontend's rules so the forced change can't be skipped by
	// calling the API directly with a trivial or unchanged password.
	if len([]rune(req.NewPassword)) < MinPasswordLength {
		helpers.RespondWithError(c, http.StatusBadRequest, helpers.ErrorTypeValidation, fmt.Sprintf("Password must be at least %d characters long", MinPasswordLength))
		return
	}
	if req.NewPassword == req.OldPassword {
		helpers.RespondWithError(c, http.StatusBadRequest, helpers.ErrorTypeValidation, "New password must be different from the current password")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		helpers.RespondInternalError(c, "Failed to hash password")
		return
	}

	user.PasswordHash = string(hashedPassword)
	user.MustChangePassword = false

	if err := database.DB.Save(&user).Error; err != nil {
		helpers.RespondInternalError(c, "Failed to update password")
		return
	}

	token, err := generateToken(user.ID, user.Username, user.IsGuest)
	if err != nil {
		helpers.RespondInternalError(c, "Failed to generate token")
		return
	}

	helpers.RespondWithSuccess(c, gin.H{
		"message": "Password changed successfully",
		"token":   token,
	})
}

func GetAuthStatus(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		helpers.RespondWithError(c, http.StatusUnauthorized, helpers.ErrorTypeUnauthorized, "Unauthorized")
		return
	}

	username, _ := c.Get("username")

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		helpers.RespondNotFound(c, "User")
		return
	}

	helpers.RespondWithSuccess(c, gin.H{
		"authenticated":        true,
		"must_change_password": user.MustChangePassword,
		"username":             username,
		"is_guest":             user.IsGuest,
		"default_language_id":  user.DefaultLanguageID,
	})
}

func generateToken(userID uint, username string, isGuest bool) (string, error) {
	claims := Claims{
		UserID:   userID,
		Username: username,
		IsGuest:  isGuest,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, jwt.ErrSignatureInvalid
}

func UpdateDefaultLanguage(c *gin.Context) {
	var req UpdateDefaultLanguageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helpers.RespondValidationError(c, err)
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		helpers.RespondWithError(c, http.StatusUnauthorized, helpers.ErrorTypeUnauthorized, "Unauthorized")
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		helpers.RespondNotFound(c, "User")
		return
	}

	// Validate language exists if provided
	if req.DefaultLanguageID != nil {
		var language models.LanguageOption
		if err := database.DB.First(&language, *req.DefaultLanguageID).Error; err != nil {
			helpers.RespondWithError(c, http.StatusBadRequest, helpers.ErrorTypeValidation, "Invalid language ID")
			return
		}
	}

	user.DefaultLanguageID = req.DefaultLanguageID

	if err := database.DB.Save(&user).Error; err != nil {
		helpers.RespondInternalError(c, "Failed to update default language")
		return
	}

	helpers.RespondWithSuccess(c, gin.H{
		"message":             "Default language updated successfully",
		"default_language_id": user.DefaultLanguageID,
	})
}
