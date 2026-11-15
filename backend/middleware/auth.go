package middleware

import (
	"home-media-backend/database"
	"home-media-backend/handlers"
	"home-media-backend/helpers"
	"home-media-backend/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware validates the JWT and loads the user it belongs to. The user
// is read from the database on every request so that the guest flag and the
// must-change-password flag reflect the current state rather than whatever
// was true when the token was issued, and tokens of deleted users stop working.
// Guest tokens are rejected while guest mode is disabled.
func AuthMiddleware(guestModeEnabled bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			helpers.RespondWithError(c, http.StatusUnauthorized, helpers.ErrorTypeUnauthorized, "Authorization header required")
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			helpers.RespondWithError(c, http.StatusUnauthorized, helpers.ErrorTypeUnauthorized, "Invalid authorization header format")
			c.Abort()
			return
		}

		token := parts[1]
		claims, err := handlers.ValidateToken(token)
		if err != nil {
			helpers.RespondWithError(c, http.StatusUnauthorized, helpers.ErrorTypeUnauthorized, "Invalid or expired token")
			c.Abort()
			return
		}

		var user models.User
		if err := database.DB.First(&user, claims.UserID).Error; err != nil {
			helpers.RespondWithError(c, http.StatusUnauthorized, helpers.ErrorTypeUnauthorized, "Invalid or expired token")
			c.Abort()
			return
		}

		if user.IsGuest && !guestModeEnabled {
			helpers.RespondWithError(c, http.StatusUnauthorized, helpers.ErrorTypeUnauthorized, "Guest access is disabled")
			c.Abort()
			return
		}

		c.Set("userID", user.ID)
		c.Set("username", user.Username)
		c.Set("isGuest", user.IsGuest)
		c.Set("mustChangePassword", user.MustChangePassword)

		c.Next()
	}
}

// passwordChangeAllowedRoutes are the only API routes a user who still has to
// change their initial password may call.
var passwordChangeAllowedRoutes = map[string]bool{
	"/api/auth/status":          true,
	"/api/auth/change-password": true,
}

// PasswordChangeRequired blocks every API route except the ones needed to
// change the password while the user still has their initial password. It
// must run after AuthMiddleware, which sets the mustChangePassword flag.
func PasswordChangeRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.GetBool("mustChangePassword") && !passwordChangeAllowedRoutes[c.FullPath()] {
			helpers.RespondWithError(c, http.StatusForbidden, helpers.ErrorTypePasswordChangeRequired, "You must change your password before continuing")
			c.Abort()
			return
		}
		c.Next()
	}
}

// AdminRequired blocks guest users from admin-only endpoints (database
// backup, file backup, full data export). It must run after AuthMiddleware,
// which populates the isGuest flag; if the flag is missing we fail closed.
func AdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		isGuest, exists := c.Get("isGuest")
		if !exists || isGuest.(bool) {
			helpers.RespondWithError(c, http.StatusForbidden, helpers.ErrorTypeForbidden, "Administrator access required")
			c.Abort()
			return
		}
		c.Next()
	}
}

// GuestRestrictionMiddleware blocks write operations for guest users
func GuestRestrictionMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		isGuest, exists := c.Get("isGuest")
		if exists && isGuest.(bool) {
			method := c.Request.Method
			if method == "POST" || method == "PUT" || method == "DELETE" || method == "PATCH" {
				helpers.RespondWithError(c, http.StatusForbidden, helpers.ErrorTypeForbidden, "Guest users cannot modify data")
				c.Abort()
				return
			}
		}
		c.Next()
	}
}
