# Home Media

Simple media management application. Allows you to organize your media collection (movies, TV shows, music) in a unified interface.

## Features

- 📀 View, add, edit, and delete media items
- ⭐ Ratings and reviews
- 🎲 Movie randomizer
- 👥 User authentication and roles (admin, guest)
- 📊 Statistics
- 🔍 Search and sort
- 📱 Responsive themed UI

> ⚠️ Note: This project is in early development. Features and configurations may change significantly in the near future. Always do a backup of your data! I am not responsible for any data loss nor any security issues arising from the use of this software.

## Getting Started

### Docker compose (single image)

```yaml
services:
  homemedia:
    image: rustydaemon/homemedia:latest
    container_name: homemedia
    restart: unless-stopped
    ports:
      - "9812:8080" # host:container
    environment:
      - JWT_SECRET=your-long-random-secret-key # Change this to a secure random value in production
      - ENABLE_GUEST_MODE=true # Enable guest mode (read-only)
      - ENABLE_REQUESTS=true # Enable media requests
      # Write rate limiting per client IP (defaults shown); only set to override.
      # - WRITE_RATE_LIMIT=1.0 # sustained write requests/second
      # - WRITE_RATE_BURST=10 # burst before requests are throttled (HTTP 429)
      # Same-origin in single-binary mode; only set if you front this with a different origin.
      # - ALLOWED_ORIGINS=https://homemedia.example.com
    volumes:
      - /mnt/mystorage/homemedia:/app/data # Use a persistent volume
```

Access the application at: `http://YOUR_SERVER_IP:9812`

### Docker compose (Traefik)

```yaml
services:
  homemedia:
    image: rustydaemon/homemedia:latest
    container_name: homemedia
    restart: unless-stopped
    environment:
      - JWT_SECRET=your-long-random-secret-key
      - ENABLE_GUEST_MODE=true
      - ENABLE_REQUESTS=true
      # Write rate limiting per client IP (defaults shown); only set to override.
      # - WRITE_RATE_LIMIT=1.0 # sustained write requests/second
      # - WRITE_RATE_BURST=10 # burst before requests are throttled (HTTP 429)
    volumes:
      - /mnt/mystorage/homemedia:/app/data
    networks:
      - proxy
    labels:
      - traefik.enable=true
      - traefik.http.routers.homemedia.rule=Host(`YOUR_SERVER`) # ← Replace with your actual domain
      - traefik.http.services.homemedia.loadbalancer.server.port=8080
      - traefik.http.routers.homemedia.entrypoints=web

networks:
  proxy:
    external: true
```

Access the application at: `http://YOUR_SERVER`

### Credentials

Default credentials (change after first login):

- Username: `admin`
- Password: `admin`

Guest mode (when enabled) provides a read-only `guest` account.

## Configuration

All settings are environment variables:

| Variable            | Default                                       | Description                                                                              |
| ------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `JWT_SECRET`        | —                                             | **Required in production.** Long random string used to sign sessions.                    |
| `ENVIRONMENT`       | `production`                                  | `production` or `development`.                                                           |
| `PORT`              | `8080`                                        | Port to listen on.                                                                       |
| `HOST`              | _(all interfaces)_                            | Address to bind to.                                                                      |
| `ENABLE_GUEST_MODE` | `true`                                        | Enable the read-only `guest` account.                                                    |
| `ENABLE_REQUESTS`   | `true`                                        | Enable the media requests feature.                                                       |
| `WRITE_RATE_LIMIT`  | `1.0`                                         | Sustained write requests per second per client IP.                                       |
| `WRITE_RATE_BURST`  | `10`                                          | Burst of write requests allowed before HTTP 429.                                         |
| `ALLOWED_ORIGINS`   | `http://localhost:5173,http://localhost:3000` | CORS origins (comma-separated). Only needed if the UI is served from a different origin. |

Data (SQLite database and backups) is stored in `/app/data` inside the container — mount a volume there.

## Building from source

Requirements: Go (see `backend/go.mod`), Node.js 22+, pnpm (via `corepack enable`), and a C toolchain (SQLite uses CGO).

```sh
make build              # builds the UI, embeds it, writes bin/home-media
./bin/home-media
```

Development (two terminals):

```sh
cp backend/.env.example backend/.env   # sets ENVIRONMENT=development
make dev-backend                       # API on :8080
make dev-frontend                      # UI on :5173
```

Docker image:

```sh
docker build -t homemedia .
```

## Security

See [SECURITY.md](SECURITY.md) for how to report a vulnerability.

## License

Copyright © 2025-2026 RustyDaemon.

This project is free software licensed under the [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0-only). If you run a modified version as a network service, you must make your modified source available to its users.
