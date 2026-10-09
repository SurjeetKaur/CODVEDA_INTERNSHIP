# TaskFlow - Full Stack Task Management Application
# LEVEL 3 - Task 1: Build a Full-Stack Application (MERN)


TaskFlow is a full-stack task management application built using the MERN stack.

The application provides secure user authentication, role-based access control, task creation and management, employee assignment, task status tracking, and a responsive React frontend connected to a Node.js/Express backend and MongoDB database.

# Project Objectives

The main objectives of this project are:

- Develop a fully integrated web application.
- Implement user authentication and role-based access.
- Deploy both frontend and backend.
- Ensure secure and reliable communication between the frontend and backend.
- Integrate the application with a MongoDB database.
- Implement task management functionality.
- Provide different access and functionality for Admin and Employee users.
- Implement CRUD operations for task management.
- Ensure protected routes and authorized access to application resources.
- Provide a user-friendly and responsive frontend interface.

## Features

### Authentication

- User Signup
- User Login
- JWT-based authentication
- Protected frontend routes
- Protected backend API routes
- Password-based authentication

### Role-Based Access Control

TaskFlow supports two user roles:

- **Admin**
- **Employee**

#### Admin

Admins can:

- Create tasks
- View all tasks
- Assign tasks to employees
- Edit tasks
- Delete tasks
- Update task status
- Update task priority
- Update due dates
- View task information and assigned employee details

#### Employee

Employees can:

- Login securely
- View tasks assigned to them
- View task details
- Update the status of their own assigned tasks
- Access their personal task management page

Employees cannot:

- Delete tasks
- Edit another employee's tasks
- Access Admin-only task management functionality



## Task Management

Each task contains:

- Task title
- Description
- Assigned employee
- Task status
- Priority
- Due date
- Created by
- Creation/update timestamps

### Task Status

Tasks can have one of the following statuses:

- `Pending`
- `In Progress`
- `Completed`

### Task Priority

Tasks support:

- `Low`
- `Medium`
- `High`


## Technology Stack

### Frontend

- React
- Vite
- React Router DOM
- Axios
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- JWT
- Middleware-based authorization

### Database

- MongoDB
- Mongoose


## Project Structure


TaskFlow/
│
├── backend/
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   │
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── TaskForm.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Tasks.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   └── App.css
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md

# DEVELOPED & SUBMITTED BY SURJEET KAUR