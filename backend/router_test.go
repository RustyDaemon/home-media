package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"home-media-backend/config"
	"home-media-backend/database"
	"home-media-backend/handlers"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
	handlers.InitializeAuth("test-secret")
}

// testConfig returns a config with a generous rate limit so tests that are not
// about rate limiting never trip it.
func testConfig() *config.Config {
	return &config.Config{
		AllowedOrigins:  []string{"http://localhost:5173"},
		EnableGuestMode: true,
		EnableRequests:  true,
		WriteRateLimit:  1000,
		WriteRateBurst:  1000,
	}
}

// newTestServer gives each test a fresh database (seeded with admin/admin and
// guest/guest) and a router built exactly as main() builds it.
func newTestServer(t *testing.T, cfg *config.Config) *gin.Engine {
	t.Helper()
	database.Initialize(filepath.Join(t.TempDir(), "test.db"))
	r, err := newRouter(cfg)
	if err != nil {
		t.Fatalf("newRouter: %v", err)
	}
	return r
}

type apiResponse struct {
	Success bool            `json:"success"`
	Error   string          `json:"error"`
	Message string          `json:"message"`
	Data    json.RawMessage `json:"data"`
}

func do(t *testing.T, r http.Handler, method, path, token string, body any, mutate ...func(*http.Request)) (int, apiResponse) {
	t.Helper()
	var buf bytes.Buffer
	if body != nil {
		if err := json.NewEncoder(&buf).Encode(body); err != nil {
			t.Fatal(err)
		}
	}
	req := httptest.NewRequest(method, path, &buf)
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	for _, m := range mutate {
		m(req)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var resp apiResponse
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	return w.Code, resp
}

func login(t *testing.T, r http.Handler, username, password string) (int, string) {
	t.Helper()
	code, resp := do(t, r, http.MethodPost, "/api/login", "", map[string]string{"username": username, "password": password})
	var data struct {
		Token string `json:"token"`
	}
	_ = json.Unmarshal(resp.Data, &data)
	return code, data.Token
}

func TestGuestLoginFollowsGuestMode(t *testing.T) {
	cfg := testConfig()
	cfg.EnableGuestMode = false
	r := newTestServer(t, cfg)

	if code, _ := login(t, r, "guest", "guest"); code != http.StatusUnauthorized {
		t.Fatalf("guest login with guest mode off: got %d, want 401", code)
	}

	cfg.EnableGuestMode = true
	r, _ = newRouter(cfg)
	if code, _ := login(t, r, "guest", "guest"); code != http.StatusOK {
		t.Fatalf("guest login with guest mode on: got %d, want 200", code)
	}
}

func TestGuestTokenRejectedWhenGuestModeTurnedOff(t *testing.T) {
	cfg := testConfig()
	on := newTestServer(t, cfg)
	_, token := login(t, on, "guest", "guest")
	if token == "" {
		t.Fatal("expected a guest token while guest mode is on")
	}
	if code, _ := do(t, on, http.MethodGet, "/api/media", token, nil); code != http.StatusOK {
		t.Fatalf("guest read with guest mode on: got %d, want 200", code)
	}

	// Same database, server restarted with guest mode off.
	cfg.EnableGuestMode = false
	off, _ := newRouter(cfg)
	if code, _ := do(t, off, http.MethodGet, "/api/media", token, nil); code != http.StatusUnauthorized {
		t.Fatalf("existing guest token with guest mode off: got %d, want 401", code)
	}
}

func TestDefaultPasswordMustBeChangedBeforeUsingAPI(t *testing.T) {
	r := newTestServer(t, testConfig())

	_, token := login(t, r, "admin", "admin")
	if token == "" {
		t.Fatal("admin/admin login failed")
	}

	for _, path := range []string{"/api/media", "/api/stats", "/api/backup/dump", "/api/export/csv"} {
		code, resp := do(t, r, http.MethodGet, path, token, nil)
		if code != http.StatusForbidden || resp.Error != "password_change_required" {
			t.Errorf("GET %s before password change: got %d %q, want 403 password_change_required", path, code, resp.Error)
		}
	}
	if code, _ := do(t, r, http.MethodPost, "/api/media/bulk-delete", token, map[string]any{"ids": []int{1}}); code != http.StatusForbidden {
		t.Errorf("bulk delete before password change: got %d, want 403", code)
	}

	if code, _ := do(t, r, http.MethodGet, "/api/auth/status", token, nil); code != http.StatusOK {
		t.Fatalf("auth status before password change: got %d, want 200", code)
	}

	change := func(oldPw, newPw string) (int, string) {
		code, resp := do(t, r, http.MethodPost, "/api/auth/change-password", token, map[string]string{"old_password": oldPw, "new_password": newPw})
		var data struct {
			Token string `json:"token"`
		}
		_ = json.Unmarshal(resp.Data, &data)
		return code, data.Token
	}
	if code, _ := change("admin", "admin"); code != http.StatusBadRequest {
		t.Errorf("changing to the same password: got %d, want 400", code)
	}
	if code, _ := change("admin", "short"); code != http.StatusBadRequest {
		t.Errorf("changing to a too-short password: got %d, want 400", code)
	}
	code, newToken := change("admin", "a-better-password")
	if code != http.StatusOK || newToken == "" {
		t.Fatalf("valid password change: got %d, want 200 with a token", code)
	}
	if code, _ := change("a-better-password", "a-better-password"); code != http.StatusBadRequest {
		t.Errorf("changing a long password to itself: got %d, want 400", code)
	}

	for _, tok := range []string{token, newToken} {
		if code, _ := do(t, r, http.MethodGet, "/api/media", tok, nil); code != http.StatusOK {
			t.Errorf("GET /api/media after password change: got %d, want 200", code)
		}
	}
}

func TestRateLimitIgnoresSpoofedForwardedFor(t *testing.T) {
	cfg := testConfig()
	cfg.WriteRateLimit = 0.001
	cfg.WriteRateBurst = 2
	r := newTestServer(t, cfg)

	var last int
	for i := range 3 {
		last, _ = do(t, r, http.MethodPost, "/api/login", "", map[string]string{"username": "x", "password": "y"}, func(req *http.Request) {
			req.Header.Set("X-Forwarded-For", fmt.Sprintf("203.0.113.%d", i+1))
		})
	}
	if last != http.StatusTooManyRequests {
		t.Fatalf("third write from one client with rotating X-Forwarded-For: got %d, want 429", last)
	}
}

func TestRateLimitUsesForwardedForFromTrustedProxy(t *testing.T) {
	cfg := testConfig()
	cfg.WriteRateLimit = 0.001
	cfg.WriteRateBurst = 2
	cfg.TrustedProxies = []string{"192.0.2.0/24"} // httptest's RemoteAddr is 192.0.2.1
	r := newTestServer(t, cfg)

	for i := range 5 {
		code, _ := do(t, r, http.MethodPost, "/api/login", "", map[string]string{"username": "x", "password": "y"}, func(req *http.Request) {
			req.Header.Set("X-Forwarded-For", fmt.Sprintf("203.0.113.%d", i+1))
		})
		if code == http.StatusTooManyRequests {
			t.Fatalf("request %d from a distinct client behind a trusted proxy was throttled", i+1)
		}
	}
}

func TestInvalidTrustedProxiesIsRejected(t *testing.T) {
	cfg := testConfig()
	cfg.TrustedProxies = []string{"not-an-ip"}
	if _, err := newRouter(cfg); err == nil {
		t.Fatal("expected an error for an invalid TRUSTED_PROXIES entry")
	}
}
