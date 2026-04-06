import { Link, useLocation } from "react-router-dom";
import { FiBarChart2, FiHome, FiPieChart, FiUsers } from "react-icons/fi";

const roleMenus = {
  ADMIN: [
    { key: "dashboard", label: "Dashboard", to: "/dashboard", icon: FiHome },
    { key: "records", label: "Records", to: "/dashboard#records", icon: FiBarChart2 },
    { key: "analytics", label: "Analytics", to: "/dashboard#analytics", icon: FiPieChart },
    { key: "users", label: "Users", to: "/dashboard#users", icon: FiUsers },
  ],
  ANALYST: [
    { key: "dashboard", label: "Dashboard", to: "/dashboard", icon: FiHome },
    { key: "records", label: "Records", to: "/dashboard#records", icon: FiBarChart2 },
    { key: "analytics", label: "Analytics", to: "/dashboard#analytics", icon: FiPieChart },
  ],
  VIEWER: [
    { key: "dashboard", label: "Dashboard", to: "/dashboard", icon: FiHome },
    { key: "records", label: "Records", to: "/dashboard#records", icon: FiBarChart2 },
  ],
};

export default function Sidebar({ role = "VIEWER" }) {
  const location = useLocation();
  const menuItems = roleMenus[role] || roleMenus.VIEWER;

  return (
    <aside className="zf-sidebar" aria-label="Main navigation">
      <div className="zf-sidebar__brand">Zorvyn Finance</div>
      <nav className="zf-sidebar__nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isHashLink = item.to.includes("#");
          const isActive = isHashLink
            ? location.pathname === "/dashboard" && location.hash === item.to.slice(item.to.indexOf("#"))
            : location.pathname === item.to;

          return (
            <Link
              key={item.key}
              to={item.to}
              className={`zf-sidebar__item ${isActive ? "is-active" : ""}`}
              onClick={item.key === "dashboard"
                ? () => {
                    // If already on /dashboard, scroll to top
                    if (location.pathname === "/dashboard" && !item.to.includes("#")) {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }
                : undefined}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
