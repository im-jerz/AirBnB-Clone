from flask import Blueprint

bookings_bp = Blueprint("bookings", __name__, url_prefix="/api/host/bookings")

from app.blueprints.bookings import routes