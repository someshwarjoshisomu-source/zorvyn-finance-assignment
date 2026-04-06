export default function ProfileOverview({ user }) {
  return (
    <section className="zf-section">
      <h2 className="zf-section__title">Profile</h2>
      <div className="zf-profile-grid">
        <p><strong>Name:</strong> {user?.name || "-"}</p>
        <p><strong>Email:</strong> {user?.email || "-"}</p>
        <p><strong>Role:</strong> {user?.role || "-"}</p>
      </div>
    </section>
  );
}
