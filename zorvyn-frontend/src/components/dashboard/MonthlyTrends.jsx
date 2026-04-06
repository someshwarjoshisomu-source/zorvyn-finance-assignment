import EmptyState from "../common/EmptyState";

export default function MonthlyTrends({ trends }) {
  return (
    <section className="zf-section">
      <h2 className="zf-section__title">Monthly Trends</h2>
      {!trends?.length ? (
        <EmptyState title="No monthly trends" subtitle="Trend data will appear when enough monthly records exist." />
      ) : (
        <div className="zf-table-wrap">
          <table className="zf-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Month</th>
                <th>Income</th>
                <th>Expense</th>
              </tr>
            </thead>
            <tbody>
              {trends.map((trend, index) => (
                <tr key={`${trend.year}-${trend.month}-${index}`}>
                  <td>{trend.year}</td>
                  <td>{trend.month}</td>
                  <td><span className="zf-amount is-income">{`INR ${Number(trend.totalIncome).toLocaleString()}`}</span></td>
                  <td><span className="zf-amount is-expense">{`INR ${Number(trend.totalExpense).toLocaleString()}`}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
