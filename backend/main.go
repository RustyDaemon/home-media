package main

import (
	"home-media-backend/config"
	"home-media-backend/database"
	"home-media-backend/handlers"
	"home-media-backend/middleware"
	"home-media-backend/web"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

var version = "dev"

func main() {
	// Load .env for local development. In containerized/production deploys the
	// environment is provided directly, so a missing file is not an error and
	// existing environment variables are never overridden.
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file loaded; using environment variables")
	}

	cfg := config.Load()

	if err := cfg.Validate(); err != nil {
		log.Fatal("Invalid configuration: ", err)
	}

	handlers.InitializeAuth(cfg.JWTSecret)
	handlers.SetVersion(version) // Set the version for the version checker

	if cfg.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}

	database.Initialize(cfg.DatabasePath)

	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = cfg.AllowedOrigins
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	config.AllowCredentials = true
	config.MaxAge = 12 * time.Hour
	r.Use(cors.New(config))

	r.Use(middleware.GuestModeMiddleware(cfg))
	r.Use(middleware.RateLimitWrites(cfg.WriteRateLimit, cfg.WriteRateBurst))

	r.POST("/api/login", handlers.Login)
	r.GET("/api/guest-mode-status", handlers.GetGuestModeStatus)
	r.GET("/api/requests-status", func(c *gin.Context) {
		c.Set("requestsEnabled", cfg.EnableRequests)
		handlers.GetRequestsStatus(c)
	})
	r.GET("/api/version", handlers.CheckVersion) // Public endpoint to check version

	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())             // Protect all API routes
	api.Use(middleware.GuestRestrictionMiddleware()) // Restrict guest write operations
	{
		api.GET("/auth/status", handlers.GetAuthStatus)
		api.POST("/auth/change-password", handlers.ChangePassword)
		api.PUT("/auth/default-language", handlers.UpdateDefaultLanguage)

		api.GET("/media", handlers.GetMedia)
		api.GET("/media/random/unwatched", handlers.GetRandomUnwatched)
		api.GET("/media/:id", handlers.GetMediaByID)
		api.POST("/media", handlers.CreateMedia)
		api.PUT("/media/:id", handlers.UpdateMedia)
		api.PATCH("/media/:id/watched", handlers.ToggleWatched)
		api.DELETE("/media/:id", handlers.DeleteMedia)

		api.GET("/dropdown-options", handlers.GetDropdownOptions)
		api.GET("/stats", handlers.GetStats)

		// Requests endpoints - only enabled if feature is enabled
		if cfg.EnableRequests {
			api.GET("/requests", handlers.GetRequests)
			api.GET("/requests/:id", handlers.GetRequestByID)
			api.POST("/requests", handlers.CreateRequest)
			api.PUT("/requests/:id", handlers.UpdateRequest)
			api.PATCH("/requests/:id/status", handlers.UpdateRequestStatus)
			api.DELETE("/requests/:id", handlers.DeleteRequest)
		}

		// Bulk operations on the whole collection are restricted to
		// non-guest administrators.
		admin := api.Group("")
		admin.Use(middleware.AdminRequired())
		{
			admin.GET("/backup/dump", handlers.CreateDatabaseBackup)
			admin.POST("/backup/file", handlers.CreateFileBackup)
			admin.GET("/export/csv", handlers.ExportMediaToCSV)
			admin.POST("/media/bulk-delete", handlers.BulkDeleteMedia)
			admin.PATCH("/media/bulk-watched", handlers.BulkSetWatched)
		}
	}

	r.NoRoute(web.SPAHandler())

	serverAddr := cfg.GetServerAddr()
	log.Printf("Starting Home Media API %s on %s", version, serverAddr)
	if err := r.Run(serverAddr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
