# TaskFlow – Employee Task Dashboard

**CODVEDA Internship | Level 1 – Task 3: Frontend with HTML, CSS and JavaScript**

## Overview

TaskFlow is a simple, responsive Employee Task Dashboard developed as part of the CODVEDA Full-Stack Development Internship.

The project demonstrates how a frontend application can fetch task data from a REST API using JavaScript Fetch API and display it dynamically on a webpage and frontend designed with HTML, CSS AND Javascript.

## Features

- Responsive employee task dashboard.
- REST API integration.
- Fetch API for retrieving task data.
- Dynamic task table.
- Task summary statistics.
- Task status and priority badges.
- Recent activity section.
- Refresh data functionality.
- Loading state and API error handling.
- Responsive design for desktop and mobile devices.
- API testing using Postman.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Fetch API
- JSON Server
- REST API
- Postman
- Git and GitHub

## Project Structure


LEVEL1_TASK3_TASKFLOW/
│
├── index.html
├── style.css
├── script.js
├── db.json
├── package.json
├── package-lock.json
├── README.md
└── .gitignore


## Prerequisites

Make sure the following tools are installed:

- [Node.js and npm](https://nodejs.org/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/downloads/) (optional, for API testing)

## Installation and Setup

### 1. Open the Project

Open the repository in VS Code and navigate to the project folder:

```bash
cd LEVEL1_TASK3_TASKFLOW
```

### 2. Install Dependencies

Run the following command:

```bash
npm install
```

This installs the dependencies listed in `package.json`.

### 3. Start the REST API Server

Open a terminal in the project folder and run:

```bash
npx json-server --watch db.json --port 3000
```

If your installed JSON Server version does not support the `--watch` option, try:

```bash
npx json-server db.json --port 3000
```

Keep this terminal running while using the application.

### 4. Verify the API

Open the following URL in your browser:

http://localhost:3000/tasks

If the `db.json` file contains a `tasks` collection, the endpoint should return the task data in JSON format.

### 5. Run the Frontend

Open a **second terminal** in VS Code and make sure you are in the project folder.

Run:

```bash
npx live-server
```

If Live Server is not installed, install the Live Server extension in VS Code, right-click `index.html`, and select **Open with Live Server**.

The dashboard open in browser, at:

 http://127.0.0.1:5500/LEVEL1_TASK3_TASKFLOW/index.html#dashboard

## API Configuration

The frontend uses the REST API endpoint:

```text
http://localhost:3000/tasks
```

Ensure the API URL in `script.js` matches the endpoint provided by JSON Server.

## Testing with Postman

1. Open Postman.
2. Create a new HTTP request.
3. Set the request method to `GET`.
4. Enter `http://localhost:3000/tasks`.
5. Click **Send**.
6. Verify that the task records are returned successfully.

Additional CRUD requests can be tested if the corresponding API operations are supported by the project setup.

## Running the Application

The frontend and API server must run simultaneously:

| Component | Command | Purpose |
|---|---|---|
| Install dependencies | `npm install` | Install project packages |
| REST API | `npx json-server --watch db.json --port 3000` | Serve task data |
| Frontend | `npx live-server` | Open the dashboard |

To stop a running server, press `Ctrl + C` in its terminal.

## Learning Outcomes

- Built a responsive frontend using HTML and CSS.
- Used JavaScript Fetch API to retrieve data from a REST API.
- Displayed API data dynamically on a webpage.
- Practiced loading states and API error handling.
- Used JSON Server for local API development.
- Tested API endpoints using Postman.
- Practiced project organization and version control using Git and GitHub.

## Conclusion

TaskFlow demonstrates the integration of a responsive frontend with a REST API using HTML, CSS, and JavaScript. It provides practical experience with dynamic data rendering, API requests, and basic frontend development workflows.

## Author

**Surjeet Kaur**

GitHub: [SurjeetKaur](https://github.com/SurjeetKaur)
