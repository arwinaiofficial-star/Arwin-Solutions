"""Redis connection and caching utilities."""

import json
from typing import Any

import redis.asyncio as redis

from app.core.config import settings

redis_client: redis.Redis | None = None


async def get_redis() -> redis.Redis:
    """Get the Redis client instance."""
    global redis_client
    if redis_client is None:
        redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return redis_client


async def close_redis() -> None:
    """Close the Redis connection."""
    global redis_client
    if redis_client is not None:
        await redis_client.close()
        redis_client = None


async def cache_get(key: str) -> Any | None:
    """Get a value from Redis cache."""
    client = await get_redis()
    value = await client.get(key)
    if value is not None:
        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return value
    return None


async def cache_set(key: str, value: Any, ttl_seconds: int = 3600) -> None:
    """Set a value in Redis cache with TTL."""
    client = await get_redis()
    if isinstance(value, (dict, list)):
        value = json.dumps(value)
    await client.set(key, value, ex=ttl_seconds)


async def cache_delete(key: str) -> None:
    """Delete a key from Redis cache."""
    client = await get_redis()
    await client.delete(key)


async def rate_limit_check(key: str, max_requests: int, window_seconds: int = 60) -> bool:
    """Check if a request is within rate limits. Returns True if allowed."""
    client = await get_redis()
    current = await client.incr(key)
    if current == 1:
        await client.expire(key, window_seconds)
    return current <= max_requests
