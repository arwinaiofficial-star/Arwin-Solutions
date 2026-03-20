"""API dependencies for dependency injection."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.core.redis import rate_limit_check
from app.core.config import settings

security = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """Extract and validate user ID from JWT token."""
    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload["sub"]


async def check_rate_limit(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> None:
    """Rate limit check per user."""
    payload = decode_token(credentials.credentials)
    if not payload:
        return
    user_id = payload.get("sub", "anonymous")
    allowed = await rate_limit_check(
        f"rate_limit:{user_id}",
        max_requests=settings.RATE_LIMIT_REQUESTS_PER_MINUTE,
        window_seconds=60,
    )
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
        )
