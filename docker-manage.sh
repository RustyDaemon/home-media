#!/bin/bash

# Home Media Script
# This script helps you manage the Docker deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to get version from git
get_version() {
    # try git tag first
    if git describe --tags --exact-match >/dev/null 2>&1; then
        git describe --tags --exact-match
    elif git describe --tags >/dev/null 2>&1; then
        git describe --tags
    else
        echo "dev-$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
    fi
}

# Function to build and start services
start_services() {
    local env=${1:-"dev"}
    local version=$(get_version)
    
    print_status "Starting Home Media in $env mode..."
    print_status "Version: $version"

    export VERSION=$version
    
    if [ "$env" = "prod" ]; then
        docker compose -f docker-compose.yml build --build-arg VERSION=$version
        docker compose -f docker-compose.yml up -d
    else
        docker compose -f docker-compose.yml -f docker-compose.dev.yml build --build-arg VERSION=$version
        docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    fi
    
    print_success "Services v${version} started successfully!"
    print_status "App available at: http://localhost:8080 (UI + API served from the same binary)"
}

# Function to stop services
stop_services() {
    print_status "Stopping Home Media services..."
    docker compose down
    print_success "Services stopped successfully!"
}

# Function to view logs
view_logs() {
    local service=${1:-""}
    
    if [ -z "$service" ]; then
        docker compose logs -f
    else
        docker compose logs -f "$service"
    fi
}

# Function to clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker compose down -v --remove-orphans
    print_success "Cleanup completed!"
}

# Function to show status
show_status() {
    print_status "Docker Compose Services Status:"
    docker compose ps
    
    echo ""
    print_status "Container health status:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Function to build Docker images for Docker Hub
build_images() {
    local version=$(get_version)
    local docker_username=${DOCKER_USERNAME:-""}
    
    if [ -z "$docker_username" ]; then
        print_error "DOCKER_USERNAME environment variable is not set"
        echo "Please set it with: export DOCKER_USERNAME=your-dockerhub-username"
        exit 1
    fi
    
    print_status "Building Docker image for version: $version"
    print_status "Docker Hub username: $docker_username"

    docker build \
        --build-arg VERSION=$version \
        --platform linux/amd64 \
        -t ${docker_username}/homemedia:${version} \
        -t ${docker_username}/homemedia:latest \
        -f Dockerfile \
        .

    print_success "Image built successfully!"
    echo ""
    print_status "Image tags:"
    echo "  - ${docker_username}/homemedia:${version}"
    echo "  - ${docker_username}/homemedia:latest"
    echo ""
    print_status "To push this image to Docker Hub, run:"
    echo "  $0 push"
}

# Function to push Docker images to Docker Hub
push_images() {
    local version=$(get_version)
    local docker_username=${DOCKER_USERNAME:-""}
    
    if [ -z "$docker_username" ]; then
        print_error "DOCKER_USERNAME environment variable is not set"
        echo "Please set it with: export DOCKER_USERNAME=your-dockerhub-username"
        exit 1
    fi
    
    print_status "Checking Docker Hub authentication..."
    if ! docker info | grep -q "Username: $docker_username"; then
        print_warning "Not logged in to Docker Hub"
        print_status "Logging in to Docker Hub..."
        docker login
    fi
    
    print_status "Pushing image to Docker Hub..."

    print_status "Pushing homemedia:${version}..."
    docker push ${docker_username}/homemedia:${version}

    print_status "Pushing homemedia:latest..."
    docker push ${docker_username}/homemedia:latest

    print_success "Image pushed successfully!"
    echo ""
    print_status "Image available at:"
    echo "  - https://hub.docker.com/r/${docker_username}/homemedia"
}

# Function to build and push in one command
build_and_push() {
    check_docker
    build_images
    echo ""
    print_warning "Ready to push image to Docker Hub. Continue? (y/N)"
    read -r confirm

    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        push_images
    else
        print_status "Push cancelled. You can push later with: $0 push"
    fi
}

# Main script logic
case "${1:-help}" in
    "start"|"up")
        check_docker
        start_services "${2:-dev}"
        ;;
    "stop"|"down")
        stop_services
        ;;
    "restart")
        check_docker
        stop_services
        start_services "${2:-dev}"
        ;;
    "logs")
        view_logs "$2"
        ;;
    "status")
        show_status
        ;;
    "version")
        get_version
        ;;
    "cleanup")
        cleanup
        ;;
    "build")
        check_docker
        build_images
        ;;
    "push")
        check_docker
        push_images
        ;;
    "release")
        build_and_push
        ;;
    "help"|*)
        echo "Home Media Script"
        echo ""
        echo "Usage: $0 <command> [options]"
        echo ""
        echo "Commands:"
        echo "  start [dev|prod]  - Start services (default: dev)"
        echo "  stop              - Stop services"
        echo "  restart [dev|prod]- Restart services"
        echo "  version           - Get version"
        echo "  logs [service]    - View logs (all services or specific service)"
        echo "  status            - Show services status"
        echo "  cleanup           - Stop services and clean up Docker resources"
        echo "  build             - Build Docker image for Docker Hub (with version tags)"
        echo "  push              - Push built image to Docker Hub"
        echo "  release           - Build and push image to Docker Hub"
        echo "  help              - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 start          - Start in development mode"
        echo "  $0 start prod     - Start in production mode"
        echo "  $0 logs           - View app logs"
        echo "  $0 build          - Build image with current version tag"
        echo "  $0 release        - Build and push image to Docker Hub"
        echo ""
        echo "Docker Hub Commands:"
        echo "  Before using build/push/release commands, set your Docker Hub username:"
        echo "  export DOCKER_USERNAME=your-dockerhub-username"
        ;;
esac