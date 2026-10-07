function TaskForm({ task, setTask, onSubmit }) {
  const handleChange = (event) => {
    setTask({
      ...task,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <form className="task-form" onSubmit={onSubmit}>
      <input
        type="text"
        name="title"
        placeholder="Task title"
        value={task.title}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="employee"
        placeholder="Employee name"
        value={task.employee}
        onChange={handleChange}
        required
      />

      <select
        name="priority"
        value={task.priority}
        onChange={handleChange}
      >
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      <select
        name="status"
        value={task.status}
        onChange={handleChange}
      >
        <option value="To Do">To Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>

      <button type="submit">
        {task.id ? "Update Task" : "Add Task"}
      </button>
    </form>
  );
}

export default TaskForm;