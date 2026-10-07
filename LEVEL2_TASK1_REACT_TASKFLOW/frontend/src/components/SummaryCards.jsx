function SummaryCards({ tasks }) {
  const total = tasks.length;

  const todo = tasks.filter(
    (task) => task.status === "To Do" || task.status === "Pending"
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completed = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  return (
    <section className="summary-grid">
      <div className="summary-card">
        <span>Total Tasks</span>
        <strong>{total}</strong>
      </div>

      <div className="summary-card">
        <span>To Do</span>
        <strong>{todo}</strong>
      </div>

      <div className="summary-card">
        <span>In Progress</span>
        <strong>{inProgress}</strong>
      </div>

      <div className="summary-card">
        <span>Completed</span>
        <strong>{completed}</strong>
      </div>
    </section>
  );
}

export default SummaryCards;