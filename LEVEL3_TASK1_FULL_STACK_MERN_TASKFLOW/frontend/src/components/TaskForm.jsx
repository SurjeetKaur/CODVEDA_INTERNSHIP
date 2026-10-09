import { useEffect, useState } from "react";
import API from "../services/api";

function TaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [employees, setEmployees] = useState([]);
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Get employees
  useEffect(() => {
    const getEmployees = async () => {
      try {
        const response = await API.get("/auth/employees");

        console.log("Employees:", response.data);

        setEmployees(response.data.employees || []);
      } catch (error) {
        console.error("GET EMPLOYEES ERROR:", error);

        setMessage(
          error.response?.data?.message ||
            "Failed to load employees"
        );
      }
    };

    getEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!assignedTo) {
      setMessage("Please select an employee");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await API.post("/tasks", {
        title,
        description,
        assignedTo,
        priority,
        dueDate,
      });

      console.log("Created task:", response.data);

      setMessage("Task assigned successfully!");
      setTimeout(() => {
        setMessage("");
        }, 3000);

      setTitle("");
      setDescription("");
      setAssignedTo("");
      setPriority("Medium");
      setDueDate("");

      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (error) {
      console.error("CREATE TASK ERROR:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to create task"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form-container">

      {message && (
        <div
          className={
            message.includes("successfully")
              ? "task-form-success"
              : "task-form-error"
          }
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="task-form"
      >

        {/* Task Title */}
        <div className="task-form-field">
          <label htmlFor="task-title">
            Task Title
          </label>

          <input
            id="task-title"
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            required
          />
        </div>

        {/* Description */}
        <div className="task-form-field description-field">
          <label htmlFor="task-description">
            Description
          </label>

          <input
            id="task-description"
            type="text"
            placeholder="Short description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            required
          />
        </div>

        {/* Employee */}
        <div className="task-form-field employee-field">
          <label htmlFor="assignedTo">
            Select Employee
          </label>

          <select
            id="assignedTo"
            value={assignedTo}
            onChange={(e) =>
              setAssignedTo(e.target.value)
            }
            required
          >
            <option value="">
              Select Employee
            </option>

            {employees.map((employee) => (
              <option
                key={employee._id}
                value={employee._id}
              >
                {employee.name} ({employee.email})
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div className="task-form-field">
          <label htmlFor="priority">
            Priority
          </label>

          <select
            id="priority"
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Due Date */}
        <div className="task-form-field">
          <label htmlFor="dueDate">
            Due Date
          </label>

          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) =>
              setDueDate(e.target.value)
            }
          />
        </div>

        {/* Create Button */}
        <div className="task-form-action">
          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Task"}
          </button>
        </div>

      </form>
    </div>
  );
}

export default TaskForm;