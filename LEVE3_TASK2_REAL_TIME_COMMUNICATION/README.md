# Taskflow – Real-Time Team Communication

Taskflow is a real-time team communication dashboard developed as part of an internship project. It helps teams manage employee tasks, track progress, and communicate through real-time chat and notifications.

## Features

- **Task Dashboard:** View and manage team tasks from a central dashboard.
- **Task Management:** Create, edit, and delete tasks.
- **Employee Assignment:** Assign tasks to team members.
- **Task Tracking:** Manage task status, priority, and due dates.
- **Real-Time Chat:** Send and receive messages using Socket.IO.
- **Live Task Updates:** Receive task changes without manually refreshing the dashboard.
- **Notifications:** Display relevant task and activity notifications.
- **Role-Based Dashboard Actions:** Provide different task actions for administrators and employees.

## Technology Stack

**Frontend**
- React
- Vite
- JavaScript
- HTML
- CSS
- Socket.IO Client

**Backend**
- Node.js
- Express.js
- Socket.IO
- MongoDB
- Mongoose

## Project Structure


LEVEL1_TASK2_REALTIME_TASKFLOW/
├── backend/
│   ├── models/
│   │   ├── Task.js
│   │   └── Message.js
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── ...
│   └── package.json
└── README.md


## Prerequisites

- Node.js and npm
- MongoDB or a MongoDB Atlas database

## Installation and Setup

### 1. Open the project

Open the project folder in Visual Studio Code:


### 2. Start the backend

Open a terminal and run:


cd backend
npm install


Configure the required environment variables in `backend/.env` according to your existing backend code.

Start the backend using the script configured in `backend/package.json`. For example:


npm run dev


### 3. Start the frontend

Open a second terminal:


cd frontend
npm install
npm run dev


Open the local URL displayed by Vite, usually:

`http://localhost:5173`

Keep both frontend and backend terminals running while using the application.

## How to Use

1. Open the Taskflow dashboard.
2. View tasks and their current statuses.
3. Create tasks and assign them to employees.
4. Edit task details, priorities, and due dates.
5. Update task progress as work is completed.
6. Use the chat feature to communicate with team members in real time.
7. View relevant notifications and live task updates.

## Real-Time Communication

Taskflow uses Socket.IO to enable communication between the React frontend and Express backend.

Real-time functionality supports chat messages, task updates, and notifications. These features reduce the need for manual page refreshes and help team members stay informed about changes.

## Future Improvements

- Add online/offline indicators for team members.
- Add unread message counts.
- Improve chat history and message search.
- Add pagination for larger task lists.
- Expand automated testing for real-time events.

## Internship Task Objective

This project demonstrates WebSocket integration using Socket.IO, Express, and React, including bidirectional communication, user-specific messages and notifications, and efficient real-time data updates.

## Author

**Surjeet Kaur**

Developed as part of an internship project.
