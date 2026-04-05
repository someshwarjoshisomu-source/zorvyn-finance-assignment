import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "../styles/dashboard-premium.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const data = res.data;

      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="premium-auth-shell">
      <div style={styles.card} className="premium-auth-card">
        <h1 style={styles.title}>Zorvyn Finance</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            style={styles.input}
            className="premium-input premium-auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            style={styles.input}
            className="premium-input premium-auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} className="premium-btn premium-btn-primary premium-auth-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{" "}
          <span style={styles.link} className="premium-auth-link" onClick={() => navigate("/register")}>
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    height: "100vh",
    background: "linear-gradient(145deg, #0f172a 0%, #111b30 45%, #0b1220 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "16px",
  },
  card: {
    backgroundColor: "#f8fafc",
    padding: "40px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "360px",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(2, 8, 23, 0.28)",
    border: "1px solid rgba(148, 163, 184, 0.25)",
  },
  title: {
    color: "#0f172a",
    fontSize: "30px",
    fontWeight: 700,
    marginBottom: "8px",
    marginTop: "0",
    letterSpacing: "0.2px",
  },
  subtitle: {
    marginBottom: "32px",
    color: "#475569",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    marginBottom: "16px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  button: {
    width: "100%",
    padding: "12px 16px",
    marginTop: "16px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
  },
  error: {
    color: "#e74c3c",
    marginTop: "12px",
    fontSize: "13px",
    fontWeight: 500,
  },
  footer: {
    marginTop: "24px",
    fontSize: "14px",
    color: "#64748b",
  },
  link: {
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: 600,
    textDecoration: "none",
  },
};
