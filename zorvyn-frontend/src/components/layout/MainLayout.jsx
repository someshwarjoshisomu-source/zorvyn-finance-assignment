import Header from "./Header";
import Sidebar from "./Sidebar";

export default function MainLayout({ user, onLogout, children }) {
  return (
    <div className="zf-shell">
      <Sidebar role={user?.role} />
      <div className="zf-main">
        <Header user={user} onLogout={onLogout} />
        <main className="zf-content">{children}</main>
      </div>
    </div>
  );
}
