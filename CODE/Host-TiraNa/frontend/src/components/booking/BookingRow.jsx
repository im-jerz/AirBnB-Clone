import { useNavigate } from "react-router-dom";
import BookingStatusBadge from "./BookingStatusBadge";
import { IconArrowRight, IconClock } from "../icons";
import { resolveMediaUrl } from "../../api/properties";
import { formatPHP } from "../../utils/formatCurrency";
import { formatShortDate, relativeFromNow, nightsBetween } from "../../utils/formatDate";

/**
 * Dense inbox-style row for the main Bookings list. One booking per line —
 * thumbnail, guest, property, date range, status, payout, quick actions —
 * so a host can scan dozens of reservations at a glance instead of
 * scrolling through tall cards. Clicking the row opens the detail drawer
 * (navigates to /dashboard/bookings/:id, rendered as an overlay by the
 * parent Bookings page) rather than leaving the list.
 */
export default function BookingRow({ booking, onApprove, onDecline, onCancel }) {
  const navigate = useNavigate();
  const b = booking;
  const nights = nightsBetween(b.check_in, b.check_out);
  const isPending = b.status === "pending";
  const isCancellable = b.status === "confirmed" || b.status === "in_progress";
  const initial = b.guest_name?.charAt(0)?.toUpperCase() || "G";

  function openDetail(e) {
    // Don't open the drawer when an action button inside the row was clicked.
    if (e.target.closest("[data-row-action]")) return;
    navigate(`/dashboard/bookings/${b.booking_id}`);
  }

  return (
    <article
      className={`booking-row ${isPending ? "is-pending" : ""}`}
      onClick={openDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") openDetail(e); }}
    >
      <img src={resolveMediaUrl(b.property_cover_photo)} alt="" className="booking-row-thumb" loading="lazy" />

      <div className="booking-row-guest">
        <span className="booking-row-avatar">{initial}</span>
        <div className="booking-row-guest-text">
          <strong>{b.guest_name}</strong>
          <span>{b.property_title}</span>
        </div>
      </div>

      <div className="booking-row-meta">
        <div className="booking-row-dates">
          <span>{formatShortDate(b.check_in)}</span>
          <IconArrowRight />
          <span>{formatShortDate(b.check_out)}</span>
          <span className="booking-row-nights">· {nights}n</span>
        </div>

        <span className="booking-row-ref">{b.reference}</span>

        <span className="booking-row-amount">{formatPHP(b.price.host_payout)}</span>

        {isPending && b.response_due_at ? (
          <span className="booking-row-due">
            <IconClock /> {relativeFromNow(b.response_due_at)}
          </span>
        ) : null}
      </div>

      <BookingStatusBadge status={b.status} size="sm" />

      <div className="booking-row-actions" data-row-action>
        {isPending ? (
          <>
            <button type="button" className="btn-inline btn-primary btn-inline-sm" data-row-action onClick={() => onApprove(b)}>
              Approve
            </button>
            <button type="button" className="btn-inline btn-secondary btn-inline-sm" data-row-action onClick={() => onDecline(b)}>
              Decline
            </button>
          </>
        ) : isCancellable ? (
          <button type="button" className="btn-inline btn-ghost btn-inline-sm" data-row-action onClick={() => onCancel(b)}>
            Cancel
          </button>
        ) : null}
      </div>
    </article>
  );
}