export default function RecordsFilters({
  filterType,
  filterCategory,
  filterSearch,
  filterStartDate = "",
  filterEndDate = "",
  onTypeChange,
  onCategoryChange,
  onSearchChange,
  onStartDateChange,
  onEndDateChange,
  onSubmit,
  disabled = false,
}) {
  return (
    <form className="zf-filters" onSubmit={onSubmit}>
      <select
        className="zf-input"
        value={filterType}
        onChange={(e) => onTypeChange(e.target.value)}
        aria-label="Filter by record type"
        disabled={disabled}
      >
        <option value="">All Types</option>
        <option value="INCOME">INCOME</option>
        <option value="EXPENSE">EXPENSE</option>
      </select>

      <input
        className="zf-input"
        type="text"
        value={filterCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        placeholder="Category"
        aria-label="Filter by category"
        disabled={disabled}
      />

      <input
        className="zf-input"
        type="text"
        value={filterSearch}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search notes"
        aria-label="Search by keyword"
        disabled={disabled}
      />

      <input
        className="zf-input"
        type="date"
        value={filterStartDate}
        onChange={(e) => onStartDateChange && onStartDateChange(e.target.value)}
        aria-label="Filter from date"
        disabled={disabled}
      />

      <input
        className="zf-input"
        type="date"
        value={filterEndDate}
        onChange={(e) => onEndDateChange && onEndDateChange(e.target.value)}
        aria-label="Filter to date"
        disabled={disabled}
      />

      <button className="zf-btn zf-btn-primary" type="submit" disabled={disabled}>
        Apply Filters
      </button>
    </form>
  );
}
