import { useState } from "react";
import { FiX, FiCheck } from "react-icons/fi";

export default function RecordModal({ open, onClose, onSubmit, initialData = null, busy }) {
  // Determine if creating new record or editing existing one
  const isCreating = !initialData?._id;

  const [form, setForm] = useState(() => ({
    date: initialData?.date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    type: initialData?.type || "INCOME",
    category: initialData?.category || "",
    amount: initialData?.amount || "",
    notes: initialData?.notes || "",
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, amount: Number(form.amount) });
  };

  if (!open) return null;

  return (
    <div className="zf-modal-overlay" onClick={!busy ? onClose : undefined}>
      <div className="zf-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="zf-modal-header">
          <h2 className="zf-modal-title">{isCreating ? "Create New Record" : "Edit Record"}</h2>
          <button
            type="button"
            className="zf-modal-close"
            onClick={onClose}
            disabled={busy}
            aria-label="Close modal"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="zf-modal-form">
          {/* Row 1: Date | Amount */}
          <div className="zf-form-group">
            <label className="zf-form-label">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="zf-form-input"
              required
              disabled={busy}
            />
          </div>

          <div className="zf-form-group">
            <label className="zf-form-label">Amount</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className="zf-form-input"
              required
              min="0"
              disabled={busy}
            />
          </div>

          {/* Row 2: Type | Category */}
          <div className="zf-form-group">
            <label className="zf-form-label">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="zf-form-input"
              required
              disabled={busy}
            >
              <option value="INCOME">INCOME</option>
              <option value="EXPENSE">EXPENSE</option>
            </select>
          </div>

          <div className="zf-form-group">
            <label className="zf-form-label">Category</label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="zf-form-input"
              required
              disabled={busy}
            />
          </div>

          {/* Row 3: Notes (Full Width) */}
          <div className="zf-form-group zf-form-group-full">
            <label className="zf-form-label">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="zf-form-textarea"
              rows="4"
              disabled={busy}
            />
          </div>

          {/* Actions */}
          <div className="zf-modal-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="zf-btn zf-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="zf-btn zf-btn-success"
            >
              {busy ? (
                <>
                  <span className="inline-block animate-spin mr-2">⟳</span>
                  {isCreating ? "Creating..." : "Saving..."}
                </>
              ) : (
                <>
                  <FiCheck size={16} />
                  {isCreating ? "Create Record" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
