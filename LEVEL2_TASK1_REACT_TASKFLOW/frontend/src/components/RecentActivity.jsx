function RecentActivity({ tasks }) {
  const recentTasks = [...tasks].slice(-3).reverse();

  return (
    <section className="activity-card">
      <h2>Recent Activity</h2>

      {recentTasks.length === 0 ? (
        <p className="no-activity">
          No recent activity.
        </p>
      ) : (
        <ul>
          {recentTasks.map((task) => (
            <li key={task.id}>
              <span className="activity-dot"></span>

              <span>
                {task.employee}{" "}
                {task.status === "Completed"
                  ? "completed"
                  : task.status === "In Progress"
                  ? "updated"
                  : "created"}{" "}
                {task.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default RecentActivity;