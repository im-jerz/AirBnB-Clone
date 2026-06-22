"""
Marshmallow request/response schemas for the Bookings blueprint.

Output schemas mirror frontend/src/data/mockBookings.js field-for-field
(reference, property_*, guest_*, price.*, payment_status, cancellation,
dispute) so flipping useBookingsData.js's USE_MOCK to false requires no
shape changes on the frontend.
"""

from datetime import timedelta

from marshmallow import Schema, fields, validates, ValidationError

from app.services.booking_service import derive_guest_display_name

DECLINE_REASONS = (
    "Dates unavailable — property already blocked for maintenance",
    "Guest count exceeds property maximum",
    "Unable to verify guest details",
    "Property no longer available for these dates",
    "Other",
)

CANCELLATION_REASON_KEYS = ("damage", "emergency", "double_booking", "other")


class DeclineInputSchema(Schema):
    reason = fields.String(required=True)

    @validates("reason")
    def validate_reason(self, value, **kwargs):
        if not value.strip():
            raise ValidationError("Please select a reason.")


class CancelInputSchema(Schema):
    """Matches the payload api/bookings.js's cancelBooking() sends:
    { reason_key, reason_label, reason_detail }"""

    reason_key = fields.String(required=True)
    reason_label = fields.String(required=True)
    reason_detail = fields.String(load_default="")

    @validates("reason_key")
    def validate_reason_key(self, value, **kwargs):
        if value not in CANCELLATION_REASON_KEYS:
            raise ValidationError(f"Must be one of: {', '.join(CANCELLATION_REASON_KEYS)}.")


class DisputeInputSchema(Schema):
    reason = fields.String(required=True)

    @validates("reason")
    def validate_reason(self, value, **kwargs):
        if len(value.strip()) < 10:
            raise ValidationError("Please describe the issue in a bit more detail.")


class PriceDetailOutputSchema(Schema):
    base_price = fields.Float()
    nights = fields.Integer()
    cleaning_fee = fields.Float()
    service_fee = fields.Float()
    commission_rate = fields.Float()
    commission_amount = fields.Float()
    total_price = fields.Float()
    host_payout = fields.Float()


class CancellationOutputSchema(Schema):
    cancelled_by = fields.String()
    reason = fields.String()
    refund_amount = fields.Float()
    cancelled_at = fields.Function(lambda obj: obj.cancelled_at.isoformat() if obj.cancelled_at else None)


class DisputeOutputSchema(Schema):
    reason = fields.String(attribute="description")
    status = fields.String()
    raised_by = fields.Constant("host")
    raised_at = fields.Function(lambda obj: obj.created_at.isoformat() if obj.created_at else None)


class BookingListItemSchema(Schema):
    """Shape used by GET /api/host/bookings and GET /api/host/bookings/:id
    — matches frontend/src/data/mockBookings.js field-for-field."""

    booking_id = fields.Integer(attribute="id")
    reference = fields.String()

    property_id = fields.Integer()
    property_title = fields.Method("get_property_title")
    property_cover_photo = fields.Method("get_property_cover_photo")
    property_city = fields.Method("get_property_city")
    property_province = fields.Method("get_property_province")

    guest_external_id = fields.String()
    guest_name = fields.Method("get_guest_name")
    guest_avatar = fields.Constant(None)
    guest_email = fields.String()
    guest_phone = fields.Constant(None)
    guest_member_since = fields.Constant(None)

    check_in = fields.Date()
    check_out = fields.Date()
    guests_count = fields.Integer()
    status = fields.String()
    special_requests = fields.String()
    message_from_guest = fields.Constant("")

    created_at = fields.Function(lambda obj: obj.created_at.isoformat() if obj.created_at else None)
    updated_at = fields.Function(lambda obj: obj.updated_at.isoformat() if obj.updated_at else None)
    response_due_at = fields.Method("get_response_due_at")

    price = fields.Method("get_price")
    payment_status = fields.Method("get_payment_status")
    cancellation = fields.Method("get_cancellation")
    dispute = fields.Method("get_dispute")

    def get_property_title(self, obj):
        return obj.listing.title if obj.listing else ""

    def get_property_cover_photo(self, obj):
        if not obj.listing or not obj.listing.images:
            return None
        cover = next((img for img in obj.listing.images if img.is_cover), None)
        return (cover or obj.listing.images[0]).image_url

    def get_property_city(self, obj):
        return obj.listing.location.city if obj.listing and obj.listing.location else ""

    def get_property_province(self, obj):
        return obj.listing.location.province if obj.listing and obj.listing.location else ""

    def get_guest_name(self, obj):
        return derive_guest_display_name(obj.guest_email)

    def get_response_due_at(self, obj):
        # Host has 24h to respond to a pending request (see host_flow.md §4.1).
        if obj.status != "pending":
            return None
        due = (obj.created_at or obj.updated_at) + timedelta(hours=24)
        return due.isoformat()

    def get_price(self, obj):
        if not obj.price_detail:
            return None
        return PriceDetailOutputSchema().dump(obj.price_detail)

    def get_payment_status(self, obj):
        latest = obj.payments[0] if obj.payments else None
        return latest.status if latest else "pending"

    def get_cancellation(self, obj):
        if not obj.cancellation:
            return None
        return CancellationOutputSchema().dump(obj.cancellation)

    def get_dispute(self, obj):
        ticket = next(
            (t for t in obj.support_tickets if t.category == "booking_dispute"), None
        )
        if not ticket:
            return None
        return DisputeOutputSchema().dump(ticket)


class BookingDetailSchema(BookingListItemSchema):
    """Currently identical to the list item — kept as its own class so
    detail-only fields can be added later without touching the list shape."""
    pass