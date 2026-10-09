
const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const User = require("./models/User");
const Task = require("./models/Task");
const Message = require("./models/Message");
const Notification = require("./models/Notification");

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json({ limit: "1mb" }));

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  },
});

function userRoom(userId) {
  return `user:${userId}`;
}

function formatTask(task) {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description || "",
    assignedTo: task.assignedTo,
    assignedToName: task.assignedToName,
    dueDate: task.dueDate
      ? task.dueDate.toISOString().slice(0, 10)
      : "",
    status: task.status,
    priority: task.priority,
    createdBy: task.createdBy,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

function formatMessage(message) {
  return {
    id: message._id.toString(),
    senderId: message.senderId,
    senderName: message.senderName,
    userId: message.senderId,
    userName: message.senderName,
    text: message.text,
    createdAt: message.createdAt,
  };
}

function formatUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function formatNotification(notification) {
  return {
    id: notification._id.toString(),
    userId: notification.userId,
    message: notification.message,
    type: notification.type,
    read: notification.read,
    createdAt: notification.createdAt,
  };
}

function parseDueDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return parsed;
}

// Save the notification in MongoDB and send it only to its recipient.
async function sendNotification(
  userId,
  message,
  type = "task:updated"
) {
  if (!userId || !message) return;

  try {
    const savedNotification = await Notification.create({
      userId: String(userId),
      message,
      type,
    });

    const notification = formatNotification(savedNotification);

    io.to(userRoom(String(userId))).emit(
      "notification:new",
      notification
    );

    console.log(
      `Notification saved for ${userId}: ${message}`
    );
  } catch (error) {
    console.error("Failed to save notification:", error);
  }
}

function isValidObjectId(id) {
  return mongoose.isValidObjectId(id);
}

async function findEmployee(employeeId) {
  if (typeof employeeId !== "string" || !employeeId.trim()) {
    return null;
  }

  return User.findOne({
    id: employeeId,
    role: "Employee",
  });
}

// HEALTH CHECK
app.get("/", (req, res) => {
  res.json({
    message: "Taskflow Real-Time API is running",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
  });
});

// GET ALL USERS
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: 1 });
    res.status(200).json(users.map(formatUser));
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

// CREATE USER
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, role = "Employee" } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        message: "Name and email are required.",
      });
    }

    if (!["Admin", "Employee"].includes(role)) {
      return res.status(400).json({
        message: "Role must be Admin or Employee.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists.",
      });
    }

    const user = await User.create({
      id: randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      role,
    });

    res.status(201).json(formatUser(user));
  } catch (error) {
    console.error("Error creating user:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A user with this email already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Failed to create user." });
  }
});

// GET ALL TASKS
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks.map(formatTask));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Unable to fetch tasks." });
  }
});

// GET ONE TASK
app.get("/api/tasks/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Task not found." });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.json(formatTask(task));
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Unable to fetch task." });
  }
});

// CREATE TASK
app.post("/api/tasks", async (req, res) => {
  try {
    const {
      title,
      description = "",
      assignedTo,
      priority = "Medium",
      dueDate,
    } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required.",
      });
    }

    if (title.trim().length > 150) {
      return res.status(400).json({
        message: "Task title cannot exceed 150 characters.",
      });
    }

    if (
      typeof description !== "string" ||
      description.length > 2000
    ) {
      return res.status(400).json({
        message:
          "Description must be text and cannot exceed 2000 characters.",
      });
    }

    const employee = await findEmployee(assignedTo);

    if (!employee) {
      return res.status(400).json({
        message: "Please select a valid employee.",
      });
    }

    if (!["Low", "Medium", "High"].includes(priority)) {
      return res.status(400).json({
        message: "Priority must be Low, Medium, or High.",
      });
    }

    const parsedDueDate = parseDueDate(dueDate);

    if (!parsedDueDate) {
      return res.status(400).json({
        message:
          "A valid due date is required in YYYY-MM-DD format.",
      });
    }

    const admin = await User.findOne({ role: "Admin" });

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      assignedTo: employee.id,
      assignedToName: employee.name,
      dueDate: parsedDueDate,
      status: "Pending",
      priority,
      createdBy: admin ? admin.id : "",
    });

    const formattedTask = formatTask(task);

    // Broadcast task data for real-time task-list synchronization.
    io.emit("task:created", formattedTask);

    // Only the assigned employee gets this notification.
    await sendNotification(
      employee.id,
      `You have been assigned a new task: "${task.title}".`,
      "task:created"
    );

    res.status(201).json(formattedTask);
  } catch (error) {
    console.error("Error creating task:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Unable to create task." });
  }
});

// PATCH TASK FIELDS
app.patch("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedBy } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task ID." });
    }

    const existingTask = await Task.findById(id);

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found." });
    }

    const allowedFields = [
      "title",
      "description",
      "assignedTo",
      "priority",
      "status",
      "dueDate",
    ];

    const fieldsToUpdate = Object.keys(req.body).filter((field) =>
      allowedFields.includes(field)
    );

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({
        message: "No valid fields provided to update.",
      });
    }

    const updates = {};

    for (const field of fieldsToUpdate) {
      updates[field] = req.body[field];
    }

    if (
      updates.status !== undefined &&
      !["Pending", "In Progress", "Completed"].includes(updates.status)
    ) {
      return res.status(400).json({ message: "Invalid status." });
    }

    if (
      updates.priority !== undefined &&
      !["Low", "Medium", "High"].includes(updates.priority)
    ) {
      return res.status(400).json({ message: "Invalid priority." });
    }

    if (updates.title !== undefined) {
      if (
        typeof updates.title !== "string" ||
        !updates.title.trim() ||
        updates.title.trim().length > 150
      ) {
        return res.status(400).json({
          message: "Invalid task title.",
        });
      }

      updates.title = updates.title.trim();
    }

    if (updates.description !== undefined) {
      if (
        typeof updates.description !== "string" ||
        updates.description.length > 2000
      ) {
        return res.status(400).json({
          message: "Invalid description.",
        });
      }

      updates.description = updates.description.trim();
    }

    if (updates.dueDate !== undefined) {
      const parsedDueDate = parseDueDate(updates.dueDate);

      if (!parsedDueDate) {
        return res.status(400).json({
          message:
            "A valid due date is required in YYYY-MM-DD format.",
        });
      }

      updates.dueDate = parsedDueDate;
    }

    if (updates.assignedTo !== undefined) {
      const employee = await findEmployee(updates.assignedTo);

      if (!employee) {
        return res.status(400).json({
          message: "Please select a valid employee.",
        });
      }

      updates.assignedTo = employee.id;
      updates.assignedToName = employee.name;
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    // Keep task data synchronized across connected clients.
    io.emit("task:updated", formatTask(task));

    const assignmentChanged =
      updates.assignedTo !== undefined &&
      updates.assignedTo !== existingTask.assignedTo;

    const actor =
      typeof updatedBy === "string"
        ? await User.findOne({ id: updatedBy })
        : null;

    if (assignmentChanged) {
      // Notify the employee who had the task before reassignment.
      await sendNotification(
        existingTask.assignedTo,
        `Task "${existingTask.title}" was reassigned.`,
        "task:updated"
      );

      // Notify the employee receiving the task.
      await sendNotification(
        task.assignedTo,
        `You have been assigned a task: "${task.title}".`,
        "task:updated"
      );
    } else if (updates.status !== undefined) {
      if (actor?.role === "Admin") {
        // Admin changes status: notify the assigned employee only.
        await sendNotification(
          task.assignedTo,
          `Admin updated your task "${task.title}" to ${task.status}.`,
          "task:updated"
        );
      } else if (actor?.role === "Employee") {
        // Employee changes status: notify Admin(s), not other employees.
        const admins = await User.find({ role: "Admin" });

        for (const admin of admins) {
          await sendNotification(
            admin.id,
            `${actor.name} updated "${task.title}" to ${task.status}.`,
            "task:updated"
          );
        }
      }
    } else if (actor?.role === "Admin") {
      // Admin edits other task details: notify its assigned employee.
      await sendNotification(
        task.assignedTo,
        `Admin updated your task "${task.title}".`,
        "task:updated"
      );
    }

    res.json(formatTask(task));
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({
      message: "Failed to update task.",
      error: error.message,
    });
  }
});

// PUT: REPLACE EDITABLE TASK FIELDS
app.put("/api/tasks/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Task not found." });
    }

    const existingTask = await Task.findById(req.params.id);

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found." });
    }

    const {
      title,
      description = "",
      assignedTo,
      priority,
      status,
      dueDate,
      updatedBy,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 150
    ) {
      return res.status(400).json({
        message: "A valid task title is required.",
      });
    }

    if (
      typeof description !== "string" ||
      description.length > 2000
    ) {
      return res.status(400).json({
        message:
          "Description must be text and cannot exceed 2000 characters.",
      });
    }

    const employee = await findEmployee(assignedTo);

    if (!employee) {
      return res.status(400).json({
        message: "Please select a valid employee.",
      });
    }

    if (!["Low", "Medium", "High"].includes(priority)) {
      return res.status(400).json({ message: "Invalid priority." });
    }

    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const parsedDueDate = parseDueDate(dueDate);

    if (!parsedDueDate) {
      return res.status(400).json({
        message:
          "A valid due date is required in YYYY-MM-DD format.",
      });
    }

    existingTask.title = title.trim();
    existingTask.description = description.trim();
    existingTask.assignedTo = employee.id;
    existingTask.assignedToName = employee.name;
    existingTask.priority = priority;
    existingTask.status = status;
    existingTask.dueDate = parsedDueDate;

    const task = await existingTask.save();

    io.emit("task:updated", formatTask(task));

    const actor =
      typeof updatedBy === "string"
        ? await User.findOne({ id: updatedBy })
        : null;

    await sendNotification(
      task.assignedTo,
      `Task "${task.title}" was updated.`,
      "task:updated"
    );

    res.json(formatTask(task));
  } catch (error) {
    console.error("Error replacing task:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Unable to replace task." });
  }
});

// DELETE TASK
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Task not found." });
    }

    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    io.emit("task:deleted", { id: task._id.toString() });

    await sendNotification(
      task.assignedTo,
      `Your task "${task.title}" was deleted.`,
      "task:deleted"
    );

    res.json({
      message: "Task deleted successfully.",
      id: task._id.toString(),
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Unable to delete task." });
  }
});

// GET SAVED NOTIFICATIONS FOR ONE USER
app.get("/api/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json(
      notifications.map((notification) => ({
        id: notification._id.toString(),
        userId: notification.userId,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        createdAt: notification.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      message: "Unable to fetch notifications.",
    });
  }
});

// GET CHAT MESSAGES
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(500);

    res.json(messages.reverse().map(formatMessage));
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Unable to fetch messages." });
  }
});

// SOCKET.IO: USERS, NOTIFICATIONS AND TEAM CHAT
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("user:join", async (userId) => {
    try {
      const user =
        typeof userId === "string"
          ? await User.findOne({ id: userId })
          : null;

      if (!user) {
        socket.emit("chat:error", { message: "User not found." });
        return;
      }

      socket.data.user = formatUser(user);
      socket.join(userRoom(user.id));

      console.log(`${user.name} joined their notification room.`);
    } catch (error) {
      console.error("Error joining user room:", error);
    }
  });

  socket.on("chat:join", () => {
    socket.join("team-chat");
  });

  socket.on("chat:send", async (payload) => {
    try {
      const user = socket.data.user;
      const messageText =
        typeof payload === "string" ? payload : payload?.text;

      if (
        !user ||
        typeof messageText !== "string" ||
        !messageText.trim()
      ) {
        socket.emit("chat:error", {
          message: "Join as a user and provide a valid message.",
        });
        return;
      }

      const message = await Message.create({
        senderId: user.id,
        senderName: user.name,
        text: messageText.trim().slice(0, 500),
        room: "team-chat",
      });

      io.to("team-chat").emit("chat:new", formatMessage(message));
    } catch (error) {
      console.error("Error saving chat message:", error);

      socket.emit("chat:error", {
        message: "Your message could not be saved. Please try again.",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// START SERVER
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from your .env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully.");

    server.listen(PORT, () => {
      console.log(`Taskflow API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Taskflow:", error.message);
    process.exit(1);
  }
}

startServer();



