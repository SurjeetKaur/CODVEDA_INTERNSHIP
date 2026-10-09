const express = require("express");

const Task = require("../models/Task");

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// =========================
// CREATE TASK
// Admin only
// =========================

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const {
        title,
        description,
        assignedTo,
        status,
        priority,
        dueDate,
      } = req.body;

      if (!title || !assignedTo) {
        return res.status(400).json({
          message: "Title and assignedTo are required",
        });
      }

      const task = await Task.create({
        title,
        description,
        assignedTo,
        status,
        priority,
        dueDate,
        createdBy: req.user.userId,
      });

      res.status(201).json({
        message: "Task created successfully",
        task,
      });
    } catch (error) {
      console.error("Create task error:", error);

      res.status(500).json({
        message: "Server error while creating task",
      });
    }
  }
);

// =========================
// GET ALL TASKS
// Admin and Employee
// =========================

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["Admin", "Employee"]),
  async (req, res) => {
    try {
      let query = {};

      // Employee can see only their assigned tasks
      if (req.user.role === "Employee") {
        query.assignedTo = req.user.userId;
      }

      const tasks = await Task.find(query)
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

      res.json({
        tasks,
      });
    } catch (error) {
      console.error("Get tasks error:", error);

      res.status(500).json({
        message: "Server error while fetching tasks",
      });
    }
  }
);

// =========================
// UPDATE TASK
// Admin and Employee
// =========================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin", "Employee"]),
  async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({
          message: "Task not found",
        });
      }

      // =========================
      // EMPLOYEE
      // Can update only their own task status
      // =========================

      if (req.user.role === "Employee") {
        if (task.assignedTo.toString() !== req.user.userId) {
          return res.status(403).json({
            message: "You can only update your own tasks",
          });
        }

        if (!req.body.status) {
          return res.status(400).json({
            message: "Status is required",
          });
        }

        task.status = req.body.status;

        await task.save();

        return res.json({
          message: "Task status updated successfully",
          task,
        });
      }

      // =========================
      // ADMIN
      // Can update the complete task
      // =========================

      Object.assign(task, req.body);

      await task.save();

      res.json({
        message: "Task updated successfully",
        task,
      });
    } catch (error) {
      console.error("Update task error:", error);

      res.status(500).json({
        message: "Server error while updating task",
      });
    }
  }
);

// =========================
// DELETE TASK
// Admin only
// =========================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);

      if (!task) {
        return res.status(404).json({
          message: "Task not found",
        });
      }

      res.json({
        message: "Task deleted successfully",
      });
    } catch (error) {
      console.error("Delete task error:", error);

      res.status(500).json({
        message: "Server error while deleting task",
      });
    }
  }
);

module.exports = router;