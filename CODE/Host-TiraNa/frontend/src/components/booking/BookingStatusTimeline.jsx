import { BOOKING_STATUS_FLOW, BOOKING_STATUS_LABEL } from "../../data/mockBookings";
import { IconCheck, IconX, IconFlag, IconClock } from "../icons";
import { formatDateTime } from "../../utils/formatDate";

const STEP_TITLES = {
  pending: "Request received",
  confirmed: "Booking confirmed",
  in_progress: "Guest checked in",
  completed: "Stay completed",
};

/**
 * Linear flow: pending → confirmed → in_progress → completed.
 * Branch states (declined / cancelled / disputed) replace the
 * remainder of the line with a single terminal marker, since they
 * don't continue along the happy path.
 */
export default function BookingStatusTimeline({ booking }) {
  const b = booking;
  const branchState = ["declined", "cancelled", "disputed"].includes(b.status) ? b.status : null;
  const currentIndex = branchState ? -1 : BOOKING_STATUS_FLOW.indexOf(b.status);

  return (
    <ol className="status-timeline">
      {BOOKING_STATUS_FLOW.map((step, i) => {
        const done = !branchState && i <= currentIndex;
        const isCurrent = !branchState && i === currentIndex;
        // If a booking was declined/cancelled before reaching this step,
        // only "Request received" should show as completed.
        const reached = branchState ? i === 0 : done;

        return (
          <li key={step} className={`status-timeline-step ${reached ? "done" : ""} ${isCurrent ? "current" : ""}`}>
            <span className="status-timeline-marker">
              {reached ? <IconCheck /> : <span className="status-timeline-dot" />}
            </span>
            <div className="status-timeline-text">
              <strong>{STEP_TITLES[step]}</strong>
              {step === "pending" ? <span>{formatDateTime(b.created_at)}</span> : null}
              {step === "confirmed" && reached && !branchState ? <span>{formatDateTime(b.updated_at)}</span> : null}
            </div>
          </li>
        );
      })}

      {branchState ? (
        <li className="status-timeline-step done branch">
          <span className="status-timeline-marker branch">
            {branchState === "disputed" ? <IconFlag /> : <IconX />}
          </span>
          <div className="status-timeline-text">
            <strong>
              {branchState === "cancelled"
                ? `Cancelled by ${b.cancellation?.cancelled_by || "host"}`
                : BOOKING_STATUS_LABEL[branchState]}
            </strong>
            <span>{formatDateTime(b.cancellation?.cancelled_at || b.dispute?.raised_at || b.updated_at)}</span>
          </div>
        </li>
      ) : null}

      {!branchState && b.status === "pending" && b.response_due_at ? (
        <li className="status-timeline-step upcoming">
          <span className="status-timeline-marker">
            <IconClock />
          </span>
          <div className="status-timeline-text">
            <strong>Awaiting your response</strong>
            <span>Respond by {formatDateTime(b.response_due_at)}</span>
          </div>
        </li>
      ) : null}
    </ol>
  );
}