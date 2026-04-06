export default function Loader({ message = "Loading..." }) {
  return (
    <div className="zf-loader" role="status" aria-live="polite">
      <div className="zf-loader__spinner" />
      <p className="zf-loader__text">{message}</p>
    </div>
  );
}
