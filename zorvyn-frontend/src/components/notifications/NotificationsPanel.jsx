export default function NotificationsPanel({ recentCount = 0 }) {
  const items = [
    `You have ${recentCount} recent transactions to review.`,
    "Stay updated by reviewing category and trend sections weekly.",
  ];

  return (
    <section className="zf-section">
      <h2 className="zf-section__title">Notifications</h2>
      <ul className="zf-notifications">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
