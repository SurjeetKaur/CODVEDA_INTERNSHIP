
function Header({ currentUser, onUserChange, users, connected }) {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <h2>Taskflow</h2>
        <span>Real-Time Team Workspace</span>
      </div>

      <div className="topbar-actions">
        <span className={`connection-status ${connected ? "online" : "offline"}`}>
          {connected ? "Connected" : "Disconnected"}
        </span>

        {/* <label htmlFor="currentUser">Demo user:</label> */}

        <select
          id="currentUser"
          value={currentUser?.id || ""}
          onChange={(event) => onUserChange(event.target.value)}
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}

export default Header;
