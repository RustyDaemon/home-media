# Frontend build stage
# Use an LTS Debian-based Node image to avoid musl-specific optional native package issues.
# Pin this stage to the build host's native architecture (--platform=$BUILDPLATFORM).
# The output is static JS/HTML/CSS, which is architecture-independent, so there is no
# need to run Vite's native bundler under QEMU emulation — doing so segfaults (signal 11).
FROM --platform=$BUILDPLATFORM node:22-bookworm-slim AS frontend-builder

ARG VERSION=dev

WORKDIR /app/frontend

# Run pnpm in non-interactive (CI) mode so it never prompts to purge the
# modules directory — there is no TTY inside the Docker build.
ENV CI=true

# pnpm is provided via corepack; the version is pinned by the
# "packageManager" field in frontend/package.json.
RUN corepack enable

COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY frontend/ ./
RUN VITE_APP_VERSION=${VERSION} pnpm run build

# Backend build stage
FROM golang:1.26.11-alpine AS backend-builder

ARG VERSION=dev

RUN apk add --no-cache git gcc musl-dev

WORKDIR /app/backend

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./

# Pull the built frontend into the embed location
COPY --from=frontend-builder /app/frontend/dist ./web/dist

RUN CGO_ENABLED=1 GOOS=linux \
    go build -ldflags "-X main.version=${VERSION}" \
    -o home-media .

# Production stage
FROM alpine:latest

RUN apk add --no-cache ca-certificates sqlite

RUN addgroup -g 1001 -S appuser && \
    adduser -S -D -H -u 1001 -s /sbin/nologin -G appuser appuser

WORKDIR /app

COPY --from=backend-builder /app/backend/home-media .

RUN mkdir -p /app/data && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

CMD ["./home-media"]
