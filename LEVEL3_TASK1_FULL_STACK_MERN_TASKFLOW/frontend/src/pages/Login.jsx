import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      console.log("Login response:", response.data);

      // Save JWT token
      localStorage.setItem("token", response.data.token);

      // Save user information
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      setMessage("Login successful!");

      // Get user's role
      const role = response.data.user.role;

      // Redirect according to role
      if (role === "Admin" || role === "Employee") {
        navigate("/dashboard");
      } else {
        setMessage("Invalid user role");
      }

    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="login-container">

      <form
        className="login-form"
        onSubmit={handleLogin}
      >

        <h1>TaskFlow</h1>

        <h2>Login</h2>

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">
          Login
        </button>

        {message && (
          <p>{message}</p>
        )}
      {/* // signup link */}
        <div className="signup-link">
          <span>Don't have an account?</span>{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </button>
        </div>

      </form>
        

    </div>
  );
}

export default Login;