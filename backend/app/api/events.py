from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_id
from app.core.database import get_db
from app.schemas.platform import AnalyticsEventRequest, AnalyticsEventResponse
from app.services import analytics_service

router = APIRouter(prefix="/events", tags=["Events"])


@router.post("", response_model=AnalyticsEventResponse, status_code=status.HTTP_202_ACCEPTED)
async def capture_event(
    data: AnalyticsEventRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    event = await analytics_service.record_event(
        db=db,
        user_id=user_id,
        name=data.name,
        properties=data.properties,
    )
    return {
        "accepted": True,
        "event_id": event.id,
        "recorded_at": event.created_at.isoformat(),
    }
