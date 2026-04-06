import EmptyState from "../common/EmptyState";

export default function DashboardSummary({ summary }) {
  if (!summary) {
    return <EmptyState title="No summary yet" subtitle="Summary metrics will appear once records are available." />;
  }

  const cards = [
    { label: "Income", value: summary.totalIncome || 0, kind: "income" },
    { label: "Expense", value: summary.totalExpense || 0, kind: "expense" },
    { label: "Balance", value: summary.netBalance || 0, kind: "balance" },
  ];

  return (
    <section className="zf-section" aria-label="Summary cards">
      <h2 className="zf-section__title">Dashboard Summary</h2>
      <div className="zf-summary-grid">
        {cards.map((card) => (
          <article key={card.label} className="zf-summary-card">
            <p className="zf-summary-card__label">{card.label}</p>
            <p className={`zf-summary-card__value zf-summary-card__value--${card.kind}`}>
              {`INR ${Number(card.value).toLocaleString()}`}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
