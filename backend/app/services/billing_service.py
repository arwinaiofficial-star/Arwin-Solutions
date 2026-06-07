"""Billing document CRUD service — all billing data stored in PostgreSQL."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.billing import BillingDocument, BillingCounter


# Document type → prefix mapping
TYPE_PREFIX = {
    "quotation": "QT",
    "proforma": "PI",
    "invoice": "INV",
    "credit_note": "CN",
    "receipt": "REC",
}


async def _next_document_number(db: AsyncSession, doc_type: str) -> str:
    """Generate the next sequential document number for a given type."""
    prefix = TYPE_PREFIX.get(doc_type, "DOC")

    result = await db.execute(
        select(BillingCounter).where(BillingCounter.prefix == prefix)
    )
    counter = result.scalar_one_or_none()

    if counter:
        counter.current_value += 1
    else:
        counter = BillingCounter(prefix=prefix, current_value=1)
        db.add(counter)

    await db.flush()
    return f"{prefix}-{str(counter.current_value).zfill(4)}"


async def list_documents(
    db: AsyncSession,
    doc_type: str | None = None,
    status: str | None = None,
    search: str | None = None,
) -> list[BillingDocument]:
    """List all billing documents with optional filters."""
    query = select(BillingDocument)

    if doc_type:
        query = query.where(BillingDocument.type == doc_type)
    if status:
        query = query.where(BillingDocument.status == status)
    if search:
        pattern = f"%{search}%"
        query = query.where(
            BillingDocument.document_number.ilike(pattern)
            | BillingDocument.client_name.ilike(pattern)
            | BillingDocument.client_company.ilike(pattern)
            | BillingDocument.project_name.ilike(pattern)
        )

    query = query.order_by(BillingDocument.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_document(db: AsyncSession, doc_id: str) -> BillingDocument | None:
    """Get a single billing document by ID."""
    result = await db.execute(
        select(BillingDocument).where(BillingDocument.id == doc_id)
    )
    return result.scalar_one_or_none()


async def create_document(
    db: AsyncSession, data: dict
) -> BillingDocument:
    """Create a new billing document with auto-generated number."""
    doc_type = data.get("type", "invoice")
    document_number = await _next_document_number(db, doc_type)

    # Convert items from Pydantic models to dicts if needed
    items = data.get("items", [])
    if items and hasattr(items[0], "model_dump"):
        items = [item.model_dump() for item in items]

    doc = BillingDocument(
        id=str(uuid.uuid4()),
        document_number=document_number,
        type=doc_type,
        status=data.get("status", "draft"),
        client_name=data.get("client_name", ""),
        client_company=data.get("client_company", ""),
        client_address=data.get("client_address", ""),
        client_email=data.get("client_email", ""),
        client_phone=data.get("client_phone", ""),
        project_name=data.get("project_name", ""),
        project_description=data.get("project_description", ""),
        items=items,
        subtotal=data.get("subtotal", 0),
        discount_type=data.get("discount_type", "percentage"),
        discount_value=data.get("discount_value", 0),
        discount_amount=data.get("discount_amount", 0),
        total=data.get("total", 0),
        notes=data.get("notes", ""),
        terms=data.get("terms", ""),
        valid_until=data.get("valid_until", ""),
        due_date=data.get("due_date", ""),
        reference_document=data.get("reference_document", ""),
        payment_method=data.get("payment_method", ""),
        transaction_ref=data.get("transaction_ref", ""),
        issued_date=data.get("issued_date", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
    )
    db.add(doc)
    await db.flush()
    await db.refresh(doc)
    return doc


async def update_document(
    db: AsyncSession, doc_id: str, updates: dict
) -> BillingDocument | None:
    """Update a billing document."""
    result = await db.execute(
        select(BillingDocument).where(BillingDocument.id == doc_id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        return None

    # Convert items from Pydantic models to dicts if needed
    if "items" in updates and updates["items"] is not None:
        items = updates["items"]
        if items and hasattr(items[0], "model_dump"):
            updates["items"] = [item.model_dump() for item in items]

    updatable_fields = [
        "status", "client_name", "client_company", "client_address",
        "client_email", "client_phone", "project_name", "project_description",
        "items", "subtotal", "discount_type", "discount_value",
        "discount_amount", "total", "notes", "terms", "valid_until",
        "due_date", "reference_document", "payment_method",
        "transaction_ref", "issued_date",
    ]

    for field in updatable_fields:
        if field in updates and updates[field] is not None:
            setattr(doc, field, updates[field])

    doc.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(doc)
    return doc


async def delete_document(db: AsyncSession, doc_id: str) -> bool:
    """Delete a billing document. Returns True if deleted."""
    result = await db.execute(
        delete(BillingDocument).where(BillingDocument.id == doc_id)
    )
    return result.rowcount > 0


async def duplicate_document(db: AsyncSession, doc_id: str) -> BillingDocument | None:
    """Duplicate an existing document with a new number and draft status."""
    original = await get_document(db, doc_id)
    if not original:
        return None

    data = {
        "type": original.type,
        "status": "draft",
        "client_name": original.client_name,
        "client_company": original.client_company,
        "client_address": original.client_address,
        "client_email": original.client_email,
        "client_phone": original.client_phone,
        "project_name": original.project_name,
        "project_description": original.project_description,
        "items": original.items,  # Already a list of dicts from JSONB
        "subtotal": float(original.subtotal),
        "discount_type": original.discount_type,
        "discount_value": float(original.discount_value),
        "discount_amount": float(original.discount_amount),
        "total": float(original.total),
        "notes": original.notes,
        "terms": original.terms,
        "valid_until": original.valid_until,
        "due_date": original.due_date,
        "reference_document": original.reference_document,
        "payment_method": original.payment_method,
        "transaction_ref": original.transaction_ref,
        "issued_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    }

    return await create_document(db, data)
