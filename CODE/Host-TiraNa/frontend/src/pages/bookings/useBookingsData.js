import { useCallback, useEffect, useState } from "react";
import {
  getBookings,
  approveBooking as apiApproveBooking,
  declineBooking as apiDeclineBooking,
  cancelBooking as apiCancelBooking,
} from "../../api/bookings";
import { MOCK_BOOKINGS } from "../../data/mockBookings";

// Backend bookings endpoints aren't live yet — this page is frontend-only
// for now (see host_flow.md §4 / §16). Flip to `false` the moment
// backend/app/blueprints/bookings/ ships, same pattern as usePropertiesData.
const USE_MOCK = true;

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

  const approve = useCallback(async (booking) => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 450));
      setBookings((list) =>
        list.map((b) => (b.booking_id === booking.booking_id ? { ...b, status: "confirmed", response_due_at: null } : b))
      );
      return;
    }
    await apiApproveBooking(booking.booking_id);
    setBookings((list) =>
      list.map((b) => (b.booking_id === booking.booking_id ? { ...b, status: "confirmed", response_due_at: null } : b))
    );
  }, []);

  const decline = useCallback(async (booking, reason) => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 450));
      setBookings((list) =>
        list.map((b) =>
          b.booking_id === booking.booking_id
            ? { ...b, status: "declined", decline_reason: reason, response_due_at: null }
            : b
        )
      );
      return;
    }
    await apiDeclineBooking(booking.booking_id, reason);
    setBookings((list) =>
      list.map((b) =>
        b.booking_id === booking.booking_id ? { ...b, status: "declined", decline_reason: reason } : b
      )
    );
  }, []);

  const cancel = useCallback(async (booking, payload) => {
    const reasonLabel = payload.reason_label;
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 450));
      setBookings((list) =>
        list.map((b) =>
          b.booking_id === booking.booking_id
            ? {
                ...b,
                status: "cancelled",
                cancellation: {
                  cancelled_by: "host",
                  reason: reasonLabel,
                  detail: payload.reason_detail,
                  refund_amount: b.price.total_price,
                  cancelled_at: new Date().toISOString(),
                },
              }
            : b
        )
      );
      return;
    }
    await apiCancelBooking(booking.booking_id, payload);
    setBookings((list) =>
      list.map((b) =>
        b.booking_id === booking.booking_id
          ? { ...b, status: "cancelled", cancellation: { cancelled_by: "host", reason: reasonLabel, ...payload } }
          : b
      )
    );
  }, []);

  return { bookings, loading, error, reload: load, approve, decline, cancel };
}