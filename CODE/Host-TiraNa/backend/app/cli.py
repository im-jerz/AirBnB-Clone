"""
Flask CLI commands.

Registered from the app factory (see app/__init__.py). Run with:

    docker compose exec backend flask seed-bookings

Seeds one demo host + property (reused if they already exist) and a
realistic spread of bookings covering every status the frontend's
Bookings page renders (pending, confirmed, in_progress, completed,
cancelled, declined, disputed) — written straight into BOOKINGS,
BOOKING_PRICE_DETAILS, BOOKING_CANCELLATIONS, PAYMENTS, and
SUPPORT_TICKETS, not a JSON/mock file.
"""

import click
from datetime import datetime, timedelta, date

from app.extensions import db, bcrypt
from app.models.host import Host, HostProfile
from app.models.property import Property, PropertyLocation, PropertyImage
from app.models.booking import Booking, BookingPriceDetail, BookingCancellation, Payment, SupportTicket

DEMO_HOST_EMAIL = "demo.host@tirana.test"
DEMO_HOST_PASSWORD = "DemoHost123!"

DEMO_GUESTS = [
    {"guest_external_id": "g-2031", "guest_email": "andrea.villaroman@gmail.com"},
    {"guest_external_id": "g-1187", "guest_email": "marco.bv@yahoo.com"},
    {"guest_external_id": "g-0552", "guest_email": "pia.hernandez@gmail.com"},
    {"guest_external_id": "g-0881", "guest_email": "renz.cabrera@outlook.com"},
    {"guest_external_id": "g-0420", "guest_email": "joaquin.reyes@gmail.com"},
    {"guest_external_id": "g-0177", "guest_email": "liza.montemayor@gmail.com"},
    {"guest_external_id": "g-0099", "guest_email": "ferdz.aquino@gmail.com"},
    {"guest_external_id": "g-0044", "guest_email": "diego.salonga@gmail.com"},
]


def _get_or_create_demo_host():
    host = Host.query.filter_by(email=DEMO_HOST_EMAIL).first()
    if host:
        return host

    host = Host(
        email=DEMO_HOST_EMAIL,
        password_hash=bcrypt.generate_password_hash(DEMO_HOST_PASSWORD).decode("utf-8"),
        status="active",
        email_verified=1,
    )
    db.session.add(host)
    db.session.flush()

    db.session.add(
        HostProfile(host_id=host.id, full_name="Demo Host", phone="+63 917 000 0000", is_superhost=1)
    )
    return host


def _get_or_create_demo_properties(host_id):
    existing = Property.query.filter_by(host_id=host_id).all()
    if existing:
        return existing

    specs = [
        {
            "title": "Sea Breeze Cabin", "city": "Tagaytay", "province": "Cavite",
            "base_price": 3200, "cleaning_fee": 400, "max_guests": 4,
            "photo": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=900&auto=format&fit=crop",
        },
        {
            "title": "Old Manila Heritage Loft", "city": "Manila", "province": "Metro Manila",
            "base_price": 2750, "cleaning_fee": 300, "max_guests": 2,
            "photo": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=900&auto=format&fit=crop",
        },
        {
            "title": "Coron Cliffside Bungalow", "city": "Coron", "province": "Palawan",
            "base_price": 4800, "cleaning_fee": 500, "max_guests": 5,
            "photo": "https://images.unsplash.com/photo-1518733057094-95b53143d2a7?q=80&w=900&auto=format&fit=crop",
        },
    ]

    properties = []
    for spec in specs:
        prop = Property(
            host_id=host_id,
            title=spec["title"],
            description=f"A lovely stay in {spec['city']}, perfect for your next getaway.",
            property_type="entire_place",
            category="house",
            status="active",
            max_guests=spec["max_guests"],
            bedrooms=2,
            beds=2,
            bathrooms=1,
            base_price=spec["base_price"],
            cleaning_fee=spec["cleaning_fee"],
            min_nights=1,
            max_nights=30,
            cancellation_policy="moderate",
        )
        db.session.add(prop)
        db.session.flush()

        db.session.add(
            PropertyLocation(property_id=prop.id, city=spec["city"], province=spec["province"], country="Philippines")
        )
        db.session.add(
            PropertyImage(property_id=prop.id, image_url=spec["photo"], display_order=0, is_cover=1)
        )
        properties.append(prop)

    return properties


def _make_price_detail(booking_id, base_price, nights, cleaning_fee, commission_rate=12):
    base_price = float(base_price)
    cleaning_fee = float(cleaning_fee)
    service_fee = round(base_price * nights * 0.05, 2)
    subtotal = base_price * nights + cleaning_fee + service_fee
    commission_amount = round(subtotal * (commission_rate / 100), 2)
    total_price = round(subtotal, 2)
    host_payout = round(total_price - commission_amount, 2)

    return BookingPriceDetail(
        booking_id=booking_id,
        base_price=base_price,
        nights=nights,
        cleaning_fee=cleaning_fee,
        service_fee=service_fee,
        commission_rate=commission_rate,
        commission_amount=commission_amount,
        total_price=total_price,
        host_payout=host_payout,
    )


def _seed_bookings(host, properties):
    if Booking.query.filter_by(host_id=host.id).first():
        return 0

    today = date.today()
    guests = iter(DEMO_GUESTS)
    created = 0

    def next_guest():
        nonlocal guests
        try:
            return next(guests)
        except StopIteration:
            guests = iter(DEMO_GUESTS)
            return next(guests)

    plan = [
        # (property_index, status, check_in_offset_days, nights, guests_count)
        (0, "pending", 4, 3, 3),
        (1, "pending", 1, 2, 2),
        (2, "confirmed", 9, 5, 4),
        (0, "in_progress", -1, 3, 4),
        (1, "completed", -40, 2, 1),
        (2, "completed", -52, 5, 3),
        (0, "cancelled", -7, 2, 4),
        (1, "declined", -27, 2, 1),
        (2, "disputed", -50, 5, 3),
    ]

    for prop_idx, status, offset, nights, guests_count in plan:
        prop = properties[prop_idx]
        guest = next_guest()
        check_in = today + timedelta(days=offset)
        check_out = check_in + timedelta(days=nights)

        created_at = datetime.utcnow() - timedelta(days=max(0, -offset) + 2, hours=4)
        booking = Booking(
            property_id=prop.id,
            host_id=host.id,
            guest_external_id=guest["guest_external_id"],
            guest_email=guest["guest_email"],
            check_in=check_in,
            check_out=check_out,
            guests_count=guests_count,
            status=status,
            special_requests="Arriving a bit late, is late check-in okay?" if status == "pending" else "",
            created_at=created_at,
            updated_at=created_at,
        )
        db.session.add(booking)
        db.session.flush()

        price = _make_price_detail(booking.id, prop.base_price, nights, prop.cleaning_fee)
        db.session.add(price)
        db.session.flush()

        if status in ("pending",):
            db.session.add(Payment(booking_id=booking.id, amount=0, status="pending"))
        elif status == "declined":
            db.session.add(Payment(booking_id=booking.id, amount=0, status="refunded"))
            db.session.add(
                BookingCancellation(
                    booking_id=booking.id, cancelled_by="host",
                    reason="Dates unavailable — property already blocked for maintenance",
                    refund_amount=0,
                    cancelled_at=created_at + timedelta(hours=6),
                )
            )
        elif status == "cancelled":
            db.session.add(Payment(booking_id=booking.id, amount=price.total_price, status="refunded"))
            db.session.add(
                BookingCancellation(
                    booking_id=booking.id, cancelled_by="host",
                    reason="Property damage / maintenance — A pipe burst and repairs won't finish before check-in.",
                    refund_amount=price.total_price,
                    cancelled_at=created_at + timedelta(days=1),
                )
            )
        elif status == "disputed":
            db.session.add(Payment(booking_id=booking.id, amount=price.total_price, status="paid", paid_at=created_at))
            db.session.add(
                SupportTicket(
                    host_id=host.id, booking_id=booking.id, category="booking_dispute",
                    description="Guest left the unit with significant damage to furniture and a missing speaker.",
                    status="in_review",
                )
            )
        else:
            db.session.add(Payment(booking_id=booking.id, amount=price.total_price, status="paid", paid_at=created_at))

        created += 1

    return created


def register_cli(app):
    @app.cli.command("seed-bookings")
    def seed_bookings():
        """Seed a demo host, demo properties, and a full spread of bookings."""
        host = _get_or_create_demo_host()
        db.session.flush()
        properties = _get_or_create_demo_properties(host.id)
        db.session.flush()
        count = _seed_bookings(host, properties)
        db.session.commit()

        if count:
            click.echo(f"Seeded {count} bookings for {DEMO_HOST_EMAIL}.")
            click.echo(f"Log in with: {DEMO_HOST_EMAIL} / {DEMO_HOST_PASSWORD}")
        else:
            click.echo(f"{DEMO_HOST_EMAIL} already has bookings — nothing to do.")
            click.echo("Delete its BOOKINGS rows first if you want to reseed.")