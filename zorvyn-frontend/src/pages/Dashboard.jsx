import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard-premium.css";

import ViewerDashboard from "../components/ViewerDashboard";
import AnalystDashboard from "../components/AnalystDashboard";
import AdminDashboard from "../components/AdminDashboard";

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case "VIEWER":
        return <ViewerDashboard />;
      case "ANALYST":
        return <AnalystDashboard />;
      case "ADMIN":
        return <AdminDashboard />;
      default:
        return null;
    }
  };

  return (
    <div style={styles.container} className="premium-app-shell">
      {/* Navbar */}
      <div style={styles.navbar} className="premium-navbar">
        <div style={styles.logo} className="premium-logo">Zorvyn Finance</div>

        <div style={styles.right}>
          <span style={styles.userInfo}>
            Hello, {user?.name} ({user?.role})
          </span>

          <button style={styles.logoutBtn} className="premium-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div style={styles.content}>{renderDashboard()}</div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(145deg, #0f172a 0%, #111b30 45%, #0b1220 100%)",
    color: "#e2e8f0",
    display: "flex",
    flexDirection: "column",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    borderBottom: "1px solid rgba(148, 163, 184, 0.22)",
    backgroundColor: "rgba(10, 17, 32, 0.78)",
    boxShadow: "0 8px 24px rgba(2, 8, 23, 0.35)",
    backdropFilter: "blur(8px)",
  },
  logo: {
    fontWeight: 700,
    fontSize: "20px",
    letterSpacing: "0.6px",
    color: "#f8fafc",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  userInfo: {
    fontSize: "14px",
    color: "#cbd5e1",
  },
  logoutBtn: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
    boxShadow: "0 8px 20px rgba(239, 68, 68, 0.25)",
  },
  content: {
    flex: 1,
    padding: "32px",
    maxWidth: "1400px",
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  },
};
