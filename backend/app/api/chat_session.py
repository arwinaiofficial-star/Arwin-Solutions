"""Chat session API endpoints for auto-save / restore."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user_id
from app.services import chat_session_service

router = APIRouter(prefix="/chat", tags=["Chat Session"])


class SessionSaveRequest(BaseModel):
    session_id: str | None = None
    messages: list
    agent_state: dict
    collected_data: dict


@router.get("/session")
async def get_session(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get the user's active resume-creation session for restore."""
    session = await chat_session_service.get_active_session(db, user_id)
    if not session:
        return {"session": None}
    return {
        "session": {
            "id": session.id,
            "messages": session.messages,
            "agent_state": session.agent_state,
            "collected_data": session.collected_data,
            "last_active_at": session.last_active_at.isoformat(),
        }
    }


@router.post("/session")
async def save_session(
    data: SessionSaveRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Save or update the user's chat session (auto-save)."""
    session = await chat_session_service.save_session(
        db=db,
        user_id=user_id,
        messages=data.messages,
        agent_state=data.agent_state,
        collected_data=data.collected_data,
        session_id=data.session_id,
    )
    return {
        "id": session.id,
        "last_active_at": session.last_active_at.isoformat(),
    }


@router.delete("/session/{session_id}")
async def delete_session(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Delete a chat session (after CV is finalized)."""
    deleted = await chat_session_service.delete_session(db, user_id, session_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    return {"deleted": True}
