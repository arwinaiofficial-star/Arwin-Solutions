"""Database connection and session management."""

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

import ssl as _ssl
from urllib.parse import urlparse, urlunparse

# Normalize DATABASE_URL for asyncpg
# Render provides postgresql:// with query params (sslmode, channel_binding)
# that asyncpg doesn't support. Strip them and pass SSL via connect_args.
_raw_url = settings.DATABASE_URL

# Parse and remove all query parameters
_parsed = urlparse(_raw_url)
_clean_url = urlunparse(_parsed._replace(query=""))

# Ensure asyncpg driver prefix
if _clean_url.startswith("postgresql://"):
    _clean_url = _clean_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Detect if SSL was requested in the original URL
_needs_ssl = "sslmode=" in _raw_url or "ssl=" in _raw_url or ".neon.tech" in _raw_url or ".render.com" in _raw_url

_connect_args = {}
if _needs_ssl:
    _ssl_ctx = _ssl.create_default_context()
    _ssl_ctx.check_hostname = False
    _ssl_ctx.verify_mode = _ssl.CERT_NONE
    _connect_args["ssl"] = _ssl_ctx

engine = create_async_engine(
    _clean_url,
    echo=settings.DATABASE_ECHO,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    connect_args=_connect_args,
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    """Dependency that provides a database session."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
