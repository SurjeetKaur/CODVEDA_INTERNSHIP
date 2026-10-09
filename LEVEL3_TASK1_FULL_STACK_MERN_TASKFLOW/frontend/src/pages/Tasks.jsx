import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingTask, setDeletingTask] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "Admin";

  // =========================
  // LOAD TASKS
  // =========================

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const taskResponse = await API.get("/tasks");

        let employeeData = [];

        if (isAdmin) {
          const employeeResponse =
            await API.get("/auth/employees");

          employeeData =
            employeeResponse.data.employees || [];
        }

        if (!cancelled) {
          setTasks(taskResponse.data.tasks || []);
          setEmployees(employeeData);
          setError("");
          setLoading(false);
        }
      } catch (error) {
        console.error("LOAD TASKS ERROR:", error);

        if (!cancelled) {
          setError(
            error.response?.data?.message ||
              "Failed to load tasks"
          );

          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  // =========================
  // OPEN EDIT FORM
  // =========================

  const handleEditClick = (task) => {
    setEditingTask({
      _id: task._id,
      title: task.title || "",
      description: task.description || "",
      assignedTo: task.assignedTo?._id || "",
      status: task.status || "Pending",
      priority: task.priority || "Medium",
      dueDate: task.dueDate
        ? task.dueDate.split("T")[0]
        : "",
    });

    setError("");
  };

  // =========================
  // UPDATE TASK
  // =========================

  const handleUpdateTask = async (e) => {
    e.preventDefault();

    if (!editingTask) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await API.put(
        `/tasks/${editingTask._id}`,
        {
          title: editingTask.title,
          description: editingTask.description,
          assignedTo: editingTask.assignedTo,
          status: editingTask.status,
          priority: editingTask.priority,
          dueDate: editingTask.dueDate || null,
        }
      );

      console.log(
        "Updated task:",
        response.data
      );

      // Fetch tasks again so populated
      // assignedTo / createdBy data stays correct.
      const refreshedResponse =
        await API.get("/tasks");

      setTasks(
        refreshedResponse.data.tasks || []
      );

      setEditingTask(null);

    } catch (error) {
      console.error(
        "UPDATE TASK ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update task"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE TASK
  // =========================

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingTask(taskId);
      setError("");

      await API.delete(`/tasks/${taskId}`);

      console.log(
        "Task deleted:",
        taskId
      );

      // Remove task from UI
      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task._id !== taskId
        )
      );

    } catch (error) {
      console.error(
        "DELETE TASK ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete task"
      );
    } finally {
      setDeletingTask("");
    }
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const handleCancelEdit = () => {
    setEditingTask(null);
    setError("");
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="tasks-page">
        <h1>Tasks</h1>
        <p>Loading tasks...</p>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="tasks-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="tasks-header">

        <div>
          <h1>
            {isAdmin
              ? "Task Management"
              : "My Tasks"}
          </h1>

          <p>
            {isAdmin
              ? "Manage, update and delete tasks"
              : "View your assigned tasks"}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          Back to Dashboard
        </button>

      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* =========================
          TASK SUMMARY
      ========================= */}

      <div className="task-summary">

        <h2>
          {isAdmin
            ? "All Tasks"
            : "Assigned Tasks"}
        </h2>

        <span>
          {tasks.length}{" "}
          {tasks.length === 1
            ? "Task"
            : "Tasks"}
        </span>

      </div>

      {/* =========================
          NO TASKS
      ========================= */}

      {tasks.length === 0 && (
        <div className="no-tasks">

          <h3>No tasks found</h3>

          <p>
            {isAdmin
              ? "Create a task from the dashboard."
              : "You don't have any assigned tasks."}
          </p>

        </div>
      )}

      {/* =========================
          TASK LIST
      ========================= */}

      {tasks.length > 0 && (
        <div className="task-list">

          {tasks.map((task) => (

            <div
              className="task-card"
              key={task._id}
            >

              {/* TASK HEADER */}

              <div className="task-card-header">

                <div>

                  <h2>
                    {task.title}
                  </h2>

                  <p>
                    {task.description ||
                      "No description provided"}
                  </p>

                </div>

                <span
                  className={`priority ${
                    task.priority
                      ?.toLowerCase()
                      .replace(" ", "-")
                  }`}
                >
                  {task.priority}
                </span>

              </div>

              {/* TASK DETAILS */}

              <div className="task-details">

                <p>
                  <strong>Status:</strong>{" "}
                  {task.status}
                </p>

                <p>
                  <strong>
                    Assigned To:
                  </strong>{" "}
                  {task.assignedTo?.name ||
                    "Not assigned"}
                </p>

                {task.assignedTo?.email && (
                  <p>
                    <strong>
                      Employee Email:
                    </strong>{" "}
                    {task.assignedTo.email}
                  </p>
                )}

                <p>
                  <strong>
                    Due Date:
                  </strong>{" "}
                  {task.dueDate
                    ? new Date(
                        task.dueDate
                      ).toLocaleDateString()
                    : "No due date"}
                </p>

                {task.createdBy && (
                  <p>
                    <strong>
                      Created By:
                    </strong>{" "}
                    {task.createdBy.name ||
                      "Unknown"}
                  </p>
                )}

              </div>

              {/* =========================
                  ADMIN ACTIONS
              ========================= */}

              {isAdmin && (
                <div className="task-actions">

                  <button
                    type="button"
                    onClick={() =>
                      handleEditClick(task)
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteTask(
                        task._id
                      )
                    }
                    disabled={
                      deletingTask ===
                      task._id
                    }
                  >
                    {deletingTask === task._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>

                </div>
              )}

            </div>

          ))}

        </div>
      )}

      {/* =========================
          EDIT TASK
      ========================= */}

      {editingTask && (
        <div className="edit-task-section">

          <h2>Edit Task</h2>

          <form
            onSubmit={handleUpdateTask}
            className="edit-task-form"
          >

            {/* TITLE */}

            <label>
              Task Title

              <input
                type="text"
                value={editingTask.title}
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    title: e.target.value,
                  })
                }
                required
              />

            </label>

            {/* DESCRIPTION */}

            <label>
              Description

              <textarea
                value={
                  editingTask.description
                }
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    description:
                      e.target.value,
                  })
                }
                required
              />

            </label>

            {/* EMPLOYEE */}

            <label>
              Assign Employee

              <select
                value={
                  editingTask.assignedTo
                }
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    assignedTo:
                      e.target.value,
                  })
                }
                required
              >

                <option value="">
                  Select Employee
                </option>

                {employees.map(
                  (employee) => (
                    <option
                      key={employee._id}
                      value={employee._id}
                    >
                      {employee.name} (
                      {employee.email})
                    </option>
                  )
                )}

              </select>

            </label>

            {/* STATUS */}

            <label>
              Status

              <select
                value={editingTask.status}
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    status: e.target.value,
                  })
                }
              >

                <option value="Pending">
                  Pending
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Completed">
                  Completed
                </option>

              </select>

            </label>

            {/* PRIORITY */}

            <label>
              Priority

              <select
                value={
                  editingTask.priority
                }
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    priority:
                      e.target.value,
                  })
                }
              >

                <option value="Low">
                  Low
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="High">
                  High
                </option>

              </select>

            </label>

            {/* DUE DATE */}

            <label>
              Due Date

              <input
                type="date"
                value={
                  editingTask.dueDate
                }
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    dueDate:
                      e.target.value,
                  })
                }
              />

            </label>

            {/* BUTTONS */}

            <div className="edit-actions">

              <button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={
                  handleCancelEdit
                }
                disabled={saving}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}

    </div>
  );
}

export default Tasks;