"""Add billing_documents and billing_counters tables

Revision ID: 005
Revises: 004
Create Date: 2026-06-07
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Billing documents table
    op.create_table(
        "billing_documents",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("document_number", sa.String(20), unique=True, nullable=False),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="draft"),
        # Client
        sa.Column("client_name", sa.String(255), nullable=False),
        sa.Column("client_company", sa.String(255), nullable=False, server_default=""),
        sa.Column("client_address", sa.Text(), nullable=False, server_default=""),
        sa.Column("client_email", sa.String(255), nullable=False, server_default=""),
        sa.Column("client_phone", sa.String(50), nullable=False, server_default=""),
        # Project
        sa.Column("project_name", sa.String(500), nullable=False, server_default=""),
        sa.Column("project_description", sa.Text(), nullable=False, server_default=""),
        # Items (JSONB array)
        sa.Column("items", postgresql.JSONB(), nullable=False, server_default="[]"),
        # Financials
        sa.Column("subtotal", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("discount_type", sa.String(20), nullable=False, server_default="percentage"),
        sa.Column("discount_value", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("discount_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("total", sa.Numeric(12, 2), nullable=False, server_default="0"),
        # Terms
        sa.Column("notes", sa.Text(), nullable=False, server_default=""),
        sa.Column("terms", sa.Text(), nullable=False, server_default=""),
        sa.Column("valid_until", sa.String(20), nullable=False, server_default=""),
        sa.Column("due_date", sa.String(20), nullable=False, server_default=""),
        # Credit Note / Receipt specifics
        sa.Column("reference_document", sa.String(50), nullable=False, server_default=""),
        sa.Column("payment_method", sa.String(50), nullable=False, server_default=""),
        sa.Column("transaction_ref", sa.String(100), nullable=False, server_default=""),
        # Dates
        sa.Column("issued_date", sa.String(20), nullable=False),
        sa.Column(
            "created_at",
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
    )
    op.create_index("ix_billing_documents_document_number", "billing_documents", ["document_number"])
    op.create_index("ix_billing_documents_type", "billing_documents", ["type"])
    op.create_index("ix_billing_documents_status", "billing_documents", ["status"])

    # Billing counters table (for auto-increment doc numbers)
    op.create_table(
        "billing_counters",
        sa.Column("prefix", sa.String(10), primary_key=True),
        sa.Column("current_value", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_table("billing_counters")
    op.drop_index("ix_billing_documents_status", table_name="billing_documents")
    op.drop_index("ix_billing_documents_type", table_name="billing_documents")
    op.drop_index("ix_billing_documents_document_number", table_name="billing_documents")
    op.drop_table("billing_documents")
