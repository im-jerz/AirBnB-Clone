"""
Bookings routes.

    GET  /api/host/bookings
    GET  /api/host/bookings/:id
    POST /api/host/bookings/:id/approve
    POST /api/host/bookings/:id/decline
    POST /api/host/bookings/:id/cancel
    POST /api/host/bookings/:id/dispute

Maps to flow.md Section 4 (Bookings: 4.1 Reservation Requests,
4.3 Active & Upcoming Bookings, 4.4 Booking Detail, 4.5 Host
Cancellation) and the "bookings" blueprint described in Section 10
(Backend Structure) of host_dashboard_design.md.
"""

from flask import request, g
from marshmallow import ValidationError

from app.blueprints.bookings import bookings_bp
from app.blueprints.bookings.schemas import (
    DeclineInputSchema,
    CancelInputSchema,
    DisputeInputSchema,
    BookingListItemSchema,
    BookingDetailSchema,
)
from app.middleware.auth_middleware import host_required
from app.services import booking_service
from app.services.booking_service import BookingError
from app.utils.response import success_response, error_response


@bookings_bp.route("", methods=["GET"])
@host_required
def list_bookings():
    status_filter = request.args.get("status")
    property_id = request.args.get("property_id")

    bookings = booking_service.list_bookings(g.current_host.id, status_filter, property_id)
    data = BookingListItemSchema(many=True).dump(bookings)

    return success_response(data={"bookings": data})


@bookings_bp.route("/<int:booking_id>", methods=["GET"])
@host_required
def get_booking(booking_id):
    try:
        booking = booking_service.get_booking_detail(booking_id, g.current_host.id)
    except BookingError as be:
        return error_response(be.message, status=be.status)

    return success_response(data={"booking": BookingDetailSchema().dump(booking)})


@bookings_bp.route("/<int:booking_id>/approve", methods=["POST"])
@host_required
def approve_booking(booking_id):
    try:
        booking = booking_service.approve_booking(booking_id, g.current_host.id)
    except BookingError as be:
        return error_response(be.message, status=be.status)

    return success_response(
        message="Booking confirmed. The guest has been notified.",
        data={"booking": BookingDetailSchema().dump(booking)},
    )


@bookings_bp.route("/<int:booking_id>/decline", methods=["POST"])
@host_required
def decline_booking(booking_id):
    schema = DeclineInputSchema()
    try:
        payload = schema.load(request.get_json() or {})
    except ValidationError as ve:
        return error_response("Validation failed.", errors=ve.messages, status=422)

    try:
        booking = booking_service.decline_booking(booking_id, g.current_host.id, payload["reason"])
    except BookingError as be:
        return error_response(be.message, status=be.status)

    return success_response(
        message="Request declined.",
        data={"booking": BookingDetailSchema().dump(booking)},
    )


@bookings_bp.route("/<int:booking_id>/cancel", methods=["POST"])
@host_required
def cancel_booking(booking_id):
    schema = CancelInputSchema()
    try:
        payload = schema.load(request.get_json() or {})
    except ValidationError as ve:
        return error_response("Validation failed.", errors=ve.messages, status=422)

    try:
        booking = booking_service.cancel_booking(
            booking_id, g.current_host.id, payload["reason_label"], payload.get("reason_detail", "")
        )
    except BookingError as be:
        return error_response(be.message, status=be.status)

    return success_response(
        message="Booking cancelled. Refund is being processed.",
        data={"booking": BookingDetailSchema().dump(booking)},
    )


@bookings_bp.route("/<int:booking_id>/dispute", methods=["POST"])
@host_required
def dispute_booking(booking_id):
    schema = DisputeInputSchema()
    try:
        payload = schema.load(request.get_json() or {})
    except ValidationError as ve:
        return error_response("Validation failed.", errors=ve.messages, status=422)

    try:
        booking = booking_service.dispute_booking(booking_id, g.current_host.id, payload["reason"])
    except BookingError as be:
        return error_response(be.message, status=be.status)

    return success_response(
        message="Dispute submitted. Our team will review it shortly.",
        data={"booking": BookingDetailSchema().dump(booking)},
    )