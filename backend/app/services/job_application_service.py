"""Job application CRUD service — all tracked jobs stored in Neon Postgres."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import JobApplication


async def list_applications(
    db: AsyncSession,
    user_id: str,
    status: str | None = None,
) -> list[JobApplication]:
    """List all job applications for a user, optionally filtered by status."""
    query = select(JobApplication).where(JobApplication.user_id == user_id)
    if status:
        query = query.where(JobApplication.status == status)
    query = query.order_by(JobApplication.updated_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_application(
    db: AsyncSession, user_id: str, app_id: str
) -> JobApplication | None:
    """Get a single job application by ID (scoped to user)."""
    result = await db.execute(
        select(JobApplication).where(
            JobApplication.id == app_id,
            JobApplication.user_id == user_id,
        )
    )
    return result.scalar_one_or_none()


async def create_application(
    db: AsyncSession,
    user_id: str,
    data: dict,
) -> JobApplication:
    """Create a new tracked job application."""
    app = JobApplication(
        id=str(uuid.uuid4()),
        user_id=user_id,
        job_title=data["job_title"],
        company=data["company"],
        location=data.get("location"),
        job_url=data.get("job_url"),
        salary=data.get("salary"),
        source=data.get("source"),
        status=data.get("status", "saved"),
        notes=data.get("notes"),
        description=data.get("description"),
    )
    db.add(app)
    await db.commit()
    await db.refresh(app)
    return app


async def update_application(
    db: AsyncSession,
    user_id: str,
    app_id: str,
    updates: dict,
) -> JobApplication | None:
    """Update a job application's status, notes, etc."""
    result = await db.execute(
        select(JobApplication).where(
            JobApplication.id == app_id,
            JobApplication.user_id == user_id,
        )
    )
    app = result.scalar_one_or_none()
    if not app:
        return None

    for field in ("status", "notes", "job_url", "salary"):
        if field in updates and updates[field] is not None:
            setattr(app, field, updates[field])

    app.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(app)
    return app


async def delete_application(
    db: AsyncSession, user_id: str, app_id: str
) -> bool:
    """Delete a job application. Returns True if deleted."""
    result = await db.execute(
        delete(JobApplication).where(
            JobApplication.id == app_id,
            JobApplication.user_id == user_id,
        )
    )
    await db.commit()
    return result.rowcount > 0
