import { useState } from "react";
import { IconAlertTriangle } from "../icons";
import { CANCELLATION_REASONS } from "../../data/mockBookings";
import { formatPHP } from "../../utils/formatCurrency";

export default function CancelBookingModal({ open, booking, busy, onConfirm, onCancel }) {
  const [reasonKey, setReasonKey] = useState("");
  const [detail, setDetail] = useState("");

  if (!open) return null;

  const reasonObj = CANCELLATION_REASONS.find((r) => r.key === reasonKey);
  const requiresDetail = reasonKey === "other";
  const canSubmit = reasonKey && (!requiresDetail || detail.trim().length >= 10);

  function handleConfirm() {
    if (!canSubmit) return;
    onConfirm({ reason_key: reasonKey, reason_label: reasonObj?.label, reason_detail: detail.trim() });
  }

  function handleCancel() {
    setReasonKey("");
    setDetail("");
    onCancel();
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) handleCancel(); }}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="cancel-modal-title">
        <div className="modal-icon-wrap danger">
          <IconAlertTriangle />
        </div>
        <h3 id="cancel-modal-title">Cancel this booking?</h3>
        <p>
          {booking?.guest_name}'s reservation at {booking?.property_title} will be cancelled and they'll be refunded automatically.
        </p>

        <div className="modal-notice">
          <IconAlertTriangle />
          <span>Cancelling may affect your performance score and host standing.</span>
        </div>

        <div className="form-field" style={{ marginBottom: "var(--space-4)" }}>
          <label className="form-label">Reason (required)</label>
          <div className="cancel-reason-list">
            {CANCELLATION_REASONS.map((r) => (
              <label key={r.key} className={`cancel-reason-option ${reasonKey === r.key ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="cancel-reason"
                  value={r.key}
                  checked={reasonKey === r.key}
                  onChange={() => setReasonKey(r.key)}
                />
                <span className="radio-dot" />
                {r.label}
              </label>
            ))}
          </div>
        </div>

        {requiresDetail ? (
          <div className="form-field" style={{ marginBottom: "var(--space-4)" }}>
            <textarea
              className="builder-textarea"
              rows={3}
              placeholder="Tell us more about why you're cancelling…"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              maxLength={500}
            />
            <span className="char-counter">{detail.length}/500</span>
          </div>
        ) : null}

        {booking ? (
          <div className="price-summary-box" style={{ marginBottom: "var(--space-5)" }}>
            <div className="price-summary-row">
              <span>Guest paid</span>
              <span>{formatPHP(booking.price.total_price)}</span>
            </div>
            <div className="price-summary-row total">
              <span>Refund to guest</span>
              <span>{formatPHP(booking.price.total_price)}</span>
            </div>
          </div>
        ) : null}

        <div className="modal-actions">
          <button type="button" className="btn-inline btn-secondary" onClick={handleCancel} disabled={busy}>
            Keep booking
          </button>
          <button type="button" className="btn-inline btn-danger" onClick={handleConfirm} disabled={busy || !canSubmit}>
            {busy ? "Cancelling…" : "Cancel booking"}
          </button>
        </div>
      </div>
    </div>
  );
}