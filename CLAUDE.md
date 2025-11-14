# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hospital Management System built with the MERN stack (MongoDB, Express, React, Node.js). The system manages three user roles: Admin, Doctor, and Patient with role-based authentication using JWT.

## Architecture

### Backend Structure ([backend/](backend/))

**Entry Point**: [backend/server.js](backend/server.js) - Express server listening on port 5000 (default)

**Models** ([backend/models/](backend/models/)) - Mongoose schemas:
- `User` - Base user model for patients with role field
- `Doctor` - Separate collection with specialty, licenseNumber, phoneNumber
- `Admin` - Admin user collection
- `Appointment` - References User (patientId) and Doctor (doctorId), tracks status (scheduled/completed/cancelled)
- `Prescription` - Medical prescription records

**Routes** ([backend/routes/](backend/routes/)) - API endpoints:
- `/api/signup` - Patient self-registration
- `/api/login` - Authentication for all roles (returns JWT)
- `/api/admin` - Admin operations (add doctors, view appointments, manage users)
- `/api/doctor` - Doctor operations (view appointments, manage prescriptions)
- `/api/patient` - Patient operations (book appointments, view history)

**Authentication Pattern**:
- JWT-based with hardcoded secret `"your_jwt_secret"` in route files
- Each route file defines its own inline `auth` middleware that checks `Authorization: Bearer <token>` header
- Middleware decodes JWT and attaches user info to `req.user`
- Role-based authorization checks (e.g., `if (req.user.role !== 'admin')`) within route handlers

### Frontend Structure ([frontend/src/](frontend/src/))

**Framework**: Create React App with React Router v6

**Styling**: Tailwind CSS with tailwindcss-animate, Lucide React icons

**Main Routes** ([frontend/src/App.js](frontend/src/App.js)):
- `/` - Home page
- `/login` - Unified login for all roles
- `/signup` - Patient self-registration only
- `/admin` - Admin dashboard
- `/doctor` - Doctor dashboard
- `/patient` - Patient dashboard

**Components** ([frontend/src/components/](frontend/src/components/)): Single-file components for each page, no shared component library

**State Management**: Local component state with useState, no Redux/Context API. Auth token stored in localStorage.

### Key Architectural Patterns

**Dual Model System**: Separate MongoDB collections for User (patients), Doctor, and Admin despite overlapping fields (firstName, lastName, email, password, role). When creating doctors via `/api/admin/add-doctor`, entries are created in both User and Doctor collections.

**No Centralized Middleware**: Each route file ([admin.js](backend/routes/admin.js), [doctor.js](backend/routes/doctor.js), [patient.js](backend/routes/patient.js)) duplicates the `auth` middleware inline. They share the same JWT secret hardcoded as string.

**API Communication**: Frontend components use native `fetch()` API with hardcoded `http://localhost:5000` base URL. Token included in Authorization header for protected routes.

**Password Handling**: Models define pre-save hooks but don't actually hash passwords. Both [backend/createAdmin.js](backend/createAdmin.js) and user creation routes store plaintext passwords.

## Development Commands

### Initial Setup

**Backend setup**:
```bash
cd backend
npm install
```

**Frontend setup**:
```bash
cd frontend
npm install
```

**Configure MongoDB**:
- Edit [backend/server.js](backend/server.js) line 17: Replace `"<Mongodb_url>"` with your MongoDB connection string
- Edit [backend/createAdmin.js](backend/createAdmin.js) line 7: Update `MONGO_URI` if needed (defaults to `mongodb://localhost:27017/hospitaldb`)

**Create initial admin**:
```bash
cd backend
node createAdmin.js
```
Creates admin account with email `admin@example.com` and password `admin123`.

### Running the Application

**Start backend** (must run first):
```bash
cd backend
node server.js
```
Server runs on `http://localhost:5000`

**Start frontend**:
```bash
cd frontend
npm start
```
Development server runs on `http://localhost:3000`

### Frontend Commands

From [frontend/](frontend/) directory:
- `npm start` - Development mode with hot reload
- `npm test` - Run tests with Jest/React Testing Library
- `npm run build` - Production build to [frontend/build/](frontend/build/)
- `npm run eject` - Eject from Create React App (irreversible)

### Backend

No npm scripts defined for backend. Server must be manually restarted after code changes (nodemon not configured).

## Important Implementation Details

### Adding New API Endpoints

1. Create or modify route files in [backend/routes/](backend/routes/)
2. For protected routes, use this auth middleware pattern:
   ```javascript
   const auth = (req, res, next) => {
     const token = req.header("Authorization")?.replace("Bearer ", "");
     if (!token) return res.status(401).send({ error: "No token provided" });
     try {
       const decoded = jwt.verify(token, "your_jwt_secret");
       req.user = decoded;
       next();
     } catch (error) {
       res.status(401).send({ error: "Invalid token" });
     }
   };

   router.post("/endpoint", auth, async (req, res) => {
     // req.user contains decoded JWT payload
   });
   ```
3. Register route in [backend/server.js](backend/server.js): `app.use("/api/path", require("./routes/file"));`

### Database Connection Requirement

Application requires MongoDB connection to start. Both [backend/server.js](backend/server.js) and [backend/createAdmin.js](backend/createAdmin.js) need valid connection strings. No fallback or graceful degradation.

### User Role Creation Flow

- **Patients**: Self-register via `/signup` endpoint, creates User document with `role: "patient"`
- **Doctors**: Must be created by admin via `/api/admin/add-doctor`, creates both User and Doctor documents
- **Admins**: Must be created by running [backend/createAdmin.js](backend/createAdmin.js) script, creates both User and Admin documents

### Environment Variables

Despite dotenv being installed and imported in [backend/server.js](backend/server.js), no `.env` file is used. All configuration (MongoDB URLs, JWT secret, PORT) is hardcoded in source files.

### CORS Configuration

Backend uses `cors()` middleware with no restrictions - allows all origins. Configured in [backend/server.js](backend/server.js) line 12.
