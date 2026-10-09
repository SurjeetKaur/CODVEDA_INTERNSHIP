import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import TaskForm from "../components/TaskForm";

function Dashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingTask, setUpdatingTask] = useState("");

  // Status editing
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  // Success message
  const [successMessage, setSuccessMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const isAdmin = user?.role === "Admin";
  const isEmployee = user?.role === "Employee";

  // =====================================================
  // GET TASKS
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const fetchTasks = async () => {
      try {
        const response = await API.get("/tasks");

        console.log("Tasks from backend:", response.data);

        if (!cancelled) {
          setTasks(response.data.tasks || []);
          setError("");
          setLoading(false);
        }
      } catch (error) {
        console.error("FETCH TASKS ERROR:", error);

        if (!cancelled) {
          setError(
            error.response?.data?.message ||
              "Failed to load tasks"
          );

          setLoading(false);
        }
      }
    };

    fetchTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  // =====================================================
  // REFRESH TASKS
  // =====================================================

  const refreshTasks = async () => {
    try {
      setError("");

      const response = await API.get("/tasks");

      console.log("Refreshed tasks:", response.data);

      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error("REFRESH TASKS ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Failed to refresh tasks"
      );
    }
  };

  // =====================================================
  // UPDATE TASK STATUS
  // =====================================================

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setUpdatingTask(taskId);
      setError("");
      setSuccessMessage("");

      const response = await API.put(
        `/tasks/${taskId}`,
        {
          status: newStatus,
        }
      );

      console.log("Updated task:", response.data);

      // Update only the selected task
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task._id === taskId
            ? {
                ...task,
                status: newStatus,
              }
            : task
        )
      );

      // Close status editor
      setEditingTaskId(null);
      setSelectedStatus("");

      // Show success message
      setSuccessMessage(
        "Task status updated successfully!"
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "UPDATE TASK STATUS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update task status"
      );
    } finally {
      setUpdatingTask("");
    }
  };

  // =====================================================
  // START STATUS EDIT
  // =====================================================

  const startStatusEdit = (task) => {
    setEditingTaskId(task._id);
    setSelectedStatus(task.status || "Pending");
    setError("");
    setSuccessMessage("");
  };

  // =====================================================
  // CANCEL STATUS EDIT
  // =====================================================

  const cancelStatusEdit = () => {
    setEditingTaskId(null);
    setSelectedStatus("");
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "status-completed";

      case "In Progress":
        return "status-progress";

      case "Pending":
        return "status-pending";

      default:
        return "status-default";
    }
  };

  // =====================================================
  // PRIORITY CLASS
  // =====================================================

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "High":
        return "priority-high";

      case "Medium":
        return "priority-medium";

      case "Low":
        return "priority-low";

      default:
        return "priority-default";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="dashboard-header">

        <div className="header-left">

          <div className="brand-icon">
            T
          </div>

          <div>
            <h1>TaskFlow</h1>
            <p>Task Management System</p>
          </div>

        </div>

        <div className="header-right">

          <div className="user-info">

            <div className="user-avatar">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : "U"}
            </div>

            <div>
              <strong>
                {user?.name || "User"}
              </strong>

              <span>
                {user?.role || "Employee"}
              </span>
            </div>

          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="dashboard-content">

        {/* =================================================
            WELCOME
        ================================================= */}

        <section className="welcome-section">

          <div>

            <p className="welcome-label">
              Welcome back
            </p>

            <h2>
              Hello, {user?.name || "User"} 👋
            </h2>

            <p>
              {isAdmin
                ? "Manage your team's tasks and track overall progress."
                : "View your assigned tasks and keep your work updated."}
            </p>

          </div>

          <div className="role-badge">
            {user?.role}
          </div>

        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">
              ✓
            </div>

            <div>
              <span>Total Tasks</span>
              <strong>{totalTasks}</strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              ◷
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingTasks}</strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              ↻
            </div>

            <div>
              <span>In Progress</span>
              <strong>{inProgressTasks}</strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              ✓
            </div>

            <div>
              <span>Completed</span>
              <strong>{completedTasks}</strong>
            </div>

          </div>

        </section>

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div className="alert alert-error">
            <strong>!</strong>
            <span>{error}</span>
          </div>
        )}

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {successMessage && (
          <div className="alert alert-success">
            <strong>✓</strong>
            <span>{successMessage}</span>
          </div>
        )}

        {/* =================================================
            TASK MANAGEMENT NAVIGATION
        ================================================= */}

        <section className="task-navigation-section">

          <div>
            <p className="section-label">
              Task Management
            </p>

            <h2>
              {isAdmin
                ? "Manage Your Tasks"
                : "View Your Tasks"}
            </h2>

            <p>
              {isAdmin
                ? "View, edit and delete tasks from the task management page."
                : "View all tasks assigned to you and update their status."}
            </p>
          </div>

          <button
            type="button"
            className="tasks-page-button"
            onClick={() => navigate("/tasks")}
          >
            {isAdmin
              ? "Manage Tasks"
              : "My Tasks"}
          </button>

        </section>

        {/* =================================================
            ADMIN CREATE TASK
        ================================================= */}

        {isAdmin && (
          <section className="admin-action-section">

            <div>
              <h2>Create New Task</h2>

              <p>
                Assign a new task to a team member.
              </p>
            </div>

            <TaskForm
              onTaskCreated={refreshTasks}
            />

          </section>
        )}

        {/* =================================================
            TASK SECTION
        ================================================= */}

        <section className="tasks-section">

          <div className="section-header">

            <div>

              <p className="section-label">
                {isAdmin
                  ? "Team Workspace"
                  : "Your Workspace"}
              </p>

              <h2>
                {isAdmin
                  ? "All Tasks"
                  : "Assigned Tasks"}
              </h2>

            </div>

            <span className="task-count">
              {tasks.length}{" "}
              {tasks.length === 1
                ? "Task"
                : "Tasks"}
            </span>

          </div>

          {/* =================================================
              NO TASKS
          ================================================= */}

          {tasks.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                ✓
              </div>

              <h3>
                No tasks found
              </h3>

              <p>
                {isAdmin
                  ? "Create your first task to get started."
                  : "You currently have no tasks assigned to you."}
              </p>

            </div>

          ) : (

            <div className="task-grid">

              {tasks.map((task) => (

                <article
                  className="task-card"
                  key={task._id}
                >

                  {/* =================================================
                      TASK HEADER
                  ================================================= */}

                  <div className="task-card-header">

                    <div className="task-title-area">

                      <h3>
                        {task.title}
                      </h3>

                      {task.description && (
                        <p>
                          {task.description}
                        </p>
                      )}

                    </div>

                    <span
                      className={`priority-badge ${getPriorityClass(
                        task.priority
                      )}`}
                    >
                      {task.priority || "Normal"}
                    </span>

                  </div>

                  {/* =================================================
                      TASK DETAILS
                  ================================================= */}

                  <div className="task-details">

                    {/* STATUS */}

                    <div className="task-detail-row">

                      <span className="detail-label">
                        Status
                      </span>

                      <span
                        className={`status-badge ${getStatusClass(
                          task.status
                        )}`}
                      >
                        {task.status || "Pending"}
                      </span>

                    </div>

                    {/* ASSIGNED TO */}

                    <div className="task-detail-row">

                      <span className="detail-label">
                        Assigned To
                      </span>

                      <span className="detail-value">
                        {task.assignedTo?.name ||
                          task.assignedTo ||
                          "Unassigned"}
                      </span>

                    </div>

                    {/* DUE DATE */}

                    {task.dueDate && (
                      <div className="task-detail-row">

                        <span className="detail-label">
                          Due Date
                        </span>

                        <span className="detail-value">
                          {new Date(
                            task.dueDate
                          ).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>

                      </div>
                    )}

                  </div>

                  {/* =================================================
                      EMPLOYEE STATUS UPDATE
                  ================================================= */}

                  {isEmployee && (

                    <div className="status-update-area">

                      {/* NORMAL VIEW */}

                      {editingTaskId !== task._id && (

                        <button
                          type="button"
                          className="update-status-button"
                          onClick={() =>
                            startStatusEdit(task)
                          }
                        >
                          Update Status
                        </button>

                      )}

                      {/* EDIT STATUS VIEW */}

                      {editingTaskId === task._id && (

                        <div className="status-editor">

                          <label
                            htmlFor={`status-${task._id}`}
                          >
                            New Status
                          </label>

                          <select
                            id={`status-${task._id}`}
                            value={selectedStatus}
                            onChange={(e) =>
                              setSelectedStatus(
                                e.target.value
                              )
                            }
                            disabled={
                              updatingTask === task._id
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

                          <div className="status-editor-actions">

                            <button
                              type="button"
                              className="save-status-button"
                              onClick={() =>
                                handleStatusChange(
                                  task._id,
                                  selectedStatus
                                )
                              }
                              disabled={
                                updatingTask === task._id
                              }
                            >
                              {updatingTask === task._id
                                ? "Saving..."
                                : "Save Status"}
                            </button>

                            <button
                              type="button"
                              className="cancel-status-button"
                              onClick={
                                cancelStatusEdit
                              }
                              disabled={
                                updatingTask === task._id
                              }
                            >
                              Cancel
                            </button>

                          </div>

                        </div>

                      )}

                    </div>

                  )}

                </article>

              ))}

            </div>

          )}

        </section>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="dashboard-footer">

        <span>
          Designed for efficient team collaboration
        </span>

      </footer>

    </div>
  );
}

export default Dashboard;