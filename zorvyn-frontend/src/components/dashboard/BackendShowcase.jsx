export default function BackendShowcase({ payload, title = "Live API Logs" }) {
  return (
    <section className="zf-section zf-showcase" aria-label="Live backend API logs">
      <h2 className="zf-section__title">{title}</h2>
      <pre className="zf-showcase__pre">{JSON.stringify(payload, null, 2)}</pre>
    </section>
  );
}
