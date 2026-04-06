import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "../styles/dashboard-modular.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (loading) return;

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const data = res.data;

      if (data.success) {
        login(data.user, data.token);
        toast.success("Login successful");
        navigate("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="zf-auth-shell">
      <div className="zf-auth-card">
        <h1 className="zf-auth-title">Zorvyn Finance</h1>
        <p className="zf-auth-subtitle">Sign in to your account</p>

        <form className="zf-auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="zf-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />

          <div className="zf-password-wrap">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="zf-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="zf-password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {error ? <p className="zf-auth-error">{error}</p> : null}

          <button
            type="submit"
            className="zf-btn zf-btn-primary"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="zf-auth-footer">
          Don't have an account?{" "}
          <button
            type="button"
            className="zf-auth-link"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </p>

        {/* Sample credentials info box at the bottom, matching login card theme */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "1rem",
            marginTop: 18,
            color: "#222",
            fontSize: 14,
            fontWeight: 400,
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ fontWeight: 500, marginBottom: 4 }}>Sample Users:</div>
          <ul
            style={{ margin: "0.5em 0 0 1.2em", padding: 0, listStyle: "disc" }}
          >
            <li>
              <span style={{ fontWeight: 500 }}>Admin:</span> admin@zorvyn.com /
              admin123
            </li>
            <li>
              <span style={{ fontWeight: 500 }}>Analyst:</span>{" "}
              analyst@zorvyn.com / analyst123
            </li>
            <li>
              <span style={{ fontWeight: 500 }}>Viewer:</span> viewer@zorvyn.com
              / viewer123
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
