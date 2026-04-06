import { FiLogOut } from "react-icons/fi";

export default function Header({ user, onLogout }) {
  return (
    <header className="zf-header">
      <div>
        <h1 className="zf-header__title">Dashboard</h1>
        <p className="zf-header__subtitle">Welcome back, {user?.name || "User"}</p>
      </div>
      <div className="zf-header__right">
        <p className="zf-header__user">
          <strong>{user?.role}</strong>
          <span>{user?.email}</span>
        </p>
        <button type="button" className="zf-btn zf-btn-danger" onClick={onLogout}>
          <FiLogOut aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
