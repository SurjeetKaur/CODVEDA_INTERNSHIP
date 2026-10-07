function Header() {
  return (
    <header className="header">
      <div className="logo">Taskflow</div>

      <nav className="nav">
        <a href="#dashboard">Dashboard</a>
        <a href="#tasks">Tasks</a>
        <span className="admin-badge">Admin</span>
      </nav>
    </header>
  );
}

export default Header;