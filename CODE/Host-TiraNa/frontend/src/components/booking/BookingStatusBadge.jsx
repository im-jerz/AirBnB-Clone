import { BOOKING_STATUS_LABEL } from "../../data/mockBookings";

export default function BookingStatusBadge({ status, size = "md" }) {
  return (
    <span className={`booking-status-badge ${status} ${size === "sm" ? "sm" : ""}`}>
      <span className="booking-status-dot" />
      {BOOKING_STATUS_LABEL[status] || status}
    </span>
  );
}