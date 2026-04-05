import { useState, useEffect } from "react";
import api from "../api/axios";

export default function AdminDashboard() {
  // State
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trends, setTrends] = useState([]);
  const [recent, setRecent] = useState([]);
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  // Filters
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  // Add Record Form
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("INCOME");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch all dashboard data in parallel
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/dashboard/summary"),
      api.get("/dashboard/categories"),
      api.get("/dashboard/trends"),
      api.get("/dashboard/recent"),
      fetchRecords(page, filterType, filterCategory, filterSearch, true, recordsPerPage),
      api.get("/users"),
    ])
      .then(
        ([summaryRes, categoriesRes, trendsRes, recentRes, _, usersRes]) => {
          setSummary(summaryRes.data.data);
          setCategories(categoriesRes.data.data);
          setTrends(trendsRes.data.data);
          setRecent(recentRes.data.data);
          setUsers(usersRes.data.users);
          setError("");
        },
      )
      .catch((err) => {
        console.error("Fetch records error:", err?.response?.data || err.message || err);
        setError(err?.response?.data?.message || "Failed to load data");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  // Fetch records with filters and pagination
  async function fetchRecords(
    pageNum = 1,
    type = filterType,
    category = filterCategory,
    search = filterSearch,
    silent = false,
    perPage = recordsPerPage,
  ) {
    if (!silent) setLoading(true);
    try {
      const params = { page: pageNum, limit: perPage };
      if (type) params.type = type;
      if (category) params.category = category;
      if (search) params.search = search;
      const res = await api.get("/records", { params });
      console.log(res.data);

      const payload = res?.data?.data || res?.data;

      if (!payload) {
        setRecords([]);
        setTotalPages(1);
        setPage(1);
        setError("Failed to fetch records");
        return {
          records: [],
          totalPages: 1,
          currentPage: 1,
        };
      }

      const incomingRecords = Array.isArray(payload?.records) ? payload.records : [];
      const hasServerPagination = Boolean(payload?.totalPages || payload?.currentPage);

      const totalCount = Number(payload?.count) || incomingRecords.length;

      let parsedRecords = incomingRecords;
      let parsedTotalPages = Number(payload?.totalPages) || Math.max(1, Math.ceil(totalCount / perPage));
      let parsedCurrentPage = Number(payload?.currentPage) || pageNum;

      if (!hasServerPagination) {
        parsedTotalPages = Math.max(1, Math.ceil(totalCount / perPage));
        parsedCurrentPage = Math.min(Math.max(1, pageNum), parsedTotalPages);
        const startIndex = (parsedCurrentPage - 1) * perPage;
        parsedRecords = incomingRecords.slice(startIndex, startIndex + perPage);
      }

      setRecords(parsedRecords);
      setTotalPages(parsedTotalPages);
      setPage(parsedCurrentPage);
      setError("");
      return {
        records: parsedRecords,
        totalPages: parsedTotalPages,
        currentPage: parsedCurrentPage,
      };
    } catch (err) {
      console.error("Fetch records error:", err?.response?.data || err.message || err);
      setRecords([]);
      setTotalPages(1);
      setPage(1);
      setError(err?.response?.data?.message || "Failed to fetch records");
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // Add Record
  async function handleAddRecord(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/records", {
        amount,
        type,
        category,
        date,
        notes,
      });
      setShowAddForm(false);
      setAmount("");
      setType("INCOME");
      setCategory("");
      setDate("");
      setNotes("");
      await fetchRecords(1);
    } catch (err) {
      alert("Failed to add record");
    } finally {
      setLoading(false);
    }
  }

  // Delete Record
  async function handleDeleteRecord(id) {
    setLoading(true);
    try {
      await api.delete(`/records/${id}`);
      await fetchRecords(page);
    } catch {
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  }

  // Update User Status
  async function handleUpdateUserStatus(id, currentStatus) {
    setLoading(true);
    try {
      await api.patch(`/users/${id}/status`, {
        status: currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      });
      const usersRes = await api.get("/users");
      setUsers(usersRes.data.users);
    } catch {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  }

  // Update User Role
  async function handleUpdateUserRole(id, role) {
    setLoading(true);
    try {
      await api.patch(`/users/${id}/role`, { role });
      const usersRes = await api.get("/users");
      setUsers(usersRes.data.users);
    } catch {
      alert("Role update failed");
    } finally {
      setLoading(false);
    }
  }

  // Filter records
  function handleApplyFilters(e) {
    e.preventDefault();
    fetchRecords(1, filterType, filterCategory, filterSearch, false, recordsPerPage);
  }

  function handleRecordsPerPageChange(e) {
    const nextPerPage = Number(e.target.value) || 10;
    setRecordsPerPage(nextPerPage);
    fetchRecords(1, filterType, filterCategory, filterSearch, false, nextPerPage);
  }

  // Pagination
  function handlePrevPage() {
    if (page > 1) {
      fetchRecords(
        page - 1,
        filterType,
        filterCategory,
        filterSearch,
        false,
        recordsPerPage,
      );
    }
  }
  function handleNextPage() {
    if (page < totalPages) {
      fetchRecords(
        page + 1,
        filterType,
        filterCategory,
        filterSearch,
        false,
        recordsPerPage,
      );
    }
  }
  // For direct page setting (if needed in future):
  function setPageAndFetch(newPage) {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchRecords(
        newPage,
        filterType,
        filterCategory,
        filterSearch,
        false,
        recordsPerPage,
      );
    }
  }

  function getVisiblePageNumbers() {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (page <= 3) {
      return [1, 2, 3, "...", totalPages];
    }

    if (page >= totalPages - 2) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  }

  if (loading) return <p style={styles.loading}>Loading...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div
      style={{ minHeight: "100vh", padding: 24 }}
      className="premium-dashboard"
    >
      <h2 style={styles.title}>Dashboard — Admin</h2>

      {/* Summary Cards */}
      {summary && (
        <div style={styles.cards}>
          <div style={styles.card} className="premium-summary-card">
            <p>Income</p>
            <h3 style={{ color: "#2ecc71" }}>
              ₹ {summary.totalIncome?.toLocaleString()}
            </h3>
          </div>
          <div style={styles.card} className="premium-summary-card">
            <p>Expense</p>
            <h3 style={{ color: "#e74c3c" }}>
              ₹ {summary.totalExpense?.toLocaleString()}
            </h3>
          </div>
          <div style={styles.card} className="premium-summary-card">
            <p>Balance</p>
            <h3 style={{ color: "#3498db" }}>
              ₹ {summary.netBalance?.toLocaleString()}
            </h3>
          </div>
        </div>
      )}

      {/* Add Record Button */}
      <button
        style={styles.addBtn}
        className="premium-btn premium-btn-success"
        onClick={() => setShowAddForm((v) => !v)}
      >
        {showAddForm ? "Close" : "Add Record"}
      </button>

      {/* Add Record Form */}
      {showAddForm && (
        <form style={styles.form} onSubmit={handleAddRecord}>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={styles.input}
            className="premium-input"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={styles.input}
            className="premium-input"
          >
            <option value="INCOME">INCOME</option>
            <option value="EXPENSE">EXPENSE</option>
          </select>
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            style={styles.input}
            className="premium-input"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            style={styles.input}
            className="premium-input"
          />
          <input
            type="text"
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={styles.input}
            className="premium-input"
          />
          <button
            type="submit"
            style={styles.filterBtn}
            className="premium-btn premium-btn-primary"
          >
            Submit
          </button>
          <button
            type="button"
            style={styles.pageBtn}
            className="premium-btn"
            onClick={() => setShowAddForm(false)}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Records Section */}
      <div style={styles.section} className="premium-section">
        <h3>Records</h3>
        {/* Filters */}
        <form
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 18,
            alignItems: "center",
          }}
          onSubmit={handleApplyFilters}
        >
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={styles.input}
            className="premium-input"
          >
            <option value="">All Types</option>
            <option value="INCOME">INCOME</option>
            <option value="EXPENSE">EXPENSE</option>
          </select>
          <input
            type="text"
            placeholder="Category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={styles.input}
            className="premium-input"
          />
          <input
            type="text"
            placeholder="Search"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            style={styles.input}
            className="premium-input"
          />
          <button
            type="submit"
            style={styles.filterBtn}
            className="premium-btn premium-btn-primary"
          >
            Apply Filters
          </button>
        </form>
        {/* Table */}
        <table
          style={{ ...styles.table, minHeight: 48 }}
          className="premium-table admin-table-premium"
        >
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Notes</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(records) && records.map((r) => (
              <tr key={r._id} className="admin-table-row">
                <td style={{ height: 48 }}>
                  {new Date(r.date).toLocaleDateString()}
                </td>
                <td style={{ height: 48 }}>{r.type}</td>
                <td style={{ height: 48 }}>{r.category}</td>
                <td
                  style={{
                    color: r.type === "INCOME" ? "#2ecc71" : "#e74c3c",
                    height: 48,
                  }}
                >
                  ₹ {r.amount.toLocaleString()}
                </td>
                <td style={{ height: 48 }}>{r.notes || "-"}</td>
                <td style={{ height: 48 }}>
                  <button
                    style={styles.deleteBtn}
                    className="premium-btn premium-btn-danger"
                    onClick={() => handleDeleteRecord(r._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>
              Records / page
            </span>
            <select
              value={recordsPerPage}
              onChange={handleRecordsPerPageChange}
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                padding: "8px 10px",
                minWidth: 72,
                fontWeight: 600,
                color: "#0f172a",
                background: "#fff",
              }}
              className="premium-input"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className={`premium-btn premium-btn-primary`}
            style={{
              minWidth: 90,
              padding: "10px 20px",
              borderRadius: 8,
              fontWeight: 600,
              background: page === 1 ? "#cbd5e1" : "#0f172a",
              color: page === 1 ? "#64748b" : "#fff",
              cursor: page === 1 ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            aria-label="Go to previous page"
            title={
              page === 1
                ? "You are on the first page"
                : `Go to page ${page - 1}`
            }
          >
            ← Previous
          </button>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {getVisiblePageNumbers().map((value, idx) => {
              if (value === "...") {
                return (
                  <span key={`ellipsis-${idx}`} style={{ color: "#64748b", fontWeight: 700 }}>
                    ...
                  </span>
                );
              }

              const pageNumber = Number(value);
              const isActive = pageNumber === page;

              return (
                <button
                  key={pageNumber}
                  onClick={() => setPageAndFetch(pageNumber)}
                  className="premium-btn premium-btn-primary"
                  style={{
                    minWidth: 40,
                    padding: "8px 12px",
                    borderRadius: 8,
                    fontWeight: 700,
                    background: isActive ? "#0ea5e9" : "#e2e8f0",
                    color: isActive ? "#fff" : "#0f172a",
                    cursor: isActive ? "default" : "pointer",
                    border: "none",
                  }}
                  disabled={isActive}
                  aria-label={`Go to page ${pageNumber}`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
          <span
            style={{
              fontWeight: 600,
              fontSize: 16,
              color: "#0f172a",
              minWidth: 80,
              textAlign: "center",
            }}
            aria-live="polite"
            title={`You are on page ${page} of ${totalPages}`}
          >
            {page} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className={`premium-btn premium-btn-primary`}
            style={{
              minWidth: 90,
              padding: "10px 20px",
              borderRadius: 8,
              fontWeight: 600,
              background: page === totalPages ? "#cbd5e1" : "#0f172a",
              color: page === totalPages ? "#64748b" : "#fff",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            aria-label="Go to next page"
            title={
              page === totalPages
                ? "You are on the last page"
                : `Go to page ${page + 1}`
            }
          >
            Next →
          </button>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div style={styles.section} className="premium-section">
        <h3>Category Breakdown</h3>
        <table style={styles.table} className="premium-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Type</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c, i) => (
              <tr key={i}>
                <td>{c.category}</td>
                <td>{c.type}</td>
                <td>₹ {c.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Monthly Trends Table */}
      <div style={styles.section} className="premium-section">
        <h3>Monthly Trends</h3>
        <table style={styles.table} className="premium-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Month</th>
              <th>Income</th>
              <th>Expense</th>
            </tr>
          </thead>
          <tbody>
            {trends.map((t, i) => (
              <tr key={i}>
                <td>{t.year}</td>
                <td>{t.month}</td>
                <td style={{ color: "#2ecc71" }}>
                  ₹ {t.totalIncome.toLocaleString()}
                </td>
                <td style={{ color: "#e74c3c" }}>
                  ₹ {t.totalExpense.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Activity Table */}
      <div style={styles.section} className="premium-section">
        <h3>Recent Activity</h3>
        <table style={styles.table} className="premium-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r._id}>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>{r.type}</td>
                <td>{r.category}</td>
                <td
                  style={{ color: r.type === "INCOME" ? "#2ecc71" : "#e74c3c" }}
                >
                  ₹ {r.amount.toLocaleString()}
                </td>
                <td>
                  {r.userId?.name} ({r.userId?.email})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Users Table */}
      <div style={styles.section} className="premium-section">
        <h3>Users Management</h3>
        <table style={styles.table} className="premium-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) =>
                      handleUpdateUserRole(u._id, e.target.value)
                    }
                    style={styles.input}
                    className="premium-input"
                  >
                    <option value="VIEWER">VIEWER</option>
                    <option value="ANALYST">ANALYST</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td>{u.status}</td>
                <td>
                  <button
                    onClick={() => handleUpdateUserStatus(u._id, u.status)}
                    style={styles.statusBtn}
                    className="premium-btn"
                  >
                    {u.status === "ACTIVE" ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Styles
const styles = {
  title: { marginBottom: 24, color: "#f8fafc", fontSize: 28, fontWeight: 700 },
  loading: { color: "#fff", fontSize: 14 },
  error: { color: "#e74c3c", fontWeight: 600, fontSize: 14 },
  cards: { display: "flex", gap: 24, marginBottom: 32, flexWrap: "wrap" },
  card: {
    background: "#f8fafc",
    color: "#0f172a",
    padding: 24,
    borderRadius: 8,
    flex: "1 1 calc(33.333% - 16px)",
    minWidth: 200,
    textAlign: "center",
    boxShadow: "0 10px 24px rgba(2, 8, 23, 0.12)",
  },
  addBtn: {
    background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
    color: "#fff",
    padding: "12px 24px",
    border: "none",
    borderRadius: 6,
    marginBottom: 24,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    transition: "all 0.2s ease",
  },
  form: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 24,
    background: "#fff",
    padding: 24,
    borderRadius: 8,
    alignItems: "center",
    boxShadow: "0 10px 20px rgba(2, 8, 23, 0.1)",
  },
  section: {
    background: "#f8fafc",
    color: "#0f172a",
    padding: 24,
    borderRadius: 8,
    marginBottom: 24,
    boxShadow: "0 10px 24px rgba(2, 8, 23, 0.12)",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    fontSize: 14,
  },
  deleteBtn: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    cursor: "pointer",
    borderRadius: 6,
    fontWeight: 500,
    fontSize: 12,
    transition: "all 0.2s ease",
  },
  filterBtn: {
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    transition: "all 0.2s ease",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #e0e0e0",
    minWidth: 100,
    fontSize: 13,
    transition: "border-color 0.2s ease",
    color: "black",
  },
  pageBtn: {
    background: "#1e293b",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    transition: "all 0.2s ease",
    minWidth: 80,
  },
  statusBtn: {
    background: "#334155",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 12,
    transition: "all 0.2s ease",
  },
};
