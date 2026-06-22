import { useState } from "react";
import { IconFlag } from "../icons";

const MIN_LENGTH = 10;

export default function DisputeModal({ open, booking, busy, onConfirm, onCancel }) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  const canSubmit = reason.trim().length >= MIN_LENGTH;

  function handleConfirm() {
    if (!canSubmit) return;
    onConfirm(reason.trim());
  }

  function handleCancel() {
    setReason("");
    onCancel();
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) handleCancel(); }}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="dispute-modal-title">
        <div className="modal-icon-wrap danger">
          <IconFlag />
        </div>
        <h3 id="dispute-modal-title">Report an issue</h3>
        <p>
          This flags booking {booking?.reference} with {booking?.guest_name} for review by our support team.
        </p>

        <div className="form-field" style={{ marginBottom: "var(--space-5)" }}>
          <label className="form-label" htmlFor="dispute-reason">What happened?</label>
          <textarea
            id="dispute-reason"
            className="builder-textarea"
            rows={4}
            placeholder="Describe the issue in detail — e.g. property damage, guest conduct, a payment discrepancy…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={1000}
          />
          <span className="char-counter">{reason.length}/1000</span>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-inline btn-secondary" onClick={handleCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn-inline btn-danger" onClick={handleConfirm} disabled={busy || !canSubmit}>
            {busy ? "Submitting…" : "Submit report"}
          </button>
        </div>
      </div>
    </div>
  );
}