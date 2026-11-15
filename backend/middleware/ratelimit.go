package middleware

import (
	"home-media-backend/helpers"
	"math"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// ipRateLimiter is a dependency-free, in-memory per-IP token-bucket limiter
// used to throttle brute-force attempts against sensitive endpoints such as
// login. State is process-local; a multi-instance deployment would need a
// shared store (e.g. Redis) to enforce the limit globally.
type ipRateLimiter struct {
	mu       sync.Mutex
	buckets  map[string]*bucket
	rate     float64       // tokens refilled per second
	capacity float64       // bucket size (burst allowance)
	ttl      time.Duration // idle buckets older than this are evicted
}

type bucket struct {
	tokens   float64
	lastSeen time.Time
}

func newIPRateLimiter(rate, capacity float64, ttl time.Duration) *ipRateLimiter {
	return &ipRateLimiter{
		buckets:  make(map[string]*bucket),
		rate:     rate,
		capacity: capacity,
		ttl:      ttl,
	}
}

// allow consumes a token for key, returning false when the bucket is empty.
func (rl *ipRateLimiter) allow(key string, now time.Time) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	b, ok := rl.buckets[key]
	if !ok {
		rl.buckets[key] = &bucket{tokens: rl.capacity - 1, lastSeen: now}
		return true
	}

	// Refill proportionally to elapsed time, capped at capacity.
	elapsed := now.Sub(b.lastSeen).Seconds()
	b.tokens = math.Min(rl.capacity, b.tokens+elapsed*rl.rate)
	b.lastSeen = now

	if b.tokens < 1 {
		return false
	}
	b.tokens--
	return true
}

// cleanupLoop periodically evicts idle buckets so the map cannot grow without
// bound under a stream of distinct client IPs.
func (rl *ipRateLimiter) cleanupLoop() {
	ticker := time.NewTicker(rl.ttl)
	for now := range ticker.C {
		rl.mu.Lock()
		cutoff := now.Add(-rl.ttl)
		for k, b := range rl.buckets {
			if b.lastSeen.Before(cutoff) {
				delete(rl.buckets, k)
			}
		}
		rl.mu.Unlock()
	}
}

// RateLimitWrites returns middleware that throttles only mutating requests
// (POST/PUT/PATCH/DELETE) to a sustained `rate` requests/second with a burst of
// `capacity`, sharing a single per-IP limiter across every write endpoint.
// Read requests and CORS preflight (OPTIONS) pass through untouched. Requests
// over the limit receive HTTP 429. Client IP comes from gin's ClientIP(), which
// honours X-Forwarded-For only for configured trusted proxies.
func RateLimitWrites(rate, capacity float64) gin.HandlerFunc {
	rl := newIPRateLimiter(rate, capacity, 10*time.Minute)
	go rl.cleanupLoop()

	return func(c *gin.Context) {
		switch c.Request.Method {
		case http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete:
			if !rl.allow(c.ClientIP(), time.Now()) {
				helpers.RespondWithError(c, http.StatusTooManyRequests, helpers.ErrorTypeTooManyReqs, "Too many requests, please try again later")
				c.Abort()
				return
			}
		}
		c.Next()
	}
}
