import EmptyState from "../common/EmptyState";

export default function CategoryBreakdown({ categories }) {
  return (
    <section className="zf-section" id="analytics">
      <h2 className="zf-section__title">Category Breakdown</h2>
      {!categories?.length ? (
        <EmptyState title="No category data" subtitle="Category totals will show here once records are available." />
      ) : (
        <div className="zf-table-wrap">
          <table className="zf-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Type</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((item, index) => (
                <tr key={`${item.category}-${item.type}-${index}`}>
                  <td>{item.category}</td>
                  <td>{item.type}</td>
                  <td>{`INR ${Number(item.total).toLocaleString()}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
