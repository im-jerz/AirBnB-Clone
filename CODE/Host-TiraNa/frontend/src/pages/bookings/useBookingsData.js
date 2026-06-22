import { useCallback, useEffect, useState } from "react";
import {
  getBookings,
  approveBooking as apiApproveBooking,
  declineBooking as apiDeclineBooking,
  cancelBooking as apiCancelBooking,
  disputeBooking as apiDisputeBooking,
} from "../../api/bookings";
import { MOCK_BOOKINGS } from "../../data/mockBookings";

// Backend bookings endpoints are live (backend/app/blueprints/bookings/),
// backed by the BOOKINGS / BOOKING_PRICE_DETAILS / BOOKING_CANCELLATIONS /
// PAYMENTS tables — same pattern as usePropertiesData.js. Flip back to
// `true` only if you need to work on the UI with no backend running.
const USE_MOCK = false;

export default function useBookingsData() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 650));
        setBookings(MOCK_BOOKINGS);
      } else {
        const res = await getBookings();
        setBookings(res.data?.bookings ?? []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load your bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Replaces one booking in local state with a fresh copy from the server. */
  const applyUpdatedBooking = useCallback((updated) => {
    setBookings((list) => list.map((b) => (b.booking_id === updated.booking_id ? updated : b)));
  }, []);

  const approve = useCallback(
    async (booking) => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 450));
        applyUpdatedBooking({ ...booking, status: "confirmed", response_due_at: null });
        return;
      }
      const res = await apiApproveBooking(booking.booking_id);
      applyUpdatedBooking(res.data.booking);
    },
    [applyUpdatedBooking]
  );

  const decline = useCallback(
    async (booking, reason) => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 450));
        applyUpdatedBooking({ ...booking, status: "declined", response_due_at: null });
        return;
      }
      const res = await apiDeclineBooking(booking.booking_id, reason);
      applyUpdatedBooking(res.data.booking);
    },
    [applyUpdatedBooking]
  );

  const cancel = useCallback(
    async (booking, payload) => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 450));
        applyUpdatedBooking({
          ...booking,
          status: "cancelled",
          cancellation: {
            cancelled_by: "host",
            reason: payload.reason_label,
            detail: payload.reason_detail,
            refund_amount: booking.price.total_price,
            cancelled_at: new Date().toISOString(),
          },
        });
        return;
      }
      const res = await apiCancelBooking(booking.booking_id, payload);
      applyUpdatedBooking(res.data.booking);
    },
    [applyUpdatedBooking]
  );

  const dispute = useCallback(
    async (booking, reason) => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 450));
        applyUpdatedBooking({
          ...booking,
          status: "disputed",
          dispute: { reason, status: "in_review", raised_by: "host", raised_at: new Date().toISOString() },
        });
        return;
      }
      const res = await apiDisputeBooking(booking.booking_id, { reason });
      applyUpdatedBooking(res.data.booking);
    },
    [applyUpdatedBooking]
  );

  return { bookings, loading, error, reload: load, approve, decline, cancel, dispute };
}