# Docker Commands Quick Reference

## Deployment

### Quick Deploy (Recommended)
```bash
./deploy.sh
```

### Manual Deploy
```bash
docker-compose up -d
```

### Build and Deploy
```bash
docker-compose up -d --build
```

## Service Management

### Start Services
```bash
docker-compose start
```

### Stop Services
```bash
docker-compose stop
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Stop and Remove Everything
```bash
docker-compose down

# Also remove volumes (deletes all data)
docker-compose down -v
```

## Logs and Monitoring

### View All Logs
```bash
docker-compose logs -f
```

### View Specific Service Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
docker-compose logs -f admin-init
```

### Check Service Status
```bash
docker-compose ps
```

### Monitor Resource Usage
```bash
docker stats
```

## Rebuilding After Changes

### Rebuild Specific Service
```bash
# Backend changes
docker-compose build backend
docker-compose up -d backend

# Frontend changes
docker-compose build frontend
docker-compose up -d frontend
```

### Rebuild All Services
```bash
docker-compose build --no-cache
docker-compose up -d
```

## Database Operations

### Access MongoDB Shell
```bash
docker exec -it hospital-mongodb mongosh
```

### Backup Database
```bash
# Create backup
docker exec hospital-mongodb mongodump --out /data/backup

# Copy to host
docker cp hospital-mongodb:/data/backup ./mongodb-backup-$(date +%Y%m%d)
```

### Restore Database
```bash
# Copy backup to container
docker cp ./mongodb-backup hospital-mongodb:/data/backup

# Restore
docker exec hospital-mongodb mongorestore /data/backup
```

### View Database Collections
```bash
docker exec hospital-mongodb mongosh hospitaldb --eval "db.getCollectionNames()"
```

## Container Management

### Enter Container Shell
```bash
# Backend
docker exec -it hospital-backend sh

# Frontend (Nginx)
docker exec -it hospital-frontend sh

# MongoDB
docker exec -it hospital-mongodb sh
```

### View Container Details
```bash
docker inspect hospital-backend
```

### Copy Files To/From Container
```bash
# Copy from container to host
docker cp hospital-backend:/app/file.txt ./

# Copy from host to container
docker cp ./file.txt hospital-backend:/app/
```

## Network and Connectivity

### List Networks
```bash
docker network ls
```

### Inspect Network
```bash
docker network inspect hospital-management-system_hospital-network
```

### Test Connectivity
```bash
# Check if backend is accessible
curl http://localhost:5000

# Check if frontend is accessible
curl http://localhost:3000
```

## Volume Management

### List Volumes
```bash
docker volume ls
```

### Inspect Volume
```bash
docker volume inspect hospital-management-system_mongodb_data
```

### Remove Unused Volumes
```bash
docker volume prune
```

## Troubleshooting

### View Container Logs (Last 100 lines)
```bash
docker-compose logs --tail=100 backend
```

### Check Container Health
```bash
docker inspect --format='{{json .State.Health}}' hospital-mongodb
```

### Restart Stuck Container
```bash
docker restart hospital-backend
```

### Remove and Recreate Service
```bash
docker-compose rm -f backend
docker-compose up -d backend
```

### Clean Up Everything
```bash
# Stop all containers
docker-compose down -v

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune

# Full system cleanup (careful!)
docker system prune -a --volumes
```

## Scaling (Advanced)

### Scale Backend Instances
```bash
docker-compose up -d --scale backend=3
```

**Note**: For production scaling, you'll need:
- Load balancer (Nginx/HAProxy)
- Sticky sessions for Socket.io
- Shared session storage (Redis)

## Production Tips

### Run in Background (Detached Mode)
```bash
docker-compose up -d
```

### View Only Errors in Logs
```bash
docker-compose logs | grep -i error
```

### Export Container as Image
```bash
docker commit hospital-backend hospital-backend-backup:$(date +%Y%m%d)
```

### Save Image to File
```bash
docker save hospital-backend:latest | gzip > hospital-backend.tar.gz
```

### Load Image from File
```bash
docker load < hospital-backend.tar.gz
```

## Environment Management

### Override Environment Variables
Create `docker-compose.override.yml`:
```yaml
version: '3.8'
services:
  backend:
    environment:
      - NODE_ENV=development
      - DEBUG=true
```

### Use Different Compose File
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Quick Fixes

### Port Already in Use
```bash
# Find process using port
sudo lsof -i :5000
sudo lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Out of Disk Space
```bash
# Clean up unused resources
docker system prune -a --volumes

# Check disk usage
docker system df
```

### Container Keeps Restarting
```bash
# Check logs
docker-compose logs backend

# Remove restart policy temporarily
docker update --restart=no hospital-backend
```

## Useful Aliases

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# Docker Compose shortcuts
alias dc='docker-compose'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias dcps='docker-compose ps'
alias dcr='docker-compose restart'

# Hospital Management System specific
alias hospital-logs='docker-compose -f /path/to/Hospital-Management-System/docker-compose.yml logs -f'
alias hospital-restart='docker-compose -f /path/to/Hospital-Management-System/docker-compose.yml restart'
```

## Health Checks

### Check All Services
```bash
#!/bin/bash
echo "Checking MongoDB..."
docker exec hospital-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null && echo "✓ MongoDB OK" || echo "✗ MongoDB Failed"

echo "Checking Backend..."
curl -s http://localhost:5000 > /dev/null && echo "✓ Backend OK" || echo "✗ Backend Failed"

echo "Checking Frontend..."
curl -s http://localhost:3000 > /dev/null && echo "✓ Frontend OK" || echo "✗ Frontend Failed"
```

Save as `health-check.sh` and run: `chmod +x health-check.sh && ./health-check.sh`
