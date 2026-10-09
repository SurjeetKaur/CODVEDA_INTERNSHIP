
function Sidebar({ activePage, onPageChange, currentUser }) {
  const menuItems = [
    { label: "Dashboard", icon: "▦" },
    { label: "Tasks", icon: "✓" },
    { label: "Team Chat", icon: "☏" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-heading">
        <p>WORKSPACE</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`sidebar-link ${
              activePage === item.label ? "active" : ""
            }`}
            onClick={() => onPageChange(item.label)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar">
          {currentUser?.name?.charAt(0) || "U"}
        </div>

        <div className="sidebar-user-info">
          <strong>{currentUser?.name || "User"}</strong>
          <span>{currentUser?.role || "Employee"}</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
