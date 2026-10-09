import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Employee");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      const response = await API.post("/auth/signup", {
        name,
        email,
        password,
        role,
      });

      console.log("Signup response:", response.data);

      setMessage("Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Signup failed"
      );
    }
  };

  return (
    <div className="login-container">

      <form
        className="login-form"
        onSubmit={handleSignup}
      >

        <h1>TaskFlow</h1>

        <h2>Create Account</h2>

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Create password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="signup-select"
        >
          <option value="Employee">Employee</option>
          <option value="Admin">Admin</option>
        </select>

        <button type="submit">
          Create Account
        </button>

        {message && (
          <p>{message}</p>
        )}

      </form>

    </div>
  );
}

export default Signup;