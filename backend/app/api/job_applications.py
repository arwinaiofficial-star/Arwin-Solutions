"""Job application CRUD API endpoints — replaces all localStorage usage."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user_id
from app.schemas.job_application import (
    JobApplicationCreate,
    JobApplicationUpdate,
    JobApplicationResponse,
)
from app.services import job_application_service as svc

router = APIRouter(prefix="/applications", tags=["Job Applications"])


@router.get("", response_model=list[JobApplicationResponse])
async def list_applications(
    status: str | None = Query(None, description="Filter by status"),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List all tracked job applications for the current user."""
    apps = await svc.list_applications(db, user_id, status=status)
    return apps


@router.post("", response_model=JobApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    data: JobApplicationCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Track a new job application."""
    app = await svc.create_application(db, user_id, data.model_dump())
    return app


@router.patch("/{app_id}", response_model=JobApplicationResponse)
async def update_application(
    app_id: str,
    data: JobApplicationUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Update a tracked job application (status, notes, etc.)."""
    app = await svc.update_application(
        db, user_id, app_id, data.model_dump(exclude_none=True)
    )
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    app_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Remove a tracked job application."""
    deleted = await svc.delete_application(db, user_id, app_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Application not found")
