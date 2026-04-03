"""Social authentication API endpoint (Google + LinkedIn OAuth)."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, hash_password
from app.core.config import settings
from app.models.user import User, Resume
from app.schemas.auth import TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Social Authentication"])


class SocialAuthRequest(BaseModel):
    provider: str  # "google" or "linkedin"
    email: EmailStr
    name: str
    provider_id: str  # ID from the OAuth provider
    image: str | None = None


@router.post("/social", response_model=dict)
async def social_login(
    data: SocialAuthRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate via social provider. Creates account if new user."""
    is_new_user = False
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if user:
        # Existing user — update last login
        user.last_login = datetime.now(timezone.utc)
        if not user.name or user.name.strip() == "":
            user.name = data.name
        await db.flush()
    else:
        # New user — create account with a random password
        # (social users don't need a password, but field is required)
        import secrets
        is_new_user = True
        user = User(
            email=data.email,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
            name=data.name,
        )
        db.add(user)
        await db.flush()

    # Generate tokens
    access_token = create_access_token(user.id, user.email)
    refresh_token = create_refresh_token(user.id)
    tokens = TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    # Build user response with resume status
    resume_result = await db.execute(
        select(Resume).where(Resume.user_id == user.id, Resume.status == "final")
    )
    has_resume = resume_result.scalar_one_or_none() is not None

    user_response = UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        phone=user.phone,
        location=user.location,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at,
        last_login=user.last_login,
        has_resume=has_resume,
    )

    return {
        "user": user_response.model_dump(),
        "tokens": tokens.model_dump(),
        "is_new_user": is_new_user,
    }
