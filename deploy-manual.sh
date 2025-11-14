#!/bin/bash

# Hospital Management System - Manual Deployment Script
# This script installs all dependencies including MongoDB and runs the application
# Backend: Port 4000
# Frontend: Port 4001

set -e

echo "🏥 Hospital Management System - Manual Deployment"
echo "=================================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    print_warning "This script is optimized for Linux (Ubuntu/Debian)"
    print_warning "For macOS or Windows, you may need to install MongoDB manually"
fi

# Check for sudo privileges
if [ "$EUID" -ne 0 ]; then
    print_warning "Some operations require sudo privileges"
    print_info "You may be prompted for your password"
fi

# Step 1: Check and Install Node.js
echo ""
print_info "Step 1: Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js is already installed: $NODE_VERSION"
else
    print_warning "Node.js not found. Installing Node.js 18.x..."

    # Install Node.js 18.x
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs

    if command -v node &> /dev/null; then
        print_success "Node.js installed successfully: $(node -v)"
    else
        print_error "Failed to install Node.js"
        exit 1
    fi
fi

# Step 2: Check and Install MongoDB
echo ""
print_info "Step 2: Checking MongoDB installation..."
if command -v mongod &> /dev/null; then
    print_success "MongoDB is already installed"
else
    print_warning "MongoDB not found. Installing MongoDB..."

    # Import MongoDB GPG key
    sudo apt-get install -y gnupg curl
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
        sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

    # Add MongoDB repository
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
        sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

    # Update and install MongoDB
    sudo apt-get update
    sudo apt-get install -y mongodb-org

    if command -v mongod &> /dev/null; then
        print_success "MongoDB installed successfully"
    else
        print_error "Failed to install MongoDB"
        exit 1
    fi
fi

# Step 3: Start MongoDB
echo ""
print_info "Step 3: Starting MongoDB..."
if pgrep -x "mongod" > /dev/null; then
    print_success "MongoDB is already running"
else
    print_info "Starting MongoDB service..."
    sudo systemctl start mongod
    sudo systemctl enable mongod

    # Wait for MongoDB to start
    sleep 3

    if pgrep -x "mongod" > /dev/null; then
        print_success "MongoDB started successfully"
    else
        print_error "Failed to start MongoDB"
        print_info "Trying to start manually..."
        sudo mongod --fork --logpath /var/log/mongodb/mongod.log --dbpath /var/lib/mongodb
    fi
fi

# Step 4: Install Backend Dependencies
echo ""
print_info "Step 4: Installing backend dependencies..."
cd "$SCRIPT_DIR/backend"
if [ -f "package.json" ]; then
    npm install
    print_success "Backend dependencies installed"
else
    print_error "Backend package.json not found"
    exit 1
fi

# Step 5: Install Frontend Dependencies
echo ""
print_info "Step 5: Installing frontend dependencies..."
cd "$SCRIPT_DIR/frontend"
if [ -f "package.json" ]; then
    npm install
    print_success "Frontend dependencies installed"
else
    print_error "Frontend package.json not found"
    exit 1
fi

# Step 6: Create Environment Files
echo ""
print_info "Step 6: Creating environment files..."
cd "$SCRIPT_DIR"

# Create backend .env
cat > backend/.env << EOF
PORT=4000
MONGODB_URI=mongodb://localhost:27017/hospitaldb
NODE_ENV=development
EOF
print_success "Backend .env created (Port: 4000)"

# Create frontend .env
cat > frontend/.env << EOF
PORT=4001
REACT_APP_API_URL=http://localhost:4000
BROWSER=none
EOF
print_success "Frontend .env created (Port: 4001)"

# Step 7: Create Admin User
echo ""
print_info "Step 7: Creating admin user..."
cd "$SCRIPT_DIR/backend"
node createAdmin.js
print_success "Admin user setup completed"

# Step 8: Kill any existing processes on ports 4000 and 4001
echo ""
print_info "Step 8: Checking for processes on ports 4000 and 4001..."

# Check port 4000
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    print_warning "Port 4000 is in use. Killing process..."
    sudo kill -9 $(lsof -t -i:4000) 2>/dev/null || true
    print_success "Port 4000 cleared"
fi

# Check port 4001
if lsof -Pi :4001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    print_warning "Port 4001 is in use. Killing process..."
    sudo kill -9 $(lsof -t -i:4001) 2>/dev/null || true
    print_success "Port 4001 cleared"
fi

# Step 9: Start Backend
echo ""
print_info "Step 9: Starting backend server on port 4000..."
cd "$SCRIPT_DIR/backend"

# Create logs directory
mkdir -p logs

# Start backend in background
nohup node server.js > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > .backend.pid

# Wait a bit for backend to start
sleep 3

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    print_success "Backend started successfully (PID: $BACKEND_PID)"
else
    print_error "Backend failed to start. Check logs/backend.log for details"
    exit 1
fi

# Step 10: Start Frontend
echo ""
print_info "Step 10: Starting frontend on port 4001..."
cd "$SCRIPT_DIR/frontend"

# Create logs directory
mkdir -p logs

# Start frontend in background
nohup npm start > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > .frontend.pid

print_success "Frontend is starting (PID: $FRONTEND_PID)"
print_info "Frontend may take 30-60 seconds to fully start..."

# Step 11: Create stop script
echo ""
print_info "Step 11: Creating stop script..."
cat > "$SCRIPT_DIR/stop-manual.sh" << 'EOF'
#!/bin/bash

echo "Stopping Hospital Management System..."

# Stop backend
if [ -f "backend/.backend.pid" ]; then
    BACKEND_PID=$(cat backend/.backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo "✓ Backend stopped (PID: $BACKEND_PID)"
    fi
    rm backend/.backend.pid
fi

# Stop frontend
if [ -f "frontend/.frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend/.frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo "✓ Frontend stopped (PID: $FRONTEND_PID)"
    fi
    rm frontend/.frontend.pid
fi

# Also kill any remaining processes on ports 4000 and 4001
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    kill -9 $(lsof -t -i:4000) 2>/dev/null || true
    echo "✓ Cleared port 4000"
fi

if lsof -Pi :4001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    kill -9 $(lsof -t -i:4001) 2>/dev/null || true
    echo "✓ Cleared port 4001"
fi

echo "All services stopped"
EOF

chmod +x "$SCRIPT_DIR/stop-manual.sh"
print_success "Stop script created: ./stop-manual.sh"

# Final Summary
echo ""
echo "=================================================="
print_success "Deployment completed successfully!"
echo "=================================================="
echo ""
echo "📱 Application URLs:"
echo "   Frontend:  http://localhost:4001"
echo "   Backend:   http://localhost:4000"
echo "   MongoDB:   mongodb://localhost:27017/hospitaldb"
echo ""
echo "🔐 Default Admin Credentials:"
echo "   Email:     admin@example.com"
echo "   Password:  admin123"
echo ""
echo "📝 Process Information:"
echo "   Backend PID:  $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "📋 Useful Commands:"
echo "   Stop services:     ./stop-manual.sh"
echo "   Backend logs:      tail -f backend/logs/backend.log"
echo "   Frontend logs:     tail -f frontend/logs/frontend.log"
echo "   MongoDB status:    sudo systemctl status mongod"
echo ""
echo "⏳ Please wait 30-60 seconds for frontend to fully start"
echo "   Then open http://localhost:4001 in your browser"
echo ""
