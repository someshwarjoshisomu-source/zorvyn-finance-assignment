import EmptyState from "../common/EmptyState";

export default function RecordsTable({ records, showActions = false, onDelete, onEdit, busy = false }) {
  if (!records.length) {
    return <EmptyState title="No records found" subtitle="Try changing filters or adding a new record." />;
  }

  return (
    <div className="zf-table-wrap">
      <table className="zf-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Notes</th>
            {showActions ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record._id}>
              <td>{new Date(record.date).toLocaleDateString()}</td>
              <td>{record.type}</td>
              <td>{record.category}</td>
              <td>
                <span className={`zf-amount ${record.type === "INCOME" ? "is-income" : "is-expense"}`}>
                  {`INR ${Number(record.amount).toLocaleString()}`}
                </span>
              </td>
              <td>{record.notes || "-"}</td>
              {showActions ? (
                <td style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className="zf-btn zf-btn-secondary"
                    onClick={() => onEdit && onEdit(record)}
                    disabled={busy}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="zf-btn zf-btn-danger"
                    onClick={() => onDelete(record._id)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
