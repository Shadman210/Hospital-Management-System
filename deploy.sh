#!/bin/bash

# Hospital Management System Deployment Script
# This script builds and deploys the entire application using Docker Compose

set -e

echo "🏥 Hospital Management System - Deployment Script"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed"
    exit 1
fi

# Stop and remove existing containers
echo ""
echo "🛑 Stopping existing containers..."
docker-compose down -v

# Build images
echo ""
echo "🔨 Building Docker images..."
docker-compose build --no-cache

# Start services
echo ""
echo "🚀 Starting services..."
docker-compose up -d

# Wait for MongoDB to be ready
echo ""
echo "⏳ Waiting for MongoDB to be ready..."
sleep 10

# Check if admin-init completed successfully
echo ""
echo "👤 Creating admin user..."
docker-compose logs admin-init

# Show running containers
echo ""
echo "📦 Running containers:"
docker-compose ps

# Display access information
echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📱 Application URLs:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:5000"
echo "   MongoDB:   mongodb://localhost:27017/hospitaldb"
echo ""
echo "🔐 Default Admin Credentials:"
echo "   Email:     admin@example.com"
echo "   Password:  admin123"
echo ""
echo "📝 Useful commands:"
echo "   View logs:     docker-compose logs -f [service-name]"
echo "   Stop all:      docker-compose down"
echo "   Restart:       docker-compose restart [service-name]"
echo ""
