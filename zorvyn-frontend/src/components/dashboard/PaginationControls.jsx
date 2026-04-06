function buildPages(page, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }
  if (page <= 3) return [1, 2, 3, "...", totalPages];
  if (page >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];
  return [1, "...", page - 1, page, page + 1, "...", totalPages];
}

export default function PaginationControls({
  page,
  totalPages,
  recordsPerPage,
  onPerPageChange,
  onPageChange,
  disabled = false,
}) {
  const visiblePages = buildPages(page, totalPages);

  return (
    <div className="zf-pagination" role="navigation" aria-label="Table pagination">
      <label className="zf-pagination__limit">
        <span>Records / page</span>
        <select
          className="zf-input"
          value={recordsPerPage}
          onChange={(e) => onPerPageChange(Number(e.target.value) || 10)}
          disabled={disabled}
          aria-label="Select records per page"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </label>

      <div className="zf-pagination__controls">
        <button
          type="button"
          className="zf-btn zf-btn-secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
          aria-label="Go to previous page"
        >
          Previous
        </button>

        <div className="zf-pagination__numbers">
          {visiblePages.map((value, idx) => {
            if (value === "...") {
              return (
                <span key={`gap-${idx}`} className="zf-pagination__gap" aria-hidden="true">
                  ...
                </span>
              );
            }

            const pageNumber = Number(value);
            const isActive = pageNumber === page;

            return (
              <button
                key={pageNumber}
                type="button"
                className={`zf-btn zf-btn-page ${isActive ? "is-active" : ""}`}
                onClick={() => onPageChange(pageNumber)}
                disabled={disabled || isActive}
                aria-current={isActive ? "page" : undefined}
                aria-label={`Go to page ${pageNumber}`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="zf-btn zf-btn-secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= totalPages}
          aria-label="Go to next page"
        >
          Next
        </button>
      </div>

      <p className="zf-pagination__meta" aria-live="polite">
        {page} / {totalPages}
      </p>
    </div>
  );
}
