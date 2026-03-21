"""Add job_applications table

Revision ID: 002
Revises: 001
Create Date: 2026-03-21
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "job_applications",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("job_title", sa.String(500), nullable=False),
        sa.Column("company", sa.String(255), nullable=False),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("job_url", sa.String(1000), nullable=True),
        sa.Column("salary", sa.String(255), nullable=True),
        sa.Column("source", sa.String(50), nullable=True),
        sa.Column("status", sa.String(30), default="pending", nullable=False),
        sa.Column("resume_id", postgresql.UUID(as_uuid=False), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "applied_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["resume_id"], ["resumes.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_job_applications_user_id", "job_applications", ["user_id"])


def downgrade() -> None:
    op.drop_table("job_applications")
