import { useState, useEffect } from "react";
import api from "../api/axios";

export default function ViewerDashboard() {
  // State
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  // Fetch summary and records on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/dashboard/summary"),
      fetchRecords(1, filterType, filterCategory, filterSearch, true),
    ])
      .then(([summaryRes, recordsData]) => {
        setSummary(summaryRes.data.data);
        if (recordsData) {
          setRecords(recordsData.records);
          setTotalPages(recordsData.totalPages);
          setPage(recordsData.currentPage);
        }
        setError("");
      })
      .catch((err) => {
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
    silent = false
  ) {
    if (!silent) setLoading(true);
    try {
      const params = {};
      if (type) params.type = type;
      if (category) params.category = category;
      if (search) params.search = search;
      params.page = pageNum;
      const res = await api.get("/records", { params });
      setRecords(res.data.records);
      setTotalPages(res.data.totalPages);
      setPage(res.data.currentPage);
      setError("");
      return {
        records: res.data.records,
        totalPages: res.data.totalPages,
        currentPage: res.data.currentPage,
      };
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch records");
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // Filter records
  function handleApplyFilters(e) {
    e.preventDefault();
    fetchRecords(1);
  }

  // Pagination
  function handlePrevPage() {
    if (page > 1) fetchRecords(page - 1);
  }
  function handleNextPage() {
    if (page < totalPages) fetchRecords(page + 1);
  }

  if (loading) return <p style={styles.loading}>Loading...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={{ minHeight: "100vh", padding: 24 }} className="premium-dashboard">
      <h2 style={styles.title}>Dashboard — Viewer</h2>

      {/* Summary Cards */}
      {summary && (
        <div style={styles.cards}>
          <div style={styles.card} className="premium-summary-card">
            <p>Income</p>
            <h3 style={{ color: "#2ecc71" }}>₹ {summary.totalIncome?.toLocaleString()}</h3>
          </div>
          <div style={styles.card} className="premium-summary-card">
            <p>Expense</p>
            <h3 style={{ color: "#e74c3c" }}>₹ {summary.totalExpense?.toLocaleString()}</h3>
          </div>
          <div style={styles.card} className="premium-summary-card">
            <p>Balance</p>
            <h3 style={{ color: "#3498db" }}>₹ {summary.netBalance?.toLocaleString()}</h3>
          </div>
        </div>
      )}

      {/* Records Section */}
      <div style={styles.section} className="premium-section">
        <h3>Records</h3>
        {/* Filters */}
        <form style={{ display: "flex", gap: 8, marginBottom: 12 }} onSubmit={handleApplyFilters}>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={styles.input} className="premium-input">
            <option value="">All Types</option>
            <option value="INCOME">INCOME</option>
            <option value="EXPENSE">EXPENSE</option>
          </select>
          <input
            type="text"
            placeholder="Category"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            style={styles.input}
            className="premium-input"
          />
          <input
            type="text"
            placeholder="Search"
            value={filterSearch}
            onChange={e => setFilterSearch(e.target.value)}
            style={styles.input}
            className="premium-input"
          />
          <button type="submit" style={styles.filterBtn} className="premium-btn premium-btn-primary">Apply Filters</button>
        </form>
        {/* Table */}
        <table style={styles.table} className="premium-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec._id}>
                <td>{new Date(rec.date).toLocaleDateString()}</td>
                <td>{rec.type}</td>
                <td>{rec.category}</td>
                <td style={{ color: rec.type === "INCOME" ? "#2ecc71" : "#e74c3c", fontWeight: "bold" }}>
                  ₹ {rec.amount.toLocaleString()}
                </td>
                <td>{rec.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
          <button onClick={handlePrevPage} disabled={page === 1} style={styles.pageBtn} className="premium-btn">Previous</button>
          <span style={{ color: "#334155", fontWeight: 500 }}>Page {page} of {totalPages}</span>
          <button onClick={handleNextPage} disabled={page === totalPages} style={styles.pageBtn} className="premium-btn">Next</button>
        </div>
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
  section: {
    background: "#f8fafc",
    color: "#0f172a",
    padding: 24,
    borderRadius: 8,
    marginBottom: 24,
    boxShadow: "0 10px 24px rgba(2, 8, 23, 0.12)",
    overflowX: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", fontSize: 14 },
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
};
