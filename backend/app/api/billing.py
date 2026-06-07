"""Billing document CRUD API endpoints — internal admin tool."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.billing import (
    BillingDocumentCreate,
    BillingDocumentUpdate,
    BillingDocumentResponse,
)
from app.services import billing_service as svc

router = APIRouter(prefix="/billing", tags=["Billing"])


@router.get("", response_model=list[BillingDocumentResponse])
async def list_documents(
    type: str | None = Query(None, description="Filter by document type"),
    status: str | None = Query(None, description="Filter by status"),
    search: str | None = Query(None, description="Search by number, client, or project"),
    db: AsyncSession = Depends(get_db),
):
    """List all billing documents with optional filters."""
    docs = await svc.list_documents(db, doc_type=type, status=status, search=search)
    return docs


@router.get("/{doc_id}", response_model=BillingDocumentResponse)
async def get_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a single billing document by ID."""
    doc = await svc.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.post("", response_model=BillingDocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    data: BillingDocumentCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new billing document with auto-generated number."""
    doc = await svc.create_document(db, data.model_dump())
    return doc


@router.patch("/{doc_id}", response_model=BillingDocumentResponse)
async def update_document(
    doc_id: str,
    data: BillingDocumentUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a billing document."""
    doc = await svc.update_document(db, doc_id, data.model_dump(exclude_none=True))
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a billing document."""
    deleted = await svc.delete_document(db, doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found")


@router.post("/{doc_id}/duplicate", response_model=BillingDocumentResponse, status_code=status.HTTP_201_CREATED)
async def duplicate_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Duplicate an existing document with a new number and draft status."""
    doc = await svc.duplicate_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Original document not found")
    return doc
