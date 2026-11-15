package middleware

import (
	"home-media-backend/config"

	"github.com/gin-gonic/gin"
)

// GuestModeMiddleware injects guest mode configuration into context
func GuestModeMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("guestModeEnabled", cfg.EnableGuestMode)
		c.Next()
	}
}
