import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import "../styles/dashboard-modular.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLoading) return;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role: "VIEWER",
      });

      navigate("/", {
        state: { message: "Registration successful. Please login." },
      });
    } catch (err) {
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach((msg) => toast.error(msg.message || msg));
      } else {
        toast.error(err.response?.data?.message || "Registration failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="zf-auth-shell">
      <div className="zf-auth-card">
        <h1 className="zf-auth-title">Create Account</h1>
        <p className="zf-auth-subtitle">Set up your Zorvyn Finance access</p>

        <form className="zf-auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            className="zf-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />

          <input
            type="email"
            placeholder="Email"
            className="zf-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div className="zf-password-wrap">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="zf-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="zf-password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="zf-password-wrap">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="zf-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="zf-password-toggle"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button type="submit" className="zf-btn zf-btn-primary" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="zf-auth-footer">
          Already have an account? <Link to="/" className="zf-auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
