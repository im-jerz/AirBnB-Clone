import { useState } from "react";
import { IconAlertTriangle, IconChevronDown } from "../icons";
import { DECLINE_REASONS } from "../../data/mockBookings";

export default function DeclineModal({ open, booking, busy, onConfirm, onCancel }) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  function handleConfirm() {
    if (!reason) return;
    onConfirm(reason);
  }

  function handleCancel() {
    setReason("");
    onCancel();
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) handleCancel(); }}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="decline-modal-title">
        <div className="modal-icon-wrap danger">
          <IconAlertTriangle />
        </div>
        <h3 id="decline-modal-title">Decline this request?</h3>
        <p>
          {booking?.guest_name} won't be able to book {booking?.property_title} for these dates. They'll be notified right away.
        </p>

        <div className="form-field" style={{ marginBottom: "var(--space-5)" }}>
          <label className="form-label" htmlFor="decline-reason">Reason for declining</label>
          <div className="sort-select-wrap" style={{ width: "100%" }}>
            <select
              id="decline-reason"
              className="sort-select"
              style={{ width: "100%" }}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="" disabled>Select a reason…</option>
              {DECLINE_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <IconChevronDown width={16} height={16} />
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-inline btn-secondary" onClick={handleCancel} disabled={busy}>
            Never mind
          </button>
          <button type="button" className="btn-inline btn-danger" onClick={handleConfirm} disabled={busy || !reason}>
            {busy ? "Declining…" : "Decline request"}
          </button>
        </div>
      </div>
    </div>
  );
}