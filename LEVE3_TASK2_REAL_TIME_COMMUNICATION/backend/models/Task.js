const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required."],
      trim: true,
      maxlength: [150, "Task title cannot exceed 150 characters."],
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters."],
    },
    assignedTo: {
      type: String,
      required: [true, "An employee must be assigned."],
    },
    assignedToName: {
      type: String,
      required: [true, "Assigned employee name is required."],
    },
    dueDate: {
      type: Date,
      required: [true, "Task due date is required."],
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    createdBy: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);
