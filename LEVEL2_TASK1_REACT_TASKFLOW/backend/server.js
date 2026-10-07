const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let tasks = [
  {
    id: 1,
    title: "Website redesign",
    employee: "Rahul",
    priority: "High",
    status: "Completed",
  },
  {
    id: 2,
    title: "API integration",
    employee: "Priya",
    priority: "High",
    status: "In Progress",
  },
  {
    id: 3,
    title: "Database testing",
    employee: "Aman",
    priority: "Medium",
    status: "To Do",
  },
  {
    id: 4,
    title: "UI improvements",
    employee: "Neha",
    priority: "Low",
    status: "Completed",
  },
];

// GET - Read all tasks
app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

// POST - Create task
app.post("/api/tasks", (req, res) => {
  const newTask = {
    id: Date.now(),
    title: req.body.title,
    employee: req.body.employee,
    priority: req.body.priority || "Medium",
    status: req.body.status || "To Do",
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
});

// PUT - Update task
app.put("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  const taskIndex = tasks.findIndex(
    (task) => task.id === id
  );

  if (taskIndex === -1) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  tasks[taskIndex] = {
    id,
    title: req.body.title,
    employee: req.body.employee,
    priority: req.body.priority || "Medium",
    status: req.body.status || "To Do",
  };

  res.json(tasks[taskIndex]);
});

// DELETE - Delete task
app.delete("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  const taskExists = tasks.some(
    (task) => task.id === id
  );

  if (!taskExists) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  tasks = tasks.filter(
    (task) => task.id !== id
  );

  res.json({
    message: "Task deleted successfully",
  });
});

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});