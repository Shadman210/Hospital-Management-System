# Hospital Management System

[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-Framework-blue.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-Library-61DAFB.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Environment-339933.svg)](https://nodejs.org/)

## Overview

The Hospital Management System is a web application designed to streamline hospital operations, manage patient records, and enhance the overall efficiency of healthcare services. This application is built using React for the frontend and Node.js with Express for the backend, along with MongoDB for data storage.

## Features

- Patient self-registration system
- Admin account creation via node createAdmin.js
- Admin can create doctor accounts
- Doctor login and profile management
- Patient management with medical records and appointments
- Doctor schedules and availability
- Admin dashboard for hospital operations
- Responsive design for mobile and desktop

## Technologies Used

- **Frontend:**

  - React
  - React Router
  - Tailwind CSS
  - Lucide Icons
  - Axios for API calls

- **Backend:**
  - Node.js
  - Express
  - MongoDB
  - Mongoose
  - JWT for authentication
  - dotenv for environment variable management

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/MKPTechnicals/Hospital-Management-System-MERN.git
    ```

2.  Navigate to the frontend directory and install dependencies:

    ```bash
    cd frontend
    npm install
    ```

3.  Navigate to the backend directory and install dependencies:

    ```bash
    cd backend
    npm install
    ```

4.  Update a `/backend/server.js` & `/backend/createAdmin.js` file in the backend directory and add your MongoDB connection string:

    ```js
    // MongoDB connection
    mongoose.connect('<your_MongoDB_connection_string>', {
    ```

5.  To create first admin, run `node backend/createAdmin.js` file in backend directory:

    ```

    ```

```
    ✅ Admin user created successfully!
    📧 Email: admin@example.com
    🔑 Password: admin123
```

        Then, execute it once using:

        ```bash
        node createAdmin.js
        ```

### Running the Application

1. Start the backend server:

   ```bash
   cd backend
   node server.js
   ```

2. Start the frontend application:

   ```bash
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000` to view the application.

## Available Scripts

In the frontend directory, you can run:

- `npm start`: Runs the app in development mode.
- `npm test`: Launches the test runner.
- `npm run build`: Builds the app for production.
- `npm run eject`: Ejects the configuration files.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.
