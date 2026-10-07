import { useEffect, useState } from "react";
import Header from "./components/Header";
import SummaryCards from "./components/SummaryCards";
import TaskTable from "./components/TaskTable";
import TaskForm from "./components/TaskForm";
import RecentActivity from "./components/RecentActivity";
import "./App.css";

const API_URL = "http://localhost:5000/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);

  const [task, setTask] = useState({
    title: "",
    employee: "",
    priority: "Medium",
    status: "To Do",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to load tasks");
        }

        const data = await response.json();

        setTasks(data);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(
          "Unable to load tasks. Please check the backend."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load tasks");
      }

      const data = await response.json();

      setTasks(data);
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Unable to refresh tasks.");
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchTasks();
    setLoading(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const isEditing = Boolean(task.id);

      const response = await fetch(
        isEditing
          ? `${API_URL}/${task.id}`
          : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(task),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save task");
      }

      setTask({
        title: "",
        employee: "",
        priority: "Medium",
        status: "To Do",
      });

      await fetchTasks();
    } catch (error) {
      console.error("Save error:", error);
      setError("Unable to save task.");
    }
  };

  const handleEdit = (selectedTask) => {
    setTask({
      id: selectedTask.id,
      title: selectedTask.title,
      employee: selectedTask.employee,
      priority: selectedTask.priority || "Medium",
      status:
        selectedTask.status === "Pending"
          ? "To Do"
          : selectedTask.status,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      await fetchTasks();
    } catch (error) {
      console.error("Delete error:", error);
      setError("Unable to delete task.");
    }
  };

  return (
    <div className="app">
      <Header />

      <main className="main-container">
        <section className="welcome-section" id="dashboard">
          <div>
            <span className="workspace-label">
              TEAM WORKSPACE
            </span>

            <h1>
              Good morning 👋
            </h1>

            <p>
              Here's what's happening with your team's work.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={handleRefresh}
          >
            ↻ Refresh Data
          </button>
        </section>

        <SummaryCards tasks={tasks} />

        <section className="content-card" id="tasks">
          <div className="section-header">
            <div>
              <h2>Recent Tasks</h2>

              <p>
                {tasks.length} tasks loaded from the API
              </p>
            </div>

            <span className="api-badge">
              REST API
            </span>
          </div>

          <TaskForm
            task={task}
            setTask={setTask}
            onSubmit={handleSubmit}
          />

          {loading && (
            <div className="loading">
              Loading tasks...
            </div>
          )}

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {!loading && !error && (
            <TaskTable
              tasks={tasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </section>

        <RecentActivity tasks={tasks} />
      </main>
    </div>
  );
}

export default App;