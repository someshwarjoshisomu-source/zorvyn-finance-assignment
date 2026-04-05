import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/dashboard-premium.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      // Navigate to login with success message
      navigate("/", {
        state: { message: "Registration successful. Please login." },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="premium-auth-shell">
      <div style={styles.card} className="premium-auth-card">
        <h1 style={styles.title}>Create Account</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            style={styles.input}
            className="premium-input premium-auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            autoComplete="new-password"
          />

          <select
            style={styles.input}
            className="premium-input premium-auth-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="VIEWER">VIEWER</option>
            <option value="ANALYST">ANALYST</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} className="premium-btn premium-btn-primary premium-auth-btn" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/" style={styles.link} className="premium-auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

// Styles (same theme as Login)
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
    marginBottom: "32px",
    marginTop: "0",
    letterSpacing: "0.2px",
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
    textDecoration: "none",
    fontWeight: 600,
  },
};
