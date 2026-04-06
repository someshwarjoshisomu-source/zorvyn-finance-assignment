export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="zf-error" role="alert">
      <p>{message || "Something went wrong."}</p>
      {onRetry && (
        <button type="button" className="zf-btn zf-btn-danger" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
