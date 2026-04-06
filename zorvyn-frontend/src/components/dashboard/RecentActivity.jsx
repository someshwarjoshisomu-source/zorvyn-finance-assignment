import EmptyState from "../common/EmptyState";

export default function RecentActivity({ recent }) {
  return (
    <section className="zf-section">
      <h2 className="zf-section__title">Recent Activity</h2>
      {!recent?.length ? (
        <EmptyState title="No recent activity" subtitle="Recent transactions will show up here." />
      ) : (
        <div className="zf-table-wrap">
          <table className="zf-table">
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
              {recent.map((item) => (
                <tr key={item._id}>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>{item.type}</td>
                  <td>{item.category}</td>
                  <td>
                    <span className={`zf-amount ${item.type === "INCOME" ? "is-income" : "is-expense"}`}>
                      {`INR ${Number(item.amount).toLocaleString()}`}
                    </span>
                  </td>
                  <td>{item.userId ? `${item.userId.name} (${item.userId.email})` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
