import { useEffect, useState } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import "./App.css";

function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState("");

  const isLoggedIn = !!localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // Fetch protected profile using JWT
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setProfile(null);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load profile"
          );
        }

        setProfile(data.user);
        setProfileError("");
      } catch (error) {
        setProfileError(error.message);
      }
    };

    fetchProfile();
  }, [isLoggedIn]);

  // Login
  const handleLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setProfile(data.user);
    setMessage(`Welcome, ${data.user.name}!`);
  };

  // Signup
  const handleSignup = (data) => {
    setMessage(data.message);
    setShowLogin(true);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setProfile(null);
    setProfileError("");
    setMessage("");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* Left Branding Panel */}
        <div className="brand-panel">
          <div className="brand-tag">
            Employee Management
          </div>

          <h1>TaskFlow</h1>

          <p>
            A simple and secure workspace for managing
            employees, tasks, and daily team activities.
          </p>
        </div>

        {/* Right Content Panel */}
        <div className="form-panel">

          {/* Success / General Message */}
          {message && (
            <div className="message">
              {message}
            </div>
          )}

          {/* Logged In Dashboard */}
          {isLoggedIn ? (
            <>
              <h2>Welcome back!</h2>

              <p className="form-subtitle">
                You are successfully logged in to TaskFlow.
              </p>

              <div className="dashboard-card">

                {/* Account */}
                <div>
                  <span className="dashboard-label">
                    Account
                  </span>

                  <strong>
                    {profile?.name || user?.name}
                  </strong>
                </div>

                {/* Email */}
                <div>
                  <span className="dashboard-label">
                    Email
                  </span>

                  <strong>
                    {profile?.email || user?.email}
                  </strong>
                </div>

                {/* Role */}
                <div>
                  <span className="dashboard-label">
                    Role
                  </span>

                  <strong>
                    {profile?.role || user?.role}
                  </strong>
                </div>

                {/* Authentication Status */}
                <div>
                  <span className="dashboard-label">
                    Access
                  </span>

                  <strong>
                    {profile
                      ? "Authenticated"
                      : "Checking..."}
                  </strong>
                </div>

              </div>

              {/* Profile API Error */}
              {profileError && (
                <p className="error-message">
                  {profileError}
                </p>
              )}

              <button
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : showLogin ? (
            <>
              {/* Login Form */}
              <Login onLogin={handleLogin} />

              <div className="switch-text">
                Don't have an account?{" "}

                <button
                  className="switch-button"
                  onClick={() => {
                    setMessage("");
                    setShowLogin(false);
                  }}
                >
                  Sign Up
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Signup Form */}
              <Signup onSignup={handleSignup} />

              <div className="switch-text">
                Already have an account?{" "}

                <button
                  className="switch-button"
                  onClick={() => {
                    setMessage("");
                    setShowLogin(true);
                  }}
                >
                  Login
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;