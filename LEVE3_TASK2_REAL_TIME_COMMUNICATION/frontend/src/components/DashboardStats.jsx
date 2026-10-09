
function DashboardStats({ tasks }) {
  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: "▦",
      className: "stat-total",
    },
    {
      label: "Pending",
      value: pendingTasks,
      icon: "◷",
      className: "stat-pending",
    },
    {
      label: "In Progress",
      value: inProgressTasks,
      icon: "↻",
      className: "stat-progress",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: "✓",
      className: "stat-completed",
    },
  ];

  return (
    <section className="stats-grid">
      {stats.map((stat) => (
        <article className={`stat-card ${stat.className}`} key={stat.label}>
          <div className="stat-info">
            <p>{stat.label}</p>
            <h2>{stat.value}</h2>
          </div>

          <span className="stat-icon">{stat.icon}</span>
        </article>
      ))}
    </section>
  );
}

export default DashboardStats;