package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

// DefaultJWTSecret is the insecure development fallback for JWT_SECRET. The
// server refuses to start in production if this value (or an empty one) is used.
const DefaultJWTSecret = "your-secret-key-change-in-production"

type Config struct {
	Port            string
	Host            string
	DatabasePath    string
	BackupPath      string
	AllowedOrigins  []string
	Environment     string // dev, prod
	JWTSecret       string
	EnableGuestMode bool
	EnableRequests  bool
	WriteRateLimit  float64  // sustained write requests/second per client IP
	WriteRateBurst  float64  // burst allowance for write requests
	TrustedProxies  []string // proxy IPs/CIDRs whose X-Forwarded-For is honoured; none by default
}

// Load reads configuration from environment variables with sensible defaults
func Load() *Config {
	return &Config{
		Port:         getEnv("PORT", "8080"),
		Host:         getEnv("HOST", ""),
		DatabasePath: "data/media.db",
		BackupPath:   "data/backup/",
		AllowedOrigins: getStringSlice("ALLOWED_ORIGINS", []string{
			"http://localhost:5173", // Vite dev server
			"http://localhost:3000", // Alternative React dev server
		}),
		Environment:     getEnv("ENVIRONMENT", "production"),
		JWTSecret:       getEnv("JWT_SECRET", DefaultJWTSecret),
		EnableGuestMode: getBoolEnv("ENABLE_GUEST_MODE", true),
		EnableRequests:  getBoolEnv("ENABLE_REQUESTS", true),
		WriteRateLimit:  getFloatEnv("WRITE_RATE_LIMIT", 1.0),
		WriteRateBurst:  getFloatEnv("WRITE_RATE_BURST", 10),
		TrustedProxies:  getStringSlice("TRUSTED_PROXIES", nil),
	}
}

// Validate checks that the configuration is safe to run with. In production it
// requires JWT_SECRET to be explicitly set to a non-default value.
func (c *Config) Validate() error {
	if c.IsProduction() && (c.JWTSecret == "" || c.JWTSecret == DefaultJWTSecret) {
		return fmt.Errorf("JWT_SECRET must be set to a secure, non-default value in production")
	}
	return nil
}

// GetServerAddr returns the full server address (host:port)
func (c *Config) GetServerAddr() string {
	if c.Host == "" {
		return ":" + c.Port
	}
	return c.Host + ":" + c.Port
}

// IsProduction returns true if running in production environment
func (c *Config) IsProduction() bool {
	return c.Environment == "production" || c.Environment == "prod"
}

// IsDevelopment returns true if running in development environment
func (c *Config) IsDevelopment() bool {
	return c.Environment == "development" || c.Environment == "dev"
}

// getEnv gets an environment variable with a fallback default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getStringSlice parses a comma-separated environment variable into a slice
func getStringSlice(key string, defaultValue []string) []string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}

	// Split by comma and trim whitespace
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			result = append(result, trimmed)
		}
	}

	if len(result) == 0 {
		return defaultValue
	}
	return result
}

// getFloatEnv gets a float environment variable with a fallback default value
func getFloatEnv(key string, defaultValue float64) float64 {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}

	parsed, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return defaultValue
	}
	return parsed
}

// getBoolEnv gets a boolean environment variable with a fallback default value
func getBoolEnv(key string, defaultValue bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}

	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return defaultValue
	}
	return parsed
}
