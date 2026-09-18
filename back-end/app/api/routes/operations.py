import uuid
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Header, Response
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
from sqlalchemy import case, func, select

from app.api.dependencies import AdminUser, AppSettings, CurrentUser, DbSession
from app.core.errors import AuthenticationError, NotFoundError
from app.db.models import AuditLog, ChatRun, IntegrationJob

router = APIRouter(tags=["operations"])


@router.get("/metrics", include_in_schema=False)
async def prometheus_metrics(
    settings: AppSettings, authorization: str | None = Header(default=None)
) -> Response:
    if settings.metrics_bearer_token:
        expected = f"Bearer {settings.metrics_bearer_token}"
        if authorization != expected:
            raise AuthenticationError("Metrics token required")
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@router.get("/ops/metrics/summary")
async def metric_summary(
    db: DbSession, _admin: AdminUser, hours: int = 24
) -> dict:
    safe_hours = max(1, min(hours, 24 * 30))
    since = datetime.now(UTC) - timedelta(hours=safe_hours)
    statement = select(
        func.count(ChatRun.id),
        func.coalesce(func.percentile_cont(0.95).within_group(ChatRun.latency_ms), 0.0),
        func.coalesce(func.avg(ChatRun.estimated_cost_usd), 0.0),
        func.coalesce(func.avg(case((ChatRun.retrieval_hit.is_(True), 1.0), else_=0.0)), 0.0),
        func.coalesce(func.avg(case((ChatRun.grounded.is_(True), 1.0), else_=0.0)), 0.0),
    ).where(ChatRun.created_at >= since)
    count, p95, avg_cost, retrieval_hit_rate, grounded_rate = (
        await db.execute(statement)
    ).one()
    return {
        "window_hours": safe_hours,
        "requests": count,
        "p95_latency_ms": round(float(p95), 2),
        "cost_per_request_usd": round(float(avg_cost), 8),
        "retrieval_hit_rate": round(float(retrieval_hit_rate), 4),
        "grounded_answer_pass_rate": round(float(grounded_rate), 4),
    }


@router.get("/integrations/document-processing/{job_id}")
async def document_job(job_id: uuid.UUID, db: DbSession, user: CurrentUser) -> dict:
    job = await db.scalar(
        select(IntegrationJob).where(
            IntegrationJob.id == job_id, IntegrationJob.user_id == user.id
        )
    )
    if job is None:
        raise NotFoundError("Document processing job not found")
    return {
        "id": str(job.id),
        "integration": job.integration,
        "document_id": str(job.document_id),
        "project_id": str(job.project_id),
        "status": job.status.value,
        "attempts": job.attempts,
        "last_error": job.last_error,
        "created_at": job.created_at.isoformat(),
        "updated_at": job.updated_at.isoformat(),
    }


@router.get("/audit-logs")
async def audit_logs(db: DbSession, user: CurrentUser, limit: int = 100) -> dict:
    entries = (
        await db.scalars(
            select(AuditLog)
            .where(AuditLog.actor_id == user.id)
            .order_by(AuditLog.created_at.desc())
            .limit(max(1, min(limit, 500)))
        )
    ).all()
    return {
        "audit_logs": [
            {
                "id": str(entry.id),
                "action": entry.action,
                "resource_type": entry.resource_type,
                "resource_id": entry.resource_id,
                "outcome": entry.outcome,
                "details": entry.details,
                "request_id": entry.request_id,
                "created_at": entry.created_at.isoformat(),
            }
            for entry in entries
        ]
    }

