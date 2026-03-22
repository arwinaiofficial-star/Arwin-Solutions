"""Authentication service handling user registration, login, and token management."""

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User, Resume
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, data: RegisterRequest) -> tuple[UserResponse, TokenResponse]:
        """Register a new user and return user + tokens."""
        # Check if email already exists
        result = await self.db.execute(
            select(User).where(User.email == data.email)
        )
        existing = result.scalar_one_or_none()
        if existing:
            raise ValueError("An account with this email already exists")

        # Create user
        user = User(
            email=data.email,
            hashed_password=hash_password(data.password),
            name=data.name,
        )
        self.db.add(user)
        await self.db.flush()

        # Generate tokens
        tokens = self._create_tokens(user)

        # Build response
        user_response = await self._build_user_response(user)
        return user_response, tokens

    async def login(self, data: LoginRequest) -> tuple[UserResponse, TokenResponse]:
        """Authenticate user and return user + tokens."""
        result = await self.db.execute(
            select(User).where(User.email == data.email)
        )
        user = result.scalar_one_or_none()

        if not user or not verify_password(data.password, user.hashed_password):
            raise ValueError("Invalid email or password")

        if not user.is_active:
            raise ValueError("Account is deactivated")

        # Update last login
        user.last_login = datetime.now(timezone.utc)
        await self.db.flush()

        tokens = self._create_tokens(user)
        user_response = await self._build_user_response(user)
        return user_response, tokens

    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        """Refresh access token using a valid refresh token."""
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise ValueError("Invalid or expired refresh token")

        user_id = payload["sub"]
        result = await self.db.execute(
            select(User).where(User.id == user_id, User.is_active == True)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise ValueError("User not found")

        return self._create_tokens(user)

    async def get_current_user(self, token: str) -> UserResponse:
        """Get current user from access token."""
        payload = decode_token(token)
        if not payload or payload.get("type") != "access":
            raise ValueError("Invalid or expired token")

        user_id = payload["sub"]
        result = await self.db.execute(
            select(User).where(User.id == user_id, User.is_active == True)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise ValueError("User not found")

        return await self._build_user_response(user)

    async def update_profile(
        self, user_id: str, name: str | None, phone: str | None, location: str | None
    ) -> UserResponse:
        """Update user profile fields."""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise ValueError("User not found")

        if name is not None:
            user.name = name
        if phone is not None:
            user.phone = phone
        if location is not None:
            user.location = location

        await self.db.flush()
        return await self._build_user_response(user)

    async def change_password(
        self, user_id: str, current_password: str, new_password: str
    ) -> None:
        """Change user password."""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise ValueError("User not found")

        if not verify_password(current_password, user.hashed_password):
            raise ValueError("Current password is incorrect")

        user.hashed_password = hash_password(new_password)
        await self.db.flush()

    def _create_tokens(self, user: User) -> TokenResponse:
        """Generate access and refresh tokens for a user."""
        access_token = create_access_token(user.id, user.email)
        refresh_token = create_refresh_token(user.id)
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def _build_user_response(self, user: User) -> UserResponse:
        """Build UserResponse with resume status.

        has_resume is true if the user has ANY resume (draft or final).
        This ensures returning users can restore their progress.
        """
        result = await self.db.execute(
            select(Resume).where(Resume.user_id == user.id)
        )
        has_resume = result.scalar_one_or_none() is not None

        return UserResponse(
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
