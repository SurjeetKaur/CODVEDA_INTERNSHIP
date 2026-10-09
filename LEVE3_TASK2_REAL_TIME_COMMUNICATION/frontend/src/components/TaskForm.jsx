
import { useState } from "react";

function TaskForm({ users, onCreateTask, loading }) {
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("emp1");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  const employees = users.filter(
    (user) => user.role === "Employee"
  );

  function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim() || !assignedTo || !dueDate) {
      return;
    }

    onCreateTask({
      title: title.trim(),
      assignedTo,
      priority,
      dueDate,
    });

    setTitle("");
    setPriority("Medium");
    setDueDate("");
  }

  return (
    <section className="task-form-section">
      <div className="section-heading">
        <div>
          <h2>Create New Task</h2>
          <p>Assign work to a team member.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="taskTitle">Task Title</label>
          <input
            id="taskTitle"
            type="text"
            placeholder="e.g. Prepare project report"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={150}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="taskEmployee">Assign Employee</label>
          <select
            id="taskEmployee"
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            required
          >
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="taskPriority">Priority</label>
          <select
            id="taskPriority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="taskDueDate">Due Date</label>
          <input
            id="taskDueDate"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || employees.length === 0}
        >
          Create Task
        </button>
      </form>
    </section>
  );
}

export default TaskForm;
