"""Chat session service — CRUD for resume builder conversation state."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import ChatSession


async def get_active_session(db: AsyncSession, user_id: str) -> ChatSession | None:
    """Get the user's most recent active resume_creation session."""
    result = await db.execute(
        select(ChatSession)
        .where(
            ChatSession.user_id == user_id,
            ChatSession.session_type == "resume_creation",
        )
        .order_by(ChatSession.last_active_at.desc())
    )
    return result.scalars().first()


async def save_session(
    db: AsyncSession,
    user_id: str,
    messages: list,
    agent_state: dict,
    collected_data: dict,
    session_id: str | None = None,
) -> ChatSession:
    """Save or update a chat session."""
    if session_id:
        # Update existing session
        result = await db.execute(
            select(ChatSession).where(
                ChatSession.id == session_id,
                ChatSession.user_id == user_id,
            )
        )
        session = result.scalar_one_or_none()
        if session:
            session.messages = messages
            session.agent_state = agent_state
            session.collected_data = collected_data
            session.last_active_at = datetime.now(timezone.utc)
            await db.commit()
            await db.refresh(session)
            return session

    # Create new session
    session = ChatSession(
        id=str(uuid.uuid4()),
        user_id=user_id,
        session_type="resume_creation",
        messages=messages,
        agent_state=agent_state,
        collected_data=collected_data,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def delete_session(db: AsyncSession, user_id: str, session_id: str) -> bool:
    """Delete a chat session (e.g., after CV is finalized)."""
    result = await db.execute(
        select(ChatSession).where(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id,
        )
    )
    session = result.scalar_one_or_none()
    if session:
        await db.delete(session)
        await db.commit()
        return True
    return False
