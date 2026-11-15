package middleware

import (
	"home-media-backend/handlers"
	"home-media-backend/helpers"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware validates JWT tokens
func AuthMiddleware() gin.HandlerFunc {
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

		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("isGuest", claims.IsGuest)

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
