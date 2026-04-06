export default function EmptyState({ title = "No data", subtitle = "Nothing to show right now." }) {
  return (
    <div className="zf-empty-state" role="status" aria-live="polite">
      <h4>{title}</h4>
      <p>{subtitle}</p>
    </div>
  );
}
