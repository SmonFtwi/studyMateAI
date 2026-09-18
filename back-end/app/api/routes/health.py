from fastapi import APIRouter, Response, status
from sqlalchemy import text

from app.api.dependencies import DbSession

router = APIRouter(tags=["health"])


@router.get("/")
async def root() -> dict:
    return {"service": "StudyMate AI API", "status": "running"}


@router.get("/health/live")
async def liveness() -> dict:
    return {"status": "ok"}


@router.get("/health/ready")
async def readiness(db: DbSession, response: Response) -> dict:
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "ok"}
    except Exception:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "not_ready", "database": "unavailable"}

