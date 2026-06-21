import { Link } from "react-router-dom";
import BookingStatusBadge from "./BookingStatusBadge";
import { IconArrowRight, IconClock, IconMapPin } from "../icons";
import { resolveMediaUrl } from "../../api/properties";
import { formatPHP } from "../../utils/formatCurrency";
import { formatShortDate, relativeFromNow, nightsBetween } from "../../utils/formatDate";

/**
 * The "reservation docket" — this module's signature element.
 * Built like a boarding pass / cloakroom stub: a photo+route side and a
 * torn-perforated stub holding the reference code and primary action,
 * standing in for the generic list-row pattern used elsewhere.
 */
export default function BookingDocket({ booking, onApprove, onDecline, onCancel, compact = false }) {
  const b = booking;
  const nights = nightsBetween(b.check_in, b.check_out);
  const isPending = b.status === "pending";
  const isCancellable = b.status === "confirmed" || b.status === "in_progress";
  const initial = b.guest_name?.charAt(0)?.toUpperCase() || "G";

  return (
    <article className={`docket ${isPending ? "docket-pending" : ""}`}>
      <div className="docket-main">
        <div className="docket-photo">
          <img src={resolveMediaUrl(b.property_cover_photo)} alt="" loading="lazy" />
        </div>

        <div className="docket-body">
          <div className="docket-top-row">
            <div className="docket-property">
              <IconMapPin />
              <span>{b.property_title} · {b.property_city}</span>
            </div>
            <BookingStatusBadge status={b.status} size="sm" />
          </div>

          <div className="docket-guest-row">
            <span className="docket-guest-avatar">{initial}</span>
            <div className="docket-guest-text">
              <strong>{b.guest_name}</strong>
              <span>{b.guests_count} guest{b.guests_count > 1 ? "s" : ""}</span>
            </div>
          </div>

          <div className="docket-route">
            <div className="docket-route-point">
              <span className="docket-route-label">Check-in</span>
              <span className="docket-route-date">{formatShortDate(b.check_in)}</span>
            </div>
            <div className="docket-route-line">
              <IconArrowRight />
              <span>{nights} night{nights !== 1 ? "s" : ""}</span>
            </div>
            <div className="docket-route-point align-end">
              <span className="docket-route-label">Check-out</span>
              <span className="docket-route-date">{formatShortDate(b.check_out)}</span>
            </div>
          </div>

          {isPending && b.message_from_guest ? (
            <p className="docket-message">&ldquo;{b.message_from_guest}&rdquo;</p>
          ) : null}

          {isPending && b.response_due_at ? (
            <div className="docket-due">
              <IconClock />
              Respond within 24 hours — <strong>{relativeFromNow(b.response_due_at)}</strong>
            </div>
          ) : null}
        </div>
      </div>

      <div className="docket-stub">
        <div className="docket-stub-perf" aria-hidden="true" />

        <div className="docket-stub-content">
          <div className="docket-stub-ref">
            <span>Reference</span>
            <strong>{b.reference}</strong>
          </div>

          <div className="docket-stub-price">
            <span>Total payout</span>
            <strong>{formatPHP(b.price.host_payout)}</strong>
          </div>

          <div className="docket-stub-actions">
            {isPending ? (
              <>
                <button type="button" className="btn-inline btn-primary btn-inline-sm" onClick={() => onApprove(b)}>
                  Approve
                </button>
                <button type="button" className="btn-inline btn-secondary btn-inline-sm" onClick={() => onDecline(b)}>
                  Decline
                </button>
              </>
            ) : (
              <>
                <Link to={`/dashboard/bookings/${b.booking_id}`} className="btn-inline btn-secondary btn-inline-sm">
                  View details
                </Link>
                {!compact && isCancellable ? (
                  <button type="button" className="btn-inline btn-ghost btn-inline-sm" onClick={() => onCancel(b)}>
                    Cancel
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}