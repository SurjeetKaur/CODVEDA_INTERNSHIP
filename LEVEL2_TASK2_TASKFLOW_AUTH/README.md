# TaskFlow Authentication
# LEVEL2 - TASK 2 AUTHENTICATION AND AUTHORIZATION

The project demonstrates user signup, login, JWT-based authentication, protected routes, and role-based authorization using React, Node.js, Express, and MongoDB.


## Objectives

The main objectives of this project are:

- Implement user authentication using **bcrypt** and **JWT (JSON Web Tokens)**.
- Hash user passwords using **bcrypt before storing them in MongoDB**.
- Generate and use JWT tokens after successful user login.
- Store the authentication token on the client side using **localStorage** for this internship demonstration.
- Protect backend routes using JWT authentication middleware.
- Restrict access to specific routes based on user roles.
- Implement **Admin** and **Employee** roles.
- Return appropriate authorization responses such as **401 Unauthorized** and **403 Forbidden**.
- Connect the React frontend with the backend authentication APIs.
- Store and manage authenticated user information using **MongoDB Atlas**.

## Authentication and Authorization

The application follows this authentication flow:

User Signup
     ↓
Password is hashed using bcrypt
     ↓
Hashed password is stored in MongoDB
     ↓
User Login
     ↓
Backend verifies email and password
     ↓
JWT token is generated
     ↓
Token is stored in localStorage
     ↓
JWT is sent with protected API requests
     ↓
Backend verifies JWT
     ↓
Role is checked
     ↓
Access is granted or denied

## Features

- User Signup
- User Login
- Password hashing using bcrypt
- JWT-based authentication
- Protected profile route
- Role-based authorization
- Admin and Employee roles
- Admin-only protected route
- Logout functionality
- MongoDB Atlas database
- React responsive frontend
- Loading and error handling
- API testing using Postman



### Frontend

- React
- Vite
- JavaScript
- CSS
- Fetch API

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- bcryptjs
- JSON Web Token (JWT)
- CORS
- dotenv

### Tools

- Visual Studio Code
- Postman
- MongoDB Atlas
- Git & GitHub

## Project Structure


LEVEL2_TASK2_AUTH_TASKFLOW/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── server.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
│
└── README.md

## How to Run the Project

Prerequisites

Make sure the following are installed:

Node.js and npm

MongoDB Atlas account

Visual Studio Code

1. Clone the Repository

Open the terminal and run:

git clone https://github.com/SurjeetKaur/CODVEDA_INTERNSHIP.git
cd CODVEDA_INTERNSHIP/LEVEL2_TASK2_AUTH_TASKFLOW

2. Configure and Start the Backend

Navigate to the backend folder:

cd backend
npm install

Create a .env file inside the backend folder and add the following configuration:

PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_secret_key

Replace the placeholder values with your actual MongoDB Atlas connection string and a strong, private JWT secret.

Start the backend server:

npm start

If your backend/package.json uses Nodemon with a dev script, you can instead run:

npm run dev

Keep the backend terminal running. The server should start at:

http://localhost:5000

3. Configure and Start the Frontend

Open a second terminal in Visual Studio Code.

If the terminal starts at the project root, run:

cd frontend
npm install
npm run dev

If you are still inside the backend folder, run:

cd ../frontend
npm install
npm run dev

Vite will display a local development URL, usually:

http://localhost:5173

Open the displayed URL in your browser to access the application.

4. Test the Application

Register a new user using the Signup page.

Log in using the registered credentials.

Test the protected profile route.

Test Admin-only access using an authorized Admin account.

Verify that Employee accounts cannot access Admin-only resources.

Test logout functionality.

Use Postman to test signup, login, and protected API routes.

Note: Keep both backend and frontend terminals running while using the application. Ensure MongoDB Atlas is configured correctly and that the frontend uses the correct backend API URL.

## Designed & Developed By Surjeet Kaur
