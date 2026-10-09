import TaskCard from "./TaskCard";

function TaskList({
  tasks,
  currentUser,
  onStatusChange,
  onEdit,
  onDelete,
}) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <h3>No tasks found</h3>
        <p>Tasks will appear here when they are available.</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          currentUser={currentUser}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default TaskList;
