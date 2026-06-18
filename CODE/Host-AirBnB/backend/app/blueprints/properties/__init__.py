from flask import Blueprint

properties_bp = Blueprint("properties", __name__, url_prefix="/api/host/properties")

# Imported at the bottom so route decorators register against
# properties_bp above without causing a circular import.
from app.blueprints.properties import routes  # noqa: E402,F401
