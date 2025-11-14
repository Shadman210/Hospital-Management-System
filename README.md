# Hospital Management System

[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-Framework-blue.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-Library-61DAFB.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Environment-339933.svg)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-black.svg)](https://socket.io/)

## Overview

The Hospital Management System is a comprehensive web application designed to streamline hospital operations, manage patient records, and enhance the overall efficiency of healthcare services. This application is built using React for the frontend and Node.js with Express for the backend, along with MongoDB for data storage and Socket.io for real-time communication.

## Features

### User Management
- **Patient Self-Registration**: Patients can create their own accounts
- **Admin Account Creation**: Initial admin account via `node createAdmin.js`
- **Doctor Account Management**: Admins can create and manage doctor accounts
- **Role-Based Authentication**: JWT-based authentication for patients, doctors, and admins

### Patient Features
- View and update personal profile
- Book appointments with doctors
- View appointment history
- Access medical prescriptions
- **Real-time Chat with Doctors**: Instant messaging with assigned doctors
- View care team (doctors they've had appointments with)

### Doctor Features
- Manage personal profile and credentials
- View and manage patient appointments
- Access patient medical records
- Prescribe medications
- Update prescription history
- **Real-time Chat with Patients**: Instant messaging with patients
- Patient management dashboard

### Admin Features
- Create and manage doctor accounts
- View all appointments across the hospital
- Monitor system-wide statistics
- Manage hospital operations

### Real-time Communication
- **WebSocket-based Chat**: Instant message delivery using Socket.io
- **Room-based Messaging**: Secure, isolated conversations between patient-doctor pairs
- **Real-time Notifications**: Live updates when messages are received
- **Multi-device Support**: Works across multiple browsers/devices simultaneously

### UI/UX
- Responsive design for mobile and desktop
- Modern, clean interface with Tailwind CSS
- Intuitive navigation with React Router
- Interactive components with Lucide Icons

## Technologies Used

### Frontend
- **React 18.3.1**: UI library for building interactive user interfaces
- **React Router 6.26.2**: Client-side routing and navigation
- **Socket.io Client**: Real-time bidirectional communication
- **Tailwind CSS 3.4**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **React Scripts 5.0.1**: Create React App build tools

### Backend
- **Node.js**: JavaScript runtime environment
- **Express 4.19.2**: Web application framework
- **MongoDB**: NoSQL database for data persistence
- **Mongoose 8.6.2**: MongoDB object modeling
- **Socket.io**: WebSocket library for real-time communication
- **JSON Web Token (JWT) 9.0.2**: Secure authentication
- **bcrypt 5.1.1**: Password hashing
- **CORS 2.8.5**: Cross-origin resource sharing

## Getting Started

### Prerequisites

#### Option 1: Docker (Recommended)
- Docker Engine 20.10 or higher
- Docker Compose 2.0 or higher

#### Option 2: Manual Installation
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Installation

#### Quick Start with Docker (Recommended)

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/MKPTechnicals/Hospital-Management-System-MERN.git
    cd Hospital-Management-System
    ```

2.  **Deploy with one command**:

    ```bash
    ./deploy.sh
    ```

    This will:
    - Build all Docker images
    - Start MongoDB, Backend, and Frontend services
    - Automatically create the admin user
    - Display access URLs and credentials

3.  **Access the application**:
    - Frontend: http://localhost:3000
    - Backend: http://localhost:5000
    - Default admin: admin@example.com / admin123

For detailed Docker deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

#### Automated Manual Installation (All Dependencies Included)

For development or testing without Docker, use the automated manual deployment script:

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/MKPTechnicals/Hospital-Management-System-MERN.git
    cd Hospital-Management-System
    ```

2.  **Run the automated deployment script**:

    ```bash
    ./deploy-manual.sh
    ```

    This script will automatically:
    - Install Node.js 18.x (if not present)
    - Install MongoDB 7.0 (if not present)
    - Install all backend dependencies
    - Install all frontend dependencies
    - Create environment files
    - Create admin user
    - Start backend on port 4000
    - Start frontend on port 4001

3.  **Access the application**:
    - Frontend: http://localhost:4001
    - Backend: http://localhost:4000
    - Default admin: admin@example.com / admin123

4.  **Stop services**:
    ```bash
    ./stop-manual.sh
    ```

For detailed manual deployment instructions, see [MANUAL_DEPLOYMENT.md](MANUAL_DEPLOYMENT.md).

#### Step-by-Step Manual Installation

If you prefer to install each component manually:

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/MKPTechnicals/Hospital-Management-System-MERN.git
    cd Hospital-Management-System
    ```

2.  **Install Node.js 18.x**:

    ```bash
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

3.  **Install MongoDB 7.0**:

    ```bash
    # Import GPG key
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
        sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

    # Add repository
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
        sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

    # Install and start
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    sudo systemctl start mongod
    sudo systemctl enable mongod
    ```

4.  **Install backend dependencies**:

    ```bash
    cd backend
    npm install
    ```

5.  **Install frontend dependencies**:

    ```bash
    cd ../frontend
    npm install
    ```

4.  **Configure MongoDB connection**:

    Update the MongoDB connection string in `/backend/server.js` (line 27):

    ```javascript
    mongoose.connect("mongodb://localhost:27017/hospitaldb", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    ```

    Also update `/backend/createAdmin.js` (line 7) if using a different MongoDB URI.

5.  **Create initial admin account**:

    ```bash
    cd backend
    node createAdmin.js
    ```

    Expected output:
    ```
    ✅ Admin user created successfully!
    📧 Email: admin@example.com
    🔑 Password: admin123
    ```

### Running the Application

1. **Start the backend server** (includes WebSocket server):

   ```bash
   cd backend
   node server.js
   ```

   The server will start on `http://localhost:5000` with Socket.io enabled for real-time chat.

2. **Start the frontend application** (in a new terminal):

   ```bash
   cd frontend
   npm start
   ```

   The application will open at `http://localhost:3000` in your default browser.

3. **Access the application**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`
   - WebSocket: `ws://localhost:5000` (automatically connected)

## Application Structure

```
Hospital-Management-System/
├── backend/
│   ├── models/           # Mongoose schemas
│   │   ├── User.js       # Patient model
│   │   ├── Doctor.js     # Doctor model
│   │   ├── Admin.js      # Admin model
│   │   ├── Appointment.js # Appointment model
│   │   ├── Prescription.js # Prescription model
│   │   └── Chat.js       # Chat and messages model
│   ├── routes/           # API endpoints
│   │   ├── login.js      # Authentication
│   │   ├── signup.js     # Patient registration
│   │   ├── admin.js      # Admin operations
│   │   ├── doctor.js     # Doctor operations
│   │   ├── patient.js    # Patient operations
│   │   └── chat.js       # Chat API endpoints
│   ├── server.js         # Main server file with Socket.io
│   ├── createAdmin.js    # Admin creation script
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/   # React components
    │   │   ├── Home.js   # Landing page
    │   │   ├── Login.js  # Login page
    │   │   ├── SignUp.js # Registration page
    │   │   ├── Patient.js # Patient dashboard
    │   │   ├── Doctors.js # Doctor dashboard
    │   │   ├── Admins.js  # Admin dashboard
    │   │   └── Chat.js    # Real-time chat component
    │   ├── App.js        # Main app with routing
    │   └── index.js      # Entry point
    └── package.json
```

## User Roles & Access

### Admin
- **Login**: Use credentials created via `createAdmin.js`
- **Capabilities**: Create doctors, view all appointments, manage system

### Doctor
- **Login**: Use credentials created by admin
- **Capabilities**: Manage appointments, prescribe medications, chat with patients

### Patient
- **Registration**: Self-registration via signup page
- **Capabilities**: Book appointments, view prescriptions, chat with doctors

## Real-time Chat Usage

### For Patients:
1. Navigate to "Chat with Doctors" tab
2. Click "New Chat" button to see available doctors
3. Select a doctor and click "Start Chat"
4. Send messages instantly - doctor sees them in real-time

### For Doctors:
1. Navigate to "Chat with Patients" tab
2. View all active chats from patients
3. Click on a chat to open conversation
4. Send messages instantly - patient sees them in real-time

### Features:
- Messages appear instantly without page refresh
- Works across multiple devices/browsers simultaneously
- Chat history is preserved in database
- Secure room-based communication

## Available Scripts

### Frontend (`frontend/` directory)
- `npm start` - Run development server (port 3000)
- `npm test` - Run test suite
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

### Backend (`backend/` directory)
- `node server.js` - Start backend server with WebSocket
- `node createAdmin.js` - Create initial admin account

## API Endpoints

### Authentication
- `POST /api/login` - User login (all roles)
- `POST /api/signup` - Patient registration

### Admin Routes
- `POST /api/admin/add-doctor` - Create doctor account
- `GET /api/admin/doctors` - Get all doctors
- `GET /api/admin/appointments` - Get all appointments

### Doctor Routes
- `GET /api/doctor/profile` - Get doctor profile
- `PUT /api/doctor/profile` - Update doctor profile
- `GET /api/doctor/patients-with-appointments` - Get assigned patients
- `POST /api/doctor/prescribe` - Create prescription

### Patient Routes
- `GET /api/patient/profile` - Get patient profile
- `PUT /api/patient/profile` - Update patient profile
- `POST /api/patient/book-appointment` - Book appointment
- `GET /api/patient/appointments` - Get appointments
- `GET /api/patient/prescriptions` - Get prescriptions
- `GET /api/patient/care-team` - Get doctors list

### Chat Routes (with JWT auth)
- `POST /api/chat/get-or-create` - Create or get chat
- `POST /api/chat/send-message` - Send message
- `GET /api/chat/my-chats` - Get user's chats
- `GET /api/chat/messages/:chatId` - Get chat messages

### WebSocket Events
- `join-chat` - Join a chat room
- `leave-chat` - Leave a chat room
- `send-message` - Broadcast message to room
- `receive-message` - Receive message from room

## Testing Real-time Chat

To test real-time messaging between two users:

1. **Browser 1 (Normal mode)**: Login as Patient
   - Navigate to chat and start conversation with a doctor

2. **Browser 2 (Incognito mode)**: Login as Doctor
   - Navigate to chat and open the same conversation

3. **Send messages** from either browser and see them appear instantly in the other!

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is open source and available under the MIT License.
