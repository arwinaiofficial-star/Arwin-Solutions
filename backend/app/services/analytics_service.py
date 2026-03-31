"""Analytics event persistence for JobReady platform activity."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import AnalyticsEvent


async def record_event(
    db: AsyncSession,
    user_id: str,
    name: str,
    properties: dict,
) -> AnalyticsEvent:
    """Persist a product analytics event."""
    event = AnalyticsEvent(
        id=str(uuid.uuid4()),
        user_id=user_id,
        name=name,
        properties=properties,
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event
