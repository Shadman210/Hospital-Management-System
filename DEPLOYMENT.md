# Deployment Guide - Hospital Management System

This guide explains how to deploy the Hospital Management System using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose 2.0 or higher
- Git (for cloning the repository)

### Install Docker

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**macOS:**
Download and install [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)

**Windows:**
Download and install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)

## Quick Deployment

### One-Command Deployment

```bash
./deploy.sh
```

This script will:
1. Stop any existing containers
2. Build all Docker images
3. Start MongoDB, Backend, and Frontend services
4. Automatically create the admin user
5. Display access information

### Manual Deployment

If you prefer to run commands manually:

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Services

The deployment includes three main services:

### 1. MongoDB (Port 27017)
- **Container**: `hospital-mongodb`
- **Database**: `hospitaldb`
- **Data persistence**: Named volume `mongodb_data`

### 2. Backend API (Port 5000)
- **Container**: `hospital-backend`
- **Tech**: Node.js + Express + Socket.io
- **Endpoints**: REST API + WebSocket for real-time chat

### 3. Frontend (Port 3000)
- **Container**: `hospital-frontend`
- **Tech**: React served via Nginx
- **Features**: SPA with React Router

### 4. Admin Initialization
- **Container**: `hospital-admin-init` (runs once and exits)
- **Purpose**: Creates initial admin account
- **Credentials**:
  - Email: `admin@example.com`
  - Password: `admin123`

## Access the Application

Once deployed, access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017/hospitaldb

## Docker Commands

### View Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes all data)
docker-compose down -v
```

### Rebuild After Code Changes
```bash
# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Rebuild all services
docker-compose build
docker-compose up -d
```

## Environment Configuration

Environment variables are set in `docker-compose.yml`:

### Backend Environment Variables
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Environment mode (production/development)

### Frontend Environment Variables
- `REACT_APP_API_URL`: Backend API URL

To modify these, edit the `docker-compose.yml` file or create a `.env` file.

## Production Deployment

### Using Docker on a Server

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Hospital-Management-System
   ```

2. **Update environment variables** in `docker-compose.yml`:
   ```yaml
   environment:
     - MONGODB_URI=mongodb://mongodb:27017/hospitaldb
     - NODE_ENV=production
   ```

3. **Deploy**:
   ```bash
   ./deploy.sh
   ```

### Using Docker Swarm (Multi-node)

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml hospital

# View services
docker stack services hospital

# Remove stack
docker stack rm hospital
```

### Using Kubernetes

Convert docker-compose to Kubernetes manifests:
```bash
# Install kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.31.2/kompose-linux-amd64 -o kompose
chmod +x kompose
sudo mv kompose /usr/local/bin/

# Convert to Kubernetes
kompose convert

# Apply to cluster
kubectl apply -f .
```

## Cloud Deployment

### AWS ECS (Elastic Container Service)

1. Install AWS CLI and configure credentials
2. Create ECR repositories for images
3. Build and push images:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

   docker tag hospital-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/hospital-backend:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/hospital-backend:latest
   ```
4. Create ECS task definition and service

### Google Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/hospital-backend ./backend
gcloud builds submit --tag gcr.io/PROJECT-ID/hospital-frontend ./frontend

# Deploy
gcloud run deploy hospital-backend --image gcr.io/PROJECT-ID/hospital-backend --platform managed
gcloud run deploy hospital-frontend --image gcr.io/PROJECT-ID/hospital-frontend --platform managed
```

### Heroku

```bash
# Login to Heroku
heroku login
heroku container:login

# Create app
heroku create hospital-app

# Push and release
heroku container:push web -a hospital-app
heroku container:release web -a hospital-app
```

## Data Persistence

### Backup MongoDB Data

```bash
# Export database
docker exec hospital-mongodb mongodump --out /data/backup

# Copy backup to host
docker cp hospital-mongodb:/data/backup ./mongodb-backup
```

### Restore MongoDB Data

```bash
# Copy backup to container
docker cp ./mongodb-backup hospital-mongodb:/data/backup

# Restore database
docker exec hospital-mongodb mongorestore /data/backup
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect hospital-management-system_mongodb_data

# Backup volume
docker run --rm -v hospital-management-system_mongodb_data:/data -v $(pwd):/backup ubuntu tar czf /backup/mongodb-backup.tar.gz /data

# Restore volume
docker run --rm -v hospital-management-system_mongodb_data:/data -v $(pwd):/backup ubuntu tar xzf /backup/mongodb-backup.tar.gz -C /
```

## Scaling

### Scale Backend Instances

```bash
docker-compose up -d --scale backend=3
```

**Note**: For multiple backend instances, you'll need to:
1. Use a load balancer (Nginx/HAProxy)
2. Configure sticky sessions for Socket.io
3. Use Redis for session storage

## Monitoring

### Health Checks

```bash
# Check backend health
curl http://localhost:5000/

# Check MongoDB health
docker exec hospital-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Resource Usage

```bash
# View container stats
docker stats

# View specific container
docker stats hospital-backend
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend

# Check if port is already in use
sudo lsof -i :5000
sudo lsof -i :3000
```

### MongoDB connection failed

```bash
# Check if MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Connect to MongoDB shell
docker exec -it hospital-mongodb mongosh
```

### Frontend can't connect to Backend

1. Check if backend is running: `curl http://localhost:5000`
2. Verify CORS settings in backend
3. Check network connectivity: `docker network inspect hospital-management-system_hospital-network`

### Clear Everything and Start Fresh

```bash
# Stop and remove everything
docker-compose down -v

# Remove all images
docker rmi $(docker images -q hospital-*)

# Rebuild and start
./deploy.sh
```

## Security Considerations

### Production Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret (not hardcoded)
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS (add reverse proxy like Nginx)
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Regular backups
- [ ] Update dependencies regularly

### Enable HTTPS with Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review [README.md](README.md)
- Open an issue on GitHub

## License

This project is open source and available under the MIT License.
