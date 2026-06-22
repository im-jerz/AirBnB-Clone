import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
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
  IconX,
} from "../../components/icons";
import BookingStatusBadge from "../../components/booking/BookingStatusBadge";
import BookingStatusTimeline from "../../components/booking/BookingStatusTimeline";
import PriceBreakdown from "../../components/booking/PriceBreakdown";
import CancelBookingModal from "../../components/booking/CancelBookingModal";
import DisputeModal from "../../components/booking/DisputeModal";
import { useToast } from "../../components/common/Toast";
import { resolveMediaUrl } from "../../api/properties";
import { formatPHP } from "../../utils/formatCurrency";
import { formatFullDate, nightsBetween } from "../../utils/formatDate";

const POLICY_LABEL = { flexible: "Flexible", moderate: "Moderate", strict: "Strict" };
const PAYMENT_LABEL = { paid: "Paid", pending: "Pending", refunded: "Refunded" };

/**
 * Booking Detail — rendered as a slide-in drawer over the Bookings list
 * (nested route under /dashboard/bookings/:id, Outlet'd from Bookings.jsx)
 * rather than its own page, so the host never loses their place in the
 * list while drilling into a reservation.
 */
export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookings, loading, cancel, dispute } = useOutletContext();
  const { push } = useToast();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [closing, setClosing] = useState(false);

  const booking = bookings.find((b) => String(b.booking_id) === String(id));

  function close() {
    // Play the slide-out transition before unmounting via navigation.
    setClosing(true);
    window.setTimeout(() => navigate("/dashboard/bookings"), 180);
  }

  useEffect(() => {
    document.body.style.overflow = "hidden";
    function onKey(e) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function handleDisputeConfirm(reason) {
    setBusy(true);
    try {
      await dispute(booking, reason);
      push("Dispute submitted. Our team will review it shortly.", "info");
      setDisputeOpen(false);
    } catch (err) {
      push(err.response?.data?.message || "Couldn't submit this report. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  const nights = booking ? nightsBetween(booking.check_in, booking.check_out) : 0;
  const isCancellable = booking && (booking.status === "confirmed" || booking.status === "in_progress");
  const isDisputable = booking && ["confirmed", "in_progress", "completed"].includes(booking.status);
  const initial = booking?.guest_name?.charAt(0)?.toUpperCase() || "G";

  return (
    <div className={`drawer-overlay ${closing ? "closing" : ""}`} onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <aside className="drawer-panel" role="dialog" aria-modal="true" aria-label="Booking detail">
        <div className="drawer-header">
          {booking ? (
            <div>
              <span className="drawer-eyebrow">Booking {booking.reference}</span>
              <h2>{booking.property_title}</h2>
            </div>
          ) : (
            <div>
              <span className="drawer-eyebrow">Booking detail</span>
            </div>
          )}
          <button type="button" className="drawer-close-btn" onClick={close} aria-label="Close">
            <IconX />
          </button>
        </div>

        <div className="drawer-body">
          {loading ? (
            <div className="docket-skel">
              <div className="docket-skel-photo skeleton-shimmer" />
              <div className="docket-skel-body">
                <div className="skeleton-line skeleton-shimmer w-40" />
                <div className="skeleton-line skeleton-shimmer w-80" />
                <div className="skeleton-line skeleton-shimmer w-60" />
              </div>
            </div>
          ) : !booking ? (
            <div className="empty-state">
              <h3>Booking not found</h3>
              <p>This reservation may have been removed, or the link is incorrect.</p>
              <Link to="/dashboard/bookings" className="btn-inline btn-primary" onClick={close}>Back to Bookings</Link>
            </div>
          ) : (
            <>
              <div className="drawer-status-row">
                <BookingStatusBadge status={booking.status} />
              </div>

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

              {/* Price breakdown */}
              <div className="detail-card">
                <h2 className="detail-card-title">Price breakdown</h2>
                <PriceBreakdown price={booking.price} nights={nights} />
              </div>

              {/* Actions */}
              {isCancellable || isDisputable ? (
                <div className="detail-card">
                  <h2 className="detail-card-title">Actions</h2>
                  <div className="detail-side-actions">
                    {isCancellable ? (
                      <button type="button" className="btn-inline btn-danger" style={{ width: "100%" }} onClick={() => setCancelOpen(true)}>
                        Cancel booking
                      </button>
                    ) : null}
                    {isDisputable ? (
                      <button type="button" className="btn-inline btn-ghost" style={{ width: "100%" }} onClick={() => setDisputeOpen(true)}>
                        <IconFlag /> Report an issue
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </aside>

      {booking ? (
        <>
          <CancelBookingModal
            open={cancelOpen}
            booking={booking}
            busy={busy}
            onConfirm={handleCancelConfirm}
            onCancel={() => setCancelOpen(false)}
          />
          <DisputeModal
            open={disputeOpen}
            booking={booking}
            busy={busy}
            onConfirm={handleDisputeConfirm}
            onCancel={() => setDisputeOpen(false)}
          />
        </>
      ) : null}
    </div>
  );
}