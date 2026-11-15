package handlers

import (
	"encoding/json"
	"fmt"
	"home-media-backend/database"
	"home-media-backend/helpers"
	"home-media-backend/models"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hashicorp/go-version"
)

// GetDropdownOptions returns all dropdown options for the frontend
func GetDropdownOptions(c *gin.Context) {
	options, err := helpers.GetAllDropdownOptions(database.DB)
	if err != nil {
		helpers.RespondInternalError(c, "Failed to fetch dropdown options", err.Error())
		return
	}

	helpers.RespondWithSuccess(c, options)
}

// GetStats returns basic statistics about the media collection
func GetStats(c *gin.Context) {
	var counts struct {
		Total   int64
		Watched int64
	}
	var mediaTypeCounts []struct {
		MediaType string `json:"media_type"`
		Count     int64  `json:"count"`
	}

	// Total and watched counts in a single pass (Model keeps the soft-delete scope).
	if err := database.DB.Model(&models.Media{}).
		Select("COUNT(*) AS total, COALESCE(SUM(CASE WHEN watched THEN 1 ELSE 0 END), 0) AS watched").
		Scan(&counts).Error; err != nil {
		helpers.RespondInternalError(c, "Failed to count media", err.Error())
		return
	}

	if err := database.DB.Table("media").
		Select("media_types.label as media_type, count(*) as count").
		Joins("LEFT JOIN media_types ON media.media_type_id = media_types.id").
		Where("media.deleted_at IS NULL").
		Group("media_types.label").
		Scan(&mediaTypeCounts).Error; err != nil {
		helpers.RespondInternalError(c, "Failed to fetch media type statistics", err.Error())
		return
	}

	helpers.RespondWithSuccess(c, gin.H{
		"total_count":       counts.Total,
		"watched_count":     counts.Watched,
		"media_type_counts": mediaTypeCounts,
	})
}

// DockerHubTagsResponse represents the response from Docker Hub API
type DockerHubTagsResponse struct {
	Results []struct {
		Name        string    `json:"name"`
		LastUpdated time.Time `json:"last_updated"`
	} `json:"results"`
}

// VersionInfo represents version information
type VersionInfo struct {
	CurrentVersion string `json:"current_version"`
	LatestVersion  string `json:"latest_version"`
	UpdateRequired bool   `json:"update_required"`
	CheckedAt      int64  `json:"checked_at"`
}

var (
	currentVersion = "dev" // Will be set by build args
	cachedVersion  *VersionInfo
	lastCheck      time.Time
	cacheDuration  = 4 * time.Hour // Cache the version check for 4 hours
	versionMu      sync.RWMutex    // Guards cachedVersion and lastCheck
)

// SetVersion sets the current version (called from main)
func SetVersion(version string) {
	currentVersion = version
}

// CheckVersion checks Docker Hub for the latest version
func CheckVersion(c *gin.Context) {
	// Return cached version if available and fresh
	versionMu.RLock()
	cached, checkedAt := cachedVersion, lastCheck
	versionMu.RUnlock()
	if cached != nil && time.Since(checkedAt) < cacheDuration {
		helpers.RespondWithSuccess(c, cached)
		return
	}

	// Fetch latest version from Docker Hub
	latestVersion, err := getLatestDockerHubTag("rustydaemon/homemedia")
	if err != nil {
		// If we can't fetch, return cached version or error gracefully
		if cached != nil {
			helpers.RespondWithSuccess(c, cached)
			return
		}
		helpers.RespondWithSuccess(c, VersionInfo{
			CurrentVersion: currentVersion,
			LatestVersion:  "unknown",
			UpdateRequired: false,
			CheckedAt:      time.Now().Unix(),
		})
		return
	}

	// Compare versions
	updateRequired := compareVersions(currentVersion, latestVersion)

	versionInfo := VersionInfo{
		CurrentVersion: currentVersion,
		LatestVersion:  latestVersion,
		UpdateRequired: updateRequired,
		CheckedAt:      time.Now().Unix(),
	}

	// Cache the result
	versionMu.Lock()
	cachedVersion = &versionInfo
	lastCheck = time.Now()
	versionMu.Unlock()

	helpers.RespondWithSuccess(c, versionInfo)
}

// getLatestDockerHubTag fetches the latest tag from Docker Hub
func getLatestDockerHubTag(repository string) (string, error) {
	url := fmt.Sprintf("https://hub.docker.com/v2/repositories/%s/tags?page_size=100", repository)

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("docker hub returned status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var tagsResponse DockerHubTagsResponse
	if err := json.Unmarshal(body, &tagsResponse); err != nil {
		return "", err
	}

	// Find the latest semantic version tag (e.g., v1.2.3)
	var latestTag string
	for _, tag := range tagsResponse.Results {
		if tag.Name == "latest" {
			continue
		}
		// Look for version tags (v1.2.3 or 1.2.3)
		if strings.HasPrefix(tag.Name, "v") || strings.Contains(tag.Name, ".") {
			if latestTag == "" || tag.Name > latestTag {
				latestTag = tag.Name
			}
		}
	}

	if latestTag == "" {
		return "latest", nil
	}

	return latestTag, nil
}

// compareVersions returns true if latestVersion is newer than currentVersion
func compareVersions(current, latest string) bool {
	// If current is "dev", always show update available
	if current == "dev" || current == "" {
		return latest != "" && latest != "dev" && latest != "latest"
	}

	// If latest is not a proper version, don't show update
	if latest == "" || latest == "dev" || latest == "latest" {
		return false
	}

	// Use proper semantic version comparison (handles e.g. 1.10 > 1.9).
	cv, err1 := version.NewVersion(current)
	lv, err2 := version.NewVersion(latest)
	if err1 != nil || err2 != nil {
		// Unparseable versions: don't prompt an update.
		return false
	}

	return lv.GreaterThan(cv)
}

// GetRequestsStatus returns whether requests feature is enabled
func GetRequestsStatus(c *gin.Context) {
	requestsEnabled, exists := c.Get("requestsEnabled")
	if !exists || !requestsEnabled.(bool) {
		helpers.RespondWithSuccess(c, gin.H{
			"enabled": false,
		})
		return
	}

	helpers.RespondWithSuccess(c, gin.H{
		"enabled": true,
	})
}
