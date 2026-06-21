import { useMemo, useState } from "react";
import BookingDocket from "../../components/booking/BookingDocket";
import DocketSkeleton from "../../components/booking/DocketSkeleton";
import BookingEmptyState from "../../components/booking/BookingEmptyState";
import DeclineModal from "../../components/booking/DeclineModal";
import CancelBookingModal from "../../components/booking/CancelBookingModal";
import { useToast } from "../../components/common/Toast";
import { IconCalendarCheck, IconClock } from "../../components/icons";
import useBookingsData from "./useBookingsData";

const SECTIONS = [
  { key: "requests", label: "Requests" },
  { key: "all", label: "My Bookings" },
];

const HISTORY_TABS = [
  { key: "upcoming", label: "Upcoming", statuses: ["confirmed"] },
  { key: "active", label: "Active", statuses: ["in_progress"] },
  { key: "completed", label: "Completed", statuses: ["completed"] },
  { key: "cancelled", label: "Cancelled", statuses: ["cancelled", "declined"] },
  { key: "disputed", label: "Disputed", statuses: ["disputed"] },
];

export default function Bookings() {
  const { bookings, loading, error, approve, decline, cancel } = useBookingsData();
  const { push } = useToast();

  const [section, setSection] = useState("requests");
  const [historyTab, setHistoryTab] = useState("upcoming");
  const [declineTarget, setDeclineTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const pending = useMemo(
    () => bookings.filter((b) => b.status === "pending").sort((a, b) => new Date(a.response_due_at) - new Date(b.response_due_at)),
    [bookings]
  );

  const tabCounts = useMemo(() => {
    const c = {};
    for (const tab of HISTORY_TABS) {
      c[tab.key] = bookings.filter((b) => tab.statuses.includes(b.status)).length;
    }
    return c;
  }, [bookings]);

  const visibleHistory = useMemo(() => {
    const tab = HISTORY_TABS.find((t) => t.key === historyTab);
    const list = bookings.filter((b) => tab.statuses.includes(b.status));
    return [...list].sort((a, b) => new Date(b.check_in) - new Date(a.check_in));
  }, [bookings, historyTab]);

  async function handleApprove(booking) {
    try {
      await approve(booking);
      push(`Booking ${booking.reference} confirmed. ${booking.guest_name} has been notified.`, "success");
    } catch (err) {
      push(err.response?.data?.message || "Couldn't approve this request. Please try again.", "error");
    }
  }

  async function handleDeclineConfirm(reason) {
    if (!declineTarget) return;
    setBusy(true);
    try {
      await decline(declineTarget, reason);
      push(`Request from ${declineTarget.guest_name} was declined.`, "info");
      setDeclineTarget(null);
    } catch (err) {
      push(err.response?.data?.message || "Couldn't decline this request. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleCancelConfirm(payload) {
    if (!cancelTarget) return;
    setBusy(true);
    try {
      await cancel(cancelTarget, payload);
      push(`Booking ${cancelTarget.reference} was cancelled. Refund is being processed.`, "info");
      setCancelTarget(null);
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
          <h1>Bookings</h1>
          <p>Review reservation requests and track stays across your portfolio.</p>
        </div>
      </div>

      <div className="booking-section-switch" role="tablist" aria-label="Booking views">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={section === s.key}
            className={`booking-section-btn ${section === s.key ? "active" : ""}`}
            onClick={() => setSection(s.key)}
          >
            {s.key === "requests" ? <IconClock /> : <IconCalendarCheck />}
            {s.label}
            {s.key === "requests" && pending.length > 0 ? (
              <span className="booking-section-count">{pending.length}</span>
            ) : null}
          </button>
        ))}
      </div>

      {loading ? (
        <DocketSkeleton count={3} />
      ) : error ? (
        <div className="empty-state">
          <h3>Couldn't load your bookings</h3>
          <p>{error}</p>
        </div>
      ) : section === "requests" ? (
        pending.length === 0 ? (
          <BookingEmptyState
            title="No pending requests"
            message="New reservation requests will appear here. Make sure your listings are active so guests can book."
          />
        ) : (
          <div className="docket-list">
            {pending.map((b) => (
              <BookingDocket
                key={b.booking_id}
                booking={b}
                onApprove={handleApprove}
                onDecline={(booking) => setDeclineTarget(booking)}
              />
            ))}
          </div>
        )
      ) : (
        <>
          <div className="toolbar-row">
            <div className="filter-tabs" role="tablist" aria-label="Filter bookings by status">
              {HISTORY_TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={historyTab === t.key}
                  className={`filter-tab ${historyTab === t.key ? "active" : ""}`}
                  onClick={() => setHistoryTab(t.key)}
                >
                  {t.label}
                  {tabCounts[t.key] ? <span className="filter-tab-count">{tabCounts[t.key]}</span> : null}
                </button>
              ))}
            </div>
          </div>

          {visibleHistory.length === 0 ? (
            <BookingEmptyState
              title="Nothing here yet"
              message="No bookings yet. Make sure your listing is active to start receiving reservations."
            />
          ) : (
            <div className="docket-list">
              {visibleHistory.map((b) => (
                <BookingDocket
                  key={b.booking_id}
                  booking={b}
                  onCancel={(booking) => setCancelTarget(booking)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <DeclineModal
        open={!!declineTarget}
        booking={declineTarget}
        busy={busy}
        onConfirm={handleDeclineConfirm}
        onCancel={() => setDeclineTarget(null)}
      />

      <CancelBookingModal
        open={!!cancelTarget}
        booking={cancelTarget}
        busy={busy}
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}