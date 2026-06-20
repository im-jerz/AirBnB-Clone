import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class HostBadge(Base):
    __tablename__ = "host_badges"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    host_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    badge: Mapped[str] = mapped_column(String(50), nullable=False)
    assigned_by: Mapped[str] = mapped_column(String(36), ForeignKey("admin_users.id"), nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
