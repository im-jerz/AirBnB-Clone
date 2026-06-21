import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  IconArrowRight,
  IconMapPin,
  IconPhone,
  IconMail,
  IconUserCircle,
  IconMessage,
  IconFlag,
  IconUsers,
  IconReceipt,
} from "../../components/icons";
import BookingStatusBadge from "../../components/booking/BookingStatusBadge";
import BookingStatusTimeline from "../../components/booking/BookingStatusTimeline";
import PriceBreakdown from "../../components/booking/PriceBreakdown";
import CancelBookingModal from "../../components/booking/CancelBookingModal";
import { useToast } from "../../components/common/Toast";
import { resolveMediaUrl } from "../../api/properties";
import { formatPHP } from "../../utils/formatCurrency";
import { formatFullDate, formatDateRange, nightsBetween } from "../../utils/formatDate";
import useBookingsData from "./useBookingsData";

const POLICY_LABEL = { flexible: "Flexible", moderate: "Moderate", strict: "Strict" };
const PAYMENT_LABEL = { paid: "Paid", pending: "Pending", refunded: "Refunded" };

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookings, loading, cancel } = useBookingsData();
  const { push } = useToast();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const booking = bookings.find((b) => String(b.booking_id) === String(id));

  if (loading) {
    return (
      <div>
        <div className="docket-skel" style={{ marginBottom: "var(--space-5)" }}>
          <div className="docket-skel-photo skeleton-shimmer" />
          <div className="docket-skel-body">
            <div className="skeleton-line skeleton-shimmer w-40" />
            <div className="skeleton-line skeleton-shimmer w-80" />
            <div className="skeleton-line skeleton-shimmer w-60" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="empty-state">
        <h3>Booking not found</h3>
        <p>This reservation may have been removed, or the link is incorrect.</p>
        <Link to="/dashboard/bookings" className="btn-inline btn-primary">Back to Bookings</Link>
      </div>
    );
  }

  const nights = nightsBetween(booking.check_in, booking.check_out);
  const isCancellable = booking.status === "confirmed" || booking.status === "in_progress";
  const initial = booking.guest_name?.charAt(0)?.toUpperCase() || "G";

  async function handleCancelConfirm(payload) {
    setBusy(true);
    try {
      await cancel(booking, payload);
      push(`Booking ${booking.reference} was cancelled. Refund is being processed.`, "info");
      setCancelOpen(false);
    } catch (err) {
      push(err.response?.data?.message || "Couldn't cancel this booking. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="page-head">
        <div className="page-head-text">
          <button type="button" className="btn-inline btn-ghost btn-inline-sm" onClick={() => navigate(-1)} style={{ marginBottom: "var(--space-2)", paddingLeft: 0 }}>
            <IconArrowRight style={{ transform: "rotate(180deg)" }} /> Back
          </button>
          <h1>Booking {booking.reference}</h1>
          <p>{booking.property_title} · {formatDateRange(booking.check_in, booking.check_out)}</p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          {/* Property + dates summary card */}
          <div className="detail-card">
            <div className="detail-property-row">
              <img src={resolveMediaUrl(booking.property_cover_photo)} alt="" className="detail-property-photo" />
              <div className="detail-property-text">
                <Link to={`/dashboard/properties/${booking.property_id}/edit`} className="detail-property-link">
                  {booking.property_title}
                </Link>
                <span><IconMapPin /> {booking.property_city}, {booking.property_province}</span>
              </div>
            </div>

            <div className="docket-route" style={{ marginTop: "var(--space-5)" }}>
              <div className="docket-route-point">
                <span className="docket-route-label">Check-in</span>
                <span className="docket-route-date">{formatFullDate(booking.check_in)}</span>
              </div>
              <div className="docket-route-line">
                <IconArrowRight />
                <span>{nights} night{nights !== 1 ? "s" : ""}</span>
              </div>
              <div className="docket-route-point align-end">
                <span className="docket-route-label">Check-out</span>
                <span className="docket-route-date">{formatFullDate(booking.check_out)}</span>
              </div>
            </div>

            <div className="detail-meta-strip">
              <span><IconUsers /> {booking.guests_count} guest{booking.guests_count > 1 ? "s" : ""}</span>
              <span><IconReceipt /> Payment {PAYMENT_LABEL[booking.payment_status] || booking.payment_status}</span>
              <span>Cancellation: {POLICY_LABEL[booking.cancellation_policy] || "Moderate"}</span>
            </div>
          </div>

          {/* Status timeline */}
          <div className="detail-card">
            <h2 className="detail-card-title">Status timeline</h2>
            <BookingStatusTimeline booking={booking} />
          </div>

          {/* Special requests */}
          {booking.special_requests ? (
            <div className="detail-card">
              <h2 className="detail-card-title">Guest's special requests</h2>
              <p className="detail-requests-text">{booking.special_requests}</p>
            </div>
          ) : null}

          {/* Cancellation info, if cancelled */}
          {booking.cancellation ? (
            <div className="detail-card">
              <h2 className="detail-card-title">Cancellation details</h2>
              <div className="detail-meta-strip" style={{ marginBottom: "var(--space-3)" }}>
                <span>Cancelled by {booking.cancellation.cancelled_by}</span>
                <span>Refund {formatPHP(booking.cancellation.refund_amount)}</span>
              </div>
              <p className="detail-requests-text">{booking.cancellation.reason}{booking.cancellation.detail ? ` — ${booking.cancellation.detail}` : ""}</p>
            </div>
          ) : null}

          {/* Dispute info, if disputed */}
          {booking.dispute ? (
            <div className="detail-card">
              <h2 className="detail-card-title"><IconFlag style={{ display: "inline", marginRight: 6, verticalAlign: -3 }} />Dispute</h2>
              <div className="detail-meta-strip" style={{ marginBottom: "var(--space-3)" }}>
                <span>Status: {booking.dispute.status === "in_review" ? "Under admin review" : booking.dispute.status}</span>
              </div>
              <p className="detail-requests-text">{booking.dispute.reason}</p>
            </div>
          ) : null}
        </div>

        <div className="detail-side">
          {/* Guest info card */}
          <div className="detail-card">
            <h2 className="detail-card-title">Guest</h2>
            <div className="detail-guest-block">
              <span className="docket-guest-avatar lg">{initial}</span>
              <div>
                <strong>{booking.guest_name}</strong>
                <span className="detail-guest-since">Member since {formatFullDate(booking.guest_member_since)}</span>
              </div>
            </div>

            {(booking.status === "confirmed" || booking.status === "in_progress" || booking.status === "completed") ? (
              <div className="detail-contact-list">
                <a href={`mailto:${booking.guest_email}`} className="detail-contact-row">
                  <IconMail /> {booking.guest_email}
                </a>
                <a href={`tel:${booking.guest_phone}`} className="detail-contact-row">
                  <IconPhone /> {booking.guest_phone}
                </a>
              </div>
            ) : (
              <p className="detail-contact-hidden">Contact details are revealed once the booking is confirmed.</p>
            )}

            <div className="detail-side-actions">
              <Link to="/dashboard/messages" className="btn-inline btn-secondary" style={{ width: "100%" }}>
                <IconMessage /> Message guest
              </Link>
              <Link to={`/dashboard/guests/${booking.guest_external_id}`} className="btn-inline btn-ghost" style={{ width: "100%" }}>
                <IconUserCircle /> View guest profile
              </Link>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="detail-card">
            <h2 className="detail-card-title">Price breakdown</h2>
            <PriceBreakdown price={booking.price} nights={nights} />
          </div>

          {/* Actions */}
          {(isCancellable || booking.status === "confirmed") ? (
            <div className="detail-card">
              <h2 className="detail-card-title">Actions</h2>
              <div className="detail-side-actions">
                {isCancellable ? (
                  <button type="button" className="btn-inline btn-danger" style={{ width: "100%" }} onClick={() => setCancelOpen(true)}>
                    Cancel booking
                  </button>
                ) : null}
                <button type="button" className="btn-inline btn-ghost" style={{ width: "100%" }}>
                  <IconFlag /> Report an issue
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <CancelBookingModal
        open={cancelOpen}
        booking={booking}
        busy={busy}
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelOpen(false)}
      />
    </div>
  );
}