
function Notifications({ notifications, onClear }) {
  return (
    <section className="notifications-panel">
      <div className="section-heading">
        <div>
          <h2>Notifications</h2>
          <p>Recent task activity and updates.</p>
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            className="clear-notifications"
            onClick={onClear}
          >
            Clear all
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <p>You're all caught up!</p>
        </div>
      ) : (
        <ul className="notification-list">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className="notification-item"
            >
              <span className="notification-icon" aria-hidden="true">
                {notification.type === "task:created" ? "＋" : "↻"}
              </span>

              <div className="notification-content">
                <p>{notification.message}</p>

                {notification.createdAt && (
                  <time>
                    {new Date(
                      notification.createdAt
                    ).toLocaleString()}
                  </time>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Notifications;
