"""Billing document database models."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Text, Numeric, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class BillingDocument(Base):
    __tablename__ = "billing_documents"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    document_number: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(
        String(20), nullable=False, index=True
    )  # quotation, proforma, invoice, credit_note, receipt
    status: Mapped[str] = mapped_column(
        String(20), default="draft", nullable=False, index=True
    )  # draft, sent, paid, cancelled, void

    # Client
    client_name: Mapped[str] = mapped_column(String(255), nullable=False)
    client_company: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    client_address: Mapped[str] = mapped_column(Text, default="", nullable=False)
    client_email: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    client_phone: Mapped[str] = mapped_column(String(50), default="", nullable=False)

    # Project
    project_name: Mapped[str] = mapped_column(String(500), default="", nullable=False)
    project_description: Mapped[str] = mapped_column(Text, default="", nullable=False)

    # Line items stored as JSONB array
    items: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    # Financials
    subtotal: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    discount_type: Mapped[str] = mapped_column(
        String(20), default="percentage", nullable=False
    )  # percentage, flat
    discount_value: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    discount_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    total: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)

    # Terms
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    terms: Mapped[str] = mapped_column(Text, default="", nullable=False)
    valid_until: Mapped[str] = mapped_column(String(20), default="", nullable=False)
    due_date: Mapped[str] = mapped_column(String(20), default="", nullable=False)

    # Credit Note / Receipt specifics
    reference_document: Mapped[str] = mapped_column(String(50), default="", nullable=False)
    payment_method: Mapped[str] = mapped_column(String(50), default="", nullable=False)
    transaction_ref: Mapped[str] = mapped_column(String(100), default="", nullable=False)

    # Dates
    issued_date: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class BillingCounter(Base):
    """Tracks auto-incrementing document numbers per type prefix."""
    __tablename__ = "billing_counters"

    prefix: Mapped[str] = mapped_column(String(10), primary_key=True)
    current_value: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
