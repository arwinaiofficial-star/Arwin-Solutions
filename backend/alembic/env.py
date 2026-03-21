"""Alembic migration environment."""

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.core.config import settings
from app.core.database import Base
from app.models.user import User, Resume, ChatSession, JobCache  # noqa: F401

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Normalize the database URL
# Render provides postgresql:// but we need +asyncpg for async
_db_url = settings.DATABASE_URL

# For offline/sync: strip async driver
_sync_url = _db_url.replace("postgresql+asyncpg://", "postgresql://")
# For online/async: ensure async driver
_async_url = _db_url.replace("postgresql://", "postgresql+asyncpg://")
if not _async_url.startswith("postgresql+asyncpg://"):
    _async_url = _db_url  # leave as-is if already correct

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
    # Override the URL with the async version
    section = dict(config.get_section(config.config_ini_section, {}))
    section["sqlalchemy.url"] = _async_url

    connectable = async_engine_from_config(
        section,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
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
