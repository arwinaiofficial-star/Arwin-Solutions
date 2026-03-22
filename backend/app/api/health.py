"""Health check endpoint."""

import time
from datetime import datetime, timezone

from fastapi import APIRouter
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine
from app.core.redis import get_redis

router = APIRouter(tags=["Health"])
_start_time = time.time()


@router.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    """Health check with service status."""
    checks = {}

    # Database check
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        checks["database"] = "healthy"
    except Exception as e:
        checks["database"] = f"unhealthy: {str(e)}"

    # Redis check
    try:
        client = await get_redis()
        await client.ping()
        checks["redis"] = "healthy"
    except Exception as e:
        checks["redis"] = f"unhealthy: {str(e)}"

    all_healthy = all(v == "healthy" for v in checks.values())

    return {
        "status": "healthy" if all_healthy else "degraded",
        "version": settings.APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime_seconds": round(time.time() - _start_time, 2),
        "checks": checks,
    }
