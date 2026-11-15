VERSION ?= dev

.PHONY: build frontend backend clean dev-backend dev-frontend run

build: frontend backend

frontend:
	cd frontend && pnpm install && pnpm run build
	find backend/web/dist -mindepth 1 ! -name .gitkeep -delete
	cp -R frontend/dist/. backend/web/dist/

backend:
	mkdir -p bin
	cd backend && go build -ldflags "-X main.version=$(VERSION)" -o ../bin/home-media .

run: build
	./bin/home-media

clean:
	rm -rf frontend/dist bin
	find backend/web/dist -mindepth 1 ! -name .gitkeep -delete

dev-backend:
	cd backend && go run .

dev-frontend:
	cd frontend && pnpm run dev
