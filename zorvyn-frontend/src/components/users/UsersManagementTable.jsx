import { useState } from "react";
import EmptyState from "../common/EmptyState";

const initialCreateState = {
  name: "",
  email: "",
  password: "",
  role: "VIEWER",
  status: "ACTIVE",
};

export default function UsersManagementTable({
  users,
  onToggleStatus,
  onChangeRole,
  onCreateUser,
  onDeactivateUser,
  busy = false,
  canManage = true,
}) {
  const [createForm, setCreateForm] = useState(initialCreateState);

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    if (!onCreateUser) return;

    const created = await onCreateUser(createForm);
    if (created) {
      setCreateForm(initialCreateState);
    }
  };

  const updateCreateForm = (field, value) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section className="zf-section" id="users">
      <h2 className="zf-section__title">Users Management</h2>
      {!canManage ? <p className="zf-muted-text" style={{ marginBottom: 12 }}>Read-only role view</p> : null}
      {canManage ? (
        <form className="zf-record-form" onSubmit={handleCreateSubmit} style={{ marginBottom: 16 }}>
          <input
            className="zf-input"
            value={createForm.name}
            onChange={(e) => updateCreateForm("name", e.target.value)}
            placeholder="Name"
            required
            disabled={busy}
          />
          <input
            className="zf-input"
            type="email"
            value={createForm.email}
            onChange={(e) => updateCreateForm("email", e.target.value)}
            placeholder="Email"
            required
            disabled={busy}
          />
          <input
            className="zf-input"
            type="password"
            value={createForm.password}
            onChange={(e) => updateCreateForm("password", e.target.value)}
            placeholder="Password"
            required
            disabled={busy}
            autoComplete="new-password"
          />
          <select
            className="zf-input"
            value={createForm.role}
            onChange={(e) => updateCreateForm("role", e.target.value)}
            disabled={busy}
          >
            <option value="VIEWER">VIEWER</option>
            <option value="ANALYST">ANALYST</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <select
            className="zf-input"
            value={createForm.status}
            onChange={(e) => updateCreateForm("status", e.target.value)}
            disabled={busy}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
          <button className="zf-btn zf-btn-success" type="submit" disabled={busy}>
            Create User
          </button>
        </form>
      ) : null}
      {!users?.length ? (
        <EmptyState title="No users found" subtitle="User list will appear here once accounts are created." />
      ) : (
        <div className="zf-table-wrap">
          <table className="zf-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                {canManage ? <th>Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const userId = user.id || user._id;

                return (
                  <tr key={userId || user.email}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {canManage ? (
                        <select
                          className="zf-input"
                          value={user.role}
                          onChange={(e) => onChangeRole(userId, e.target.value)}
                          disabled={busy || !userId}
                        >
                          <option value="VIEWER">VIEWER</option>
                          <option value="ANALYST">ANALYST</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      ) : (
                        user.role
                      )}
                    </td>
                    <td>{user.status}</td>
                    {canManage ? (
                      <td>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            className="zf-btn zf-btn-secondary"
                            onClick={() => onToggleStatus(userId, user.status)}
                            disabled={busy || !userId}
                          >
                            {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            className="zf-btn zf-btn-danger"
                            onClick={() => onDeactivateUser && onDeactivateUser(userId)}
                            disabled={busy || !userId || user.status === "INACTIVE"}
                          >
                            Deactivate User
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
