"""
Business logic for the Bookings blueprint.

Routes stay thin — they validate input via Marshmallow schemas,
delegate to these service functions, and translate results into
HTTP responses via app.utils.response. Mirrors the pattern used by
app/services/property_service.py.
"""

from datetime import datetime

from app.extensions import db
from app.models.booking import Booking, BookingCancellation, SupportTicket


class BookingError(Exception):
    """Raised for expected booking-flow failures (not found, not owned, bad transition, etc.)."""

    def __init__(self, message, status=400):
        super().__init__(message)
        self.message = message
        self.status = status


# Tabs on the frontend group several statuses together (see
# pages/bookings/Bookings.jsx HISTORY_TABS) — keep that grouping here
# too so `?status=` accepts either a single value or a comma list.
STATUS_GROUPS = {
    "upcoming": ["confirmed"],
    "active": ["in_progress"],
    "completed": ["completed"],
    "cancelled": ["cancelled", "declined"],
    "disputed": ["disputed"],
}


def _get_owned_booking(booking_id: int, host_id: int) -> Booking:
    booking = Booking.query.get(int(booking_id))
    if booking is None:
        raise BookingError("Booking not found.", status=404)
    if booking.host_id != host_id:
        raise BookingError("You don't have access to this booking.", status=403)
    return booking


def list_bookings(host_id: int, status_filter: str = None, property_id: int = None):
    query = Booking.query.filter_by(host_id=host_id)

    if property_id:
        query = query.filter_by(property_id=int(property_id))

    if status_filter and status_filter != "all":
        statuses = []
        for token in status_filter.split(","):
            token = token.strip()
            statuses.extend(STATUS_GROUPS.get(token, [token]))
        query = query.filter(Booking.status.in_(statuses))

    return query.order_by(Booking.created_at.desc()).all()


def get_booking_detail(booking_id: int, host_id: int) -> Booking:
    return _get_owned_booking(booking_id, host_id)


def approve_booking(booking_id: int, host_id: int) -> Booking:
    booking = _get_owned_booking(booking_id, host_id)

    if booking.status != "pending":
        raise BookingError(f"Only pending requests can be approved (this one is '{booking.status}').", status=409)

    booking.status = "confirmed"
    db.session.commit()
    return booking


def decline_booking(booking_id: int, host_id: int, reason: str) -> Booking:
    booking = _get_owned_booking(booking_id, host_id)

    if booking.status != "pending":
        raise BookingError(f"Only pending requests can be declined (this one is '{booking.status}').", status=409)

    booking.status = "declined"
    db.session.add(
        BookingCancellation(
            booking_id=booking.id,
            cancelled_by="host",
            reason=reason,
            refund_amount=booking.price_detail.total_price if booking.price_detail else 0,
        )
    )

    # A declined request was never charged, so any payment record on
    # file is marked refunded rather than left dangling as "paid".
    for payment in booking.payments:
        if payment.status == "paid":
            payment.status = "refunded"
            payment.paid_at = payment.paid_at or datetime.utcnow()

    db.session.commit()
    return booking


def cancel_booking(booking_id: int, host_id: int, reason_label: str, reason_detail: str = "") -> Booking:
    booking = _get_owned_booking(booking_id, host_id)

    if booking.status not in ("confirmed", "in_progress"):
        raise BookingError(
            f"Only confirmed or in-progress bookings can be cancelled (this one is '{booking.status}').",
            status=409,
        )

    refund_amount = booking.price_detail.total_price if booking.price_detail else 0

    booking.status = "cancelled"
    reason_text = reason_label if not reason_detail else f"{reason_label} — {reason_detail}"
    db.session.add(
        BookingCancellation(
            booking_id=booking.id,
            cancelled_by="host",
            reason=reason_text,
            refund_amount=refund_amount,
        )
    )

    for payment in booking.payments:
        if payment.status == "paid":
            payment.status = "refunded"

    db.session.commit()
    return booking


def dispute_booking(booking_id: int, host_id: int, reason: str) -> Booking:
    booking = _get_owned_booking(booking_id, host_id)

    if booking.status not in ("confirmed", "in_progress", "completed"):
        raise BookingError(
            f"Bookings in '{booking.status}' status can't be disputed.", status=409
        )

    booking.status = "disputed"
    db.session.add(
        SupportTicket(
            host_id=host_id,
            booking_id=booking.id,
            category="booking_dispute",
            description=reason,
            status="open",
        )
    )
    db.session.commit()
    return booking


def derive_guest_display_name(guest_email: str) -> str:
    """
    Guest profile data (name, phone, avatar) lives in the separate
    guest/client module — this host database only stores
    guest_external_id and guest_email (see host_database_schema.sql
    Section 2.3). Until that integration exists, fall back to a
    title-cased name derived from the email's local part.
    """
    local_part = guest_email.split("@")[0] if guest_email else "Guest"
    cleaned = local_part.replace(".", " ").replace("_", " ").replace("-", " ")
    return cleaned.title() or "Guest"