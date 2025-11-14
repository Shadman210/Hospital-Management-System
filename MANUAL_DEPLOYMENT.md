# Manual Deployment Guide

This guide explains how to deploy the Hospital Management System manually without Docker, with all dependencies installed automatically.

## Quick Start

### One-Command Deployment

```bash
./deploy-manual.sh
```

This script will automatically:
1. ✅ Install Node.js 18.x (if not present)
2. ✅ Install MongoDB 7.0 (if not present)
3. ✅ Start MongoDB service
4. ✅ Install backend dependencies
5. ✅ Install frontend dependencies
6. ✅ Create environment files
7. ✅ Create admin user
8. ✅ Start backend on port 4000
9. ✅ Start frontend on port 4001

## Application Ports

- **Frontend**: http://localhost:4001
- **Backend API**: http://localhost:4000
- **MongoDB**: mongodb://localhost:27017/hospitaldb

## Default Credentials

```
Email:    admin@example.com
Password: admin123
```

## Managing the Application

### Start Services

```bash
./deploy-manual.sh
```

### Stop Services

```bash
./stop-manual.sh
```

### View Logs

```bash
# Backend logs
tail -f backend/logs/backend.log

# Frontend logs
tail -f frontend/logs/frontend.log

# View last 50 lines
tail -n 50 backend/logs/backend.log
```

### Check MongoDB Status

```bash
sudo systemctl status mongod
```

### Restart MongoDB

```bash
sudo systemctl restart mongod
```

## Manual Installation Steps

If you prefer to run each step manually:

### 1. Install Node.js

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node -v
npm -v
```

### 2. Install MongoDB

```bash
# Import MongoDB GPG key
sudo apt-get install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
    sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
    sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 5. Create Environment Files

**Backend** (`backend/.env`):
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/hospitaldb
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```env
PORT=4001
REACT_APP_API_URL=http://localhost:4000
BROWSER=none
```

### 6. Create Admin User

```bash
cd backend
node createAdmin.js
```

### 7. Start Backend

```bash
cd backend
node server.js
```

Keep this terminal open or run in background:
```bash
nohup node server.js > logs/backend.log 2>&1 &
```

### 8. Start Frontend

In a new terminal:
```bash
cd frontend
npm start
```

Or run in background:
```bash
nohup npm start > logs/frontend.log 2>&1 &
```

## Process Management

### Find Running Processes

```bash
# Find backend process
ps aux | grep "node server.js"

# Find frontend process
ps aux | grep "react-scripts start"

# Check what's using port 4000
sudo lsof -i :4000

# Check what's using port 4001
sudo lsof -i :4001
```

### Kill Processes

```bash
# Kill backend
kill $(lsof -t -i:4000)

# Kill frontend
kill $(lsof -t -i:4001)

# Force kill if needed
kill -9 $(lsof -t -i:4000)
kill -9 $(lsof -t -i:4001)
```

## Troubleshooting

### Port Already in Use

```bash
# Find what's using the port
sudo lsof -i :4000
sudo lsof -i :4001

# Kill the process
kill -9 $(lsof -t -i:4000)
kill -9 $(lsof -t -i:4001)

# Then restart the application
./deploy-manual.sh
```

### MongoDB Not Starting

```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod

# If service fails, try manual start
sudo mongod --fork --logpath /var/log/mongodb/mongod.log --dbpath /var/lib/mongodb
```

### Backend Connection Error

```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Test MongoDB connection
mongosh

# Check backend logs
tail -f backend/logs/backend.log
```

### Frontend Won't Start

```bash
# Clear npm cache
cd frontend
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
sudo lsof -i :4001

# Start with verbose logging
PORT=4001 npm start
```

### Dependencies Installation Failed

```bash
# Update npm
sudo npm install -g npm@latest

# Clear npm cache
npm cache clean --force

# Try installing with legacy peer deps
npm install --legacy-peer-deps
```

## Updating the Application

### Update Backend Code

```bash
# Stop services
./stop-manual.sh

# Pull latest code
git pull

# Install new dependencies
cd backend
npm install

# Restart
cd ..
./deploy-manual.sh
```

### Update Frontend Code

```bash
# Stop services
./stop-manual.sh

# Pull latest code
git pull

# Install new dependencies
cd frontend
npm install

# Restart
cd ..
./deploy-manual.sh
```

## Database Management

### Access MongoDB Shell

```bash
mongosh
use hospitaldb
db.users.find()
db.doctors.find()
db.appointments.find()
```

### Backup Database

```bash
# Create backup directory
mkdir -p ~/mongodb-backups

# Export database
mongodump --db hospitaldb --out ~/mongodb-backups/backup-$(date +%Y%m%d-%H%M%S)

# List backups
ls -lh ~/mongodb-backups/
```

### Restore Database

```bash
# Restore from backup
mongorestore --db hospitaldb ~/mongodb-backups/backup-20250115-120000/hospitaldb

# Drop existing database first (if needed)
mongosh hospitaldb --eval "db.dropDatabase()"
mongorestore --db hospitaldb ~/mongodb-backups/backup-20250115-120000/hospitaldb
```

### Clear All Data

```bash
# WARNING: This deletes all data!
mongosh hospitaldb --eval "db.dropDatabase()"

# Then recreate admin user
cd backend
node createAdmin.js
```

## System Service Setup (Optional)

To run the application as a system service:

### Create Backend Service

```bash
sudo tee /etc/systemd/system/hospital-backend.service > /dev/null <<EOF
[Unit]
Description=Hospital Management System Backend
After=network.target mongodb.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$PWD/backend
Environment=NODE_ENV=production
Environment=PORT=4000
Environment=MONGODB_URI=mongodb://localhost:27017/hospitaldb
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable hospital-backend
sudo systemctl start hospital-backend

# Check status
sudo systemctl status hospital-backend
```

### Create Frontend Service

```bash
sudo tee /etc/systemd/system/hospital-frontend.service > /dev/null <<EOF
[Unit]
Description=Hospital Management System Frontend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PWD/frontend
Environment=PORT=4001
Environment=REACT_APP_API_URL=http://localhost:4000
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable hospital-frontend
sudo systemctl start hospital-frontend

# Check status
sudo systemctl status hospital-frontend
```

### Manage System Services

```bash
# Start services
sudo systemctl start hospital-backend
sudo systemctl start hospital-frontend

# Stop services
sudo systemctl stop hospital-backend
sudo systemctl stop hospital-frontend

# Restart services
sudo systemctl restart hospital-backend
sudo systemctl restart hospital-frontend

# View logs
sudo journalctl -u hospital-backend -f
sudo journalctl -u hospital-frontend -f
```

## Performance Monitoring

### Check Resource Usage

```bash
# CPU and Memory usage
top

# Specific to Node processes
ps aux | grep node

# Memory usage by process
ps aux --sort=-%mem | head

# Disk usage
df -h
```

### Monitor Logs in Real-time

```bash
# Backend
tail -f backend/logs/backend.log

# Frontend
tail -f frontend/logs/frontend.log

# MongoDB
sudo tail -f /var/log/mongodb/mongod.log

# System messages
sudo tail -f /var/log/syslog
```

## Firewall Configuration

If you need to access the application from other machines:

```bash
# Allow ports through firewall
sudo ufw allow 4000/tcp
sudo ufw allow 4001/tcp
sudo ufw reload

# Check firewall status
sudo ufw status
```

## Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 4000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/hospitaldb |
| `NODE_ENV` | Environment mode | development |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Frontend server port | 4001 |
| `REACT_APP_API_URL` | Backend API URL | http://localhost:4000 |
| `BROWSER` | Auto-open browser | none |

## Uninstalling

To completely remove the application:

```bash
# Stop services
./stop-manual.sh

# Remove application files
cd ..
rm -rf Hospital-Management-System

# Remove MongoDB (optional)
sudo systemctl stop mongod
sudo systemctl disable mongod
sudo apt-get purge mongodb-org*
sudo rm -r /var/log/mongodb
sudo rm -r /var/lib/mongodb

# Remove Node.js (optional)
sudo apt-get purge nodejs npm
```

## Support

For issues or questions:
- Check logs in `backend/logs/` and `frontend/logs/`
- Review [README.md](README.md)
- Check MongoDB logs: `sudo tail -f /var/log/mongodb/mongod.log`

## Comparison: Docker vs Manual

| Feature | Docker | Manual |
|---------|--------|--------|
| Installation | Simple | Requires manual steps |
| Dependencies | Isolated | System-wide |
| Port Management | Easy to change | Requires .env changes |
| Data Persistence | Volumes | Local MongoDB |
| Production Ready | Yes | Needs hardening |
| Performance | Slight overhead | Native |
| Debugging | Logs in containers | Direct file access |
| Cleanup | Simple (`docker-compose down`) | Manual removal |

Choose Docker for production and consistency. Choose Manual for development and debugging.
