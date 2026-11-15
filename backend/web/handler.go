package web

import (
	"io/fs"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// SPAHandler serves the embedded React build with SPA fallback semantics.
// Files that exist in dist/ are served directly with cache headers; any other
// path returns dist/index.html so client-side routing (React Router) can take over.
//
// In dev, the frontend is served by `vite dev` separately and the embedded
// dist/ may be empty (only a .gitkeep). In that case we return a small
// placeholder explaining the situation instead of crashing the binary.
func SPAHandler() gin.HandlerFunc {
	sub, err := fs.Sub(Dist, "dist")
	if err != nil {
		return notBuiltHandler("embedded frontend missing: " + err.Error())
	}
	if _, err := fs.Stat(sub, "index.html"); err != nil {
		return notBuiltHandler("embedded frontend not built — run `make frontend` (or `make build`) to bundle the UI into this binary")
	}

	fileServer := http.FileServer(http.FS(sub))

	return func(c *gin.Context) {
		path := strings.TrimPrefix(c.Request.URL.Path, "/")

		if strings.HasPrefix(path, "api/") || path == "api" {
			c.Status(http.StatusNotFound)
			return
		}

		setSecurityHeaders(c)

		if path == "" {
			serveIndex(c, fileServer)
			return
		}

		if info, err := fs.Stat(sub, path); err == nil && !info.IsDir() {
			if strings.HasPrefix(path, "assets/") {
				c.Header("Cache-Control", "public, max-age=31536000, immutable")
			}
			fileServer.ServeHTTP(c.Writer, c.Request)
			return
		}

		serveIndex(c, fileServer)
	}
}

func serveIndex(c *gin.Context, fileServer http.Handler) {
	c.Header("Cache-Control", "no-cache")
	c.Request.URL.Path = "/"
	fileServer.ServeHTTP(c.Writer, c.Request)
}

func setSecurityHeaders(c *gin.Context) {
	c.Header("X-Frame-Options", "SAMEORIGIN")
	c.Header("X-Content-Type-Options", "nosniff")
	c.Header("X-XSS-Protection", "1; mode=block")
	c.Header("Referrer-Policy", "no-referrer-when-downgrade")
}

func notBuiltHandler(msg string) gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/api/") {
			c.Status(http.StatusNotFound)
			return
		}
		c.String(http.StatusServiceUnavailable, msg)
	}
}
