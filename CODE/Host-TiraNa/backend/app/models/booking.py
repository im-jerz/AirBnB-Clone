"""
ORM models for BOOKINGS, BOOKING_PRICE_DETAILS, BOOKING_CANCELLATIONS,
PAYMENTS, and SupportTicket (the dispute side only).

Matches Section 2.3 ("Bookings") and the booking_dispute slice of
Section 2.8 ("Support & Disputes") of host_database_schema.sql,
verified column-for-column against the Oracle DDL the host sent.

Notes on fields the frontend expects but the schema doesn't own:
  - `reference` (e.g. "TR-1001") isn't a column — it's derived from
    the booking id in BookingListItemSchema / BookingDetailSchema.
  - Guest profile fields (name, phone, avatar, member-since) live in
    the separate guest/client module, not this host database. Only
    `guest_external_id` and `guest_email` are stored here. Until a
    guest-service integration exists, the API derives a display name
    from the email and returns null for phone/avatar/member_since —
    see booking_service.py.
"""

from datetime import datetime
from app.extensions import db


class Booking(db.Model):
    __tablename__ = "BOOKINGS"

    STATUSES = ("pending", "confirmed", "in_progress", "completed", "cancelled", "declined", "disputed")

    id = db.Column(db.Integer, db.Identity(), primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey("PROPERTIES.id"), nullable=False, index=True)
    host_id = db.Column(db.Integer, db.ForeignKey("HOSTS.id"), nullable=False, index=True)

    guest_external_id = db.Column(db.String(255), nullable=False, index=True)
    guest_email = db.Column(db.String(255), nullable=False)

    check_in = db.Column(db.Date, nullable=False)
    check_out = db.Column(db.Date, nullable=False)
    guests_count = db.Column(db.Integer, default=1)

    status = db.Column(db.String(20), nullable=False, default="pending")
    special_requests = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Named "listing" (not "property") because a class attribute named
    # `property` shadows Python's built-in @property decorator, which
    # breaks the `reference` property defined further down this class.
    listing = db.relationship("Property", backref=db.backref("bookings", cascade="all, delete-orphan"))
    host = db.relationship("Host", backref=db.backref("bookings", cascade="all, delete-orphan"))
    price_detail = db.relationship(
        "BookingPriceDetail", backref="booking", uselist=False, cascade="all, delete-orphan"
    )
    cancellation = db.relationship(
        "BookingCancellation", backref="booking", uselist=False, cascade="all, delete-orphan"
    )
    payments = db.relationship(
        "Payment", backref="booking", cascade="all, delete-orphan",
        order_by="Payment.created_at.desc()",
    )
    support_tickets = db.relationship(
        "SupportTicket", backref="booking", cascade="all, delete-orphan"
    )

    @property
    def reference(self):
        """Human-facing booking code, e.g. "TR-1001" — derived, not stored."""
        return f"TR-{self.id:04d}"

    def __repr__(self):
        return f"<Booking {self.reference} ({self.status})>"


class BookingPriceDetail(db.Model):
    __tablename__ = "BOOKING_PRICE_DETAILS"

    id = db.Column(db.Integer, db.Identity(), primary_key=True)
    booking_id = db.Column(
        db.Integer, db.ForeignKey("BOOKINGS.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    base_price = db.Column(db.Numeric(10, 2), nullable=False)
    nights = db.Column(db.Integer, nullable=False)
    cleaning_fee = db.Column(db.Numeric(10, 2), default=0)
    service_fee = db.Column(db.Numeric(10, 2), default=0)
    commission_rate = db.Column(db.Numeric(5, 2), default=0)
    commission_amount = db.Column(db.Numeric(10, 2), default=0)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    host_payout = db.Column(db.Numeric(10, 2), nullable=False)

    def __repr__(self):
        return f"<BookingPriceDetail booking={self.booking_id} total={self.total_price}>"


class BookingCancellation(db.Model):
    __tablename__ = "BOOKING_CANCELLATIONS"

    CANCELLED_BY = ("host", "guest", "admin")

    id = db.Column(db.Integer, db.Identity(), primary_key=True)
    booking_id = db.Column(
        db.Integer, db.ForeignKey("BOOKINGS.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    cancelled_by = db.Column(db.String(10), nullable=False)
    reason = db.Column(db.String(500))
    refund_amount = db.Column(db.Numeric(10, 2), default=0)
    cancelled_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<BookingCancellation booking={self.booking_id} by={self.cancelled_by}>"


class Payment(db.Model):
    __tablename__ = "PAYMENTS"

    STATUSES = ("pending", "paid", "failed", "refunded")

    id = db.Column(db.Integer, db.Identity(), primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("BOOKINGS.id"), nullable=False, index=True)
    paymongo_payment_id = db.Column(db.String(255))
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(50))
    status = db.Column(db.String(20), nullable=False, default="pending")
    paid_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Payment booking={self.booking_id} {self.status}>"


class SupportTicket(db.Model):
    """
    Only the slice needed to back the Booking Detail "Dispute" panel.
    category='booking_dispute' + booking_id is how a dispute on a
    booking is represented — there's no separate disputes table in
    host_database_schema.sql (see Section 2.8).
    """

    __tablename__ = "SUPPORT_TICKETS"

    CATEGORIES = ("booking_dispute", "payment_issue", "account_issue", "technical", "other")
    STATUSES = ("open", "in_review", "resolved", "closed")

    id = db.Column(db.Integer, db.Identity(), primary_key=True)
    host_id = db.Column(db.Integer, db.ForeignKey("HOSTS.id"), nullable=False, index=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("BOOKINGS.id"), index=True)
    category = db.Column(db.String(50))
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default="open")
    resolution_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)

    def __repr__(self):
        return f"<SupportTicket {self.category} booking={self.booking_id} ({self.status})>"