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

## Designed & Developed By Surjeet Kaur
