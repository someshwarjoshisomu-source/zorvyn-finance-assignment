import { useState } from "react";

const initialForm = {
  amount: "",
  type: "INCOME",
  category: "",
  date: "",
  notes: "",
};

export default function AddRecordForm({ onSubmit, busy = false }) {
  const [form, setForm] = useState(initialForm);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const shouldReset = await onSubmit({
      amount: Number(form.amount),
      type: form.type,
      category: form.category,
      date: form.date,
      notes: form.notes,
    });

    if (shouldReset) setForm(initialForm);
  };

  return (
    <form className="zf-record-form" onSubmit={handleSubmit}>
      <input
        className="zf-input"
        type="number"
        min="0"
        step="0.01"
        value={form.amount}
        onChange={(e) => handleChange("amount", e.target.value)}
        placeholder="Amount"
        required
        disabled={busy}
      />
      <select
        className="zf-input"
        value={form.type}
        onChange={(e) => handleChange("type", e.target.value)}
        disabled={busy}
      >
        <option value="INCOME">INCOME</option>
        <option value="EXPENSE">EXPENSE</option>
      </select>
      <input
        className="zf-input"
        type="text"
        value={form.category}
        onChange={(e) => handleChange("category", e.target.value)}
        placeholder="Category"
        required
        disabled={busy}
      />
      <input
        className="zf-input"
        type="date"
        value={form.date}
        onChange={(e) => handleChange("date", e.target.value)}
        required
        disabled={busy}
      />
      <input
        className="zf-input"
        type="text"
        value={form.notes}
        onChange={(e) => handleChange("notes", e.target.value)}
        placeholder="Notes"
        disabled={busy}
      />
      <button className="zf-btn zf-btn-primary" type="submit" disabled={busy}>
        {busy ? "Saving..." : "Save Record"}
      </button>
    </form>
  );
}
