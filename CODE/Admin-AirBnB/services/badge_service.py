from sqlalchemy.orm import Session

from models.host_badge import HostBadge

BADGE_OPTIONS = [
    "Superhost",
    "Rising Star",
    "Premium Host",
    "Top Rated",
    "Verified",
    "Featured",
]


def get_host_badges(db: Session, host_id: str) -> list[HostBadge]:
    return db.query(HostBadge).filter(HostBadge.host_id == host_id).order_by(HostBadge.assigned_at.desc()).all()


def assign_badge(db: Session, host_id: str, badge: str, admin_id: str) -> HostBadge | None:
    existing = db.query(HostBadge).filter(HostBadge.host_id == host_id, HostBadge.badge == badge).first()
    if existing:
        return None
    entry = HostBadge(host_id=host_id, badge=badge, assigned_by=admin_id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def remove_badge(db: Session, badge_id: str) -> bool:
    badge = db.query(HostBadge).filter(HostBadge.id == badge_id).first()
    if badge:
        db.delete(badge)
        db.commit()
        return True
    return False
