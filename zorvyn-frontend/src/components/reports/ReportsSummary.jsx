export default function ReportsSummary({ summary }) {
  return (
    <section className="zf-section">
      <h2 className="zf-section__title">Reports Snapshot</h2>
      <p className="zf-muted-text">
        Total income: {`INR ${Number(summary?.totalIncome || 0).toLocaleString()}`} | Total expense: {`INR ${Number(summary?.totalExpense || 0).toLocaleString()}`} | Balance: {`INR ${Number(summary?.netBalance || 0).toLocaleString()}`}
      </p>
    </section>
  );
}
