# TaskFlow – Employee Task Management Dashboard

## LEVEL 2 – TASK 1: Frontend with a JavaScript Framework (React)

TaskFlow is a professional employee task management dashboard built using React and REST API integration.

This project was developed as part of an internship to demonstrate frontend development using a modern JavaScript framework, reusable components, state management, API integration, loading states, and CRUD operations.

## Features

- Employee task dashboard
- Responsive user interface
- React functional components
- Reusable UI components
- REST API integration using Fetch API
- Loading and error handling
- Create new tasks
- View existing tasks
- Update tasks
- Delete tasks
- Task priority management
- Task status management
- Dashboard summary cards
- Recent activity section

## Technologies Used

### Frontend
- React
- JavaScript
- HTML5
- CSS3
- Vite

### Backend
- Node.js
- Express.js
- REST API
- CORS

### Development Tools
- Visual Studio Code
- Postman
- Git
- GitHub

## Project Structure

```text
LEVEL2_TASK_REACT_TASKFLOW/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── SummaryCards.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   ├── TaskTable.jsx
│   │   │   └── RecentActivity.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    ├── server.js
    ├── package.json
    └── node_modules/
```

## Prerequisites

Make sure you have installed:

- [Node.js and npm](https://nodejs.org/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/) (optional)

You can verify Node.js and npm by running:

```bash
node -v
npm -v
```

## How to Run the Project

### Step 1: Open the Project

Open the `LEVEL2_TASK_REACT_TASKFLOW` project folder in Visual Studio Code.

### Step 2: Start the Backend

Open a terminal in VS Code and run:

```bash
cd backend
npm install
npm start
```

If your backend uses `nodemon` or a different development script, check the `scripts` section of `backend/package.json` and use the appropriate command.

When the backend starts successfully, you should see a message similar to:

```text
Server running on http://localhost:5000
```

Keep this terminal running.

### Step 3: Start the React Frontend

Open a **second terminal** in VS Code. From the project root, run:

```bash
cd frontend
npm install
npm run dev
```

Vite will display a local development URL, usually:

```text
http://localhost:5173/
```

Open that URL in your browser to access the TaskFlow dashboard.

### Step 4: Verify API Integration

Ensure that the frontend API URL in your React code matches the backend server and API route.

Example:

```javascript
const API_URL = "http://localhost:5000/api/tasks";
```

The backend must be running for the frontend to load and manage tasks through the API.

You can also use Postman to test the backend endpoints for creating, viewing, updating, and deleting tasks.

### Step 5: Stop the Servers

When you finish testing:

1. Click the backend terminal.
2. Press `Ctrl + C`.
3. Click the frontend terminal.
4. Press `Ctrl + C`.

## Running the Project Again

After the initial installation, you generally do not need to run `npm install` every time.

**Backend terminal:**

```bash
cd backend
npm start
```

**Frontend terminal:**

```bash
cd frontend
npm run dev
```

Run both commands in separate terminals.

## CRUD Operations

| Operation | Description |
|---|---|
| Create | Add a new task |
| Read | View existing tasks |
| Update | Edit task details or status |
| Delete | Remove a task |

## Author

**Developed by:** Surjeet Kaur

Developed as part of an internship project to demonstrate React frontend development and REST API integration.
