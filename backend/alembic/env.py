"""Alembic migration environment."""

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings
from app.core.database import Base
from app.models.user import User, Resume, ChatSession, JobCache  # noqa: F401

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

import ssl as _ssl
from urllib.parse import urlparse, urlunparse

# Normalize the database URL for both sync and async usage
# Render provides postgresql:// with query params (sslmode, channel_binding)
# that asyncpg doesn't support.
_raw_url = settings.DATABASE_URL

# Parse and remove all query parameters
_parsed = urlparse(_raw_url)
_clean_url = urlunparse(_parsed._replace(query=""))

# For offline/sync: use plain postgresql://
_sync_url = _clean_url.replace("postgresql+asyncpg://", "postgresql://")
if not _sync_url.startswith("postgresql://"):
    _sync_url = _clean_url

# For online/async: use postgresql+asyncpg://
_async_url = _clean_url.replace("postgresql://", "postgresql+asyncpg://")
if not _async_url.startswith("postgresql+asyncpg://"):
    _async_url = _clean_url

# SSL config for asyncpg (passed via connect_args, not URL)
_needs_ssl = "sslmode=" in _raw_url or "ssl=" in _raw_url or ".neon.tech" in _raw_url or ".render.com" in _raw_url
_connect_args = {}
if _needs_ssl:
    _ssl_ctx = _ssl.create_default_context()
    _ssl_ctx.check_hostname = False
    _ssl_ctx.verify_mode = _ssl.CERT_NONE
    _connect_args["ssl"] = _ssl_ctx

config.set_main_option("sqlalchemy.url", _sync_url)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations():
    """Run migrations in async mode."""
    connectable = create_async_engine(
        _async_url,
        poolclass=pool.NullPool,
        connect_args=_connect_args,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
