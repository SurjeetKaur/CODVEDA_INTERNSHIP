function TaskTable({ tasks, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        No tasks available.
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="task-table">
        <thead>
          <tr>
            <th>TASK</th>
            <th>ASSIGNED TO</th>
            <th>PRIORITY</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => {
            const priority = task.priority || "Medium";

            const status =
              task.status === "Pending"
                ? "To Do"
                : task.status;

            return (
              <tr key={task.id}>
                <td className="task-title">
                  {task.title}
                </td>

                <td>
                  {task.employee}
                </td>

                {/* PRIORITY */}
                <td>
                  <span
                    className={`priority-badge priority-${priority.toLowerCase()}`}
                  >
                    {priority}
                  </span>
                </td>

                {/* STATUS */}
                <td>
                  <span
                    className={`status-badge status-${status
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {status}
                  </span>
                </td>

                {/* ACTIONS */}
                <td>
                  <div className="table-actions">
                    <button
                      className="edit-btn"
                      onClick={() => onEdit(task)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => onDelete(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TaskTable;