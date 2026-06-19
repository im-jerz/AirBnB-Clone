"""Add host_badges table for badge/tier system

Revision ID: 007
Revises: 006
Create Date: 2026-06-19
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "007"
down_revision: Union[str, None] = "006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "host_badges",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("host_id", sa.String(36), nullable=False, index=True),
        sa.Column("badge", sa.String(50), nullable=False),
        sa.Column("assigned_by", sa.String(36), sa.ForeignKey("admin_users.id"), nullable=False),
        sa.Column("assigned_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_host_badges_host_id", "host_badges", ["host_id"])
    op.create_index("ix_host_badges_badge", "host_badges", ["badge"])


def downgrade() -> None:
    op.drop_index("ix_host_badges_badge", table_name="host_badges")
    op.drop_index("ix_host_badges_host_id", table_name="host_badges")
    op.drop_table("host_badges")
