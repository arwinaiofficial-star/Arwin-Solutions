"""Job application CRUD service — all tracked jobs stored in Neon Postgres."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select, delete, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import JobApplication


STATUS_PRIORITY = {
    "saved": 0,
    "applied": 1,
    "interview": 2,
    "offer": 3,
}


def _pick_status(current: str, incoming: str) -> str:
    if incoming not in STATUS_PRIORITY:
        return current
    if current not in STATUS_PRIORITY:
        return incoming
    return incoming if STATUS_PRIORITY[incoming] >= STATUS_PRIORITY[current] else current


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
    """Create or update a tracked job application for the same job."""

    job_url = data.get("job_url")
    title = data["job_title"]
    company = data["company"]

    query = select(JobApplication).where(JobApplication.user_id == user_id)
    if job_url:
        query = query.where(
            or_(
                JobApplication.job_url == job_url,
                (
                    (JobApplication.job_title == title) &
                    (JobApplication.company == company)
                ),
            )
        )
    else:
        query = query.where(
            JobApplication.job_title == title,
            JobApplication.company == company,
        )

    result = await db.execute(query.order_by(JobApplication.updated_at.desc()))
    existing = result.scalar_one_or_none()

    if existing:
        existing.location = data.get("location") or existing.location
        existing.job_url = job_url or existing.job_url
        existing.salary = data.get("salary") or existing.salary
        existing.source = data.get("source") or existing.source
        existing.notes = data.get("notes") or existing.notes

        incoming_description = data.get("description")
        if incoming_description and (
            not existing.description or len(incoming_description) > len(existing.description)
        ):
            existing.description = incoming_description

        incoming_status = data.get("status", existing.status)
        existing.status = _pick_status(existing.status, incoming_status)
        existing.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(existing)
        return existing

    app = JobApplication(
        id=str(uuid.uuid4()),
        user_id=user_id,
        job_title=title,
        company=company,
        location=data.get("location"),
        job_url=job_url,
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
