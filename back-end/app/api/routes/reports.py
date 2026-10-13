import asyncio
import json
import logging
import time
import uuid

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select

from app.api.dependencies import AppSettings, CurrentUser, DbSession
from app.api.routes.projects import _owned_project
from app.core.errors import NotFoundError, StudyMateError, ValidationError
from app.core.guardrails import inspect_query
from app.db.models import Report, ReportRun
from app.db.session import SessionFactory
from app.services.llm import OpenAIService
from app.services.reports import report_context, report_prompt, validate_report

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects", tags=["reports"])


class ReportRequest(BaseModel):
    source_ids: list[uuid.UUID] = Field(min_length=1, max_length=20)
    topic: str = Field(default="", max_length=1000)

    @field_validator("source_ids")
    @classmethod
    def unique_sources(cls, value):
        if len(set(value)) != len(value):
            raise ValueError("Choose each source only once")
        return value


def serialize(report, *, full=True):
    result = {
        "id": str(report.id),
        "title": report.title,
        "created_at": report.created_at.isoformat(),
        "topic": report.topic,
    }
    if full:
        result.update(
            content=report.content,
            sources=report.sources,
            coverage=report.coverage,
            selected_source_ids=report.selected_source_ids,
            usage=report.usage,
        )
    return result


@router.get("/{project_id}/reports")
async def list_reports(project_id: uuid.UUID, db: DbSession, user: CurrentUser):
    await _owned_project(db, project_id, user.id)
    rows = (
        await db.scalars(
            select(Report)
            .where(Report.project_id == project_id, Report.user_id == user.id)
            .order_by(Report.created_at.desc())
        )
    ).all()
    return {"reports": [serialize(row, full=False) for row in rows]}


async def owned_report(db, project_id, report_id, user_id):
    report = await db.scalar(
        select(Report).where(
            Report.id == report_id, Report.project_id == project_id, Report.user_id == user_id
        )
    )
    if report is None:
        raise NotFoundError("Report not found")
    return report


@router.get("/{project_id}/reports/{report_id}")
async def get_report(project_id: uuid.UUID, report_id: uuid.UUID, db: DbSession, user: CurrentUser):
    return {"report": serialize(await owned_report(db, project_id, report_id, user.id))}


@router.delete("/{project_id}/reports/{report_id}")
async def delete_report(
    project_id: uuid.UUID, report_id: uuid.UUID, db: DbSession, user: CurrentUser
):
    report = await owned_report(db, project_id, report_id, user.id)
    await db.delete(report)
    await db.commit()
    return {"message": "Report deleted"}


@router.post("/{project_id}/reports/generate/stream")
async def generate_report(
    project_id: uuid.UUID,
    payload: ReportRequest,
    db: DbSession,
    user: CurrentUser,
    settings: AppSettings,
):
    await _owned_project(db, project_id, user.id)
    user_id = user.id
    topic = payload.topic.strip()
    guard = inspect_query(topic or "Create an educational overview")
    if guard.blocked:
        raise ValidationError(
            "Please enter a study topic without instructions to override the rules."
        )
    if guard.requires_approval:
        raise ValidationError("This topic needs human review. Please use the chat review workflow.")

    async def events():
        queue = asyncio.Queue(maxsize=32)

        async def emit(kind, data):
            await queue.put((kind, data))

        async def produce():
            started = time.perf_counter()
            usage = {}
            outcome = "failed"
            llm = OpenAIService(settings)
            try:
                async with SessionFactory() as session:
                    context, sources, coverage = await report_context(
                        session,
                        project_id=project_id,
                        user_id=user_id,
                        source_ids=payload.source_ids,
                        topic=topic,
                        settings=settings,
                        llm=llm,
                    )
                await emit("sources", {"sources": sources, "coverage": coverage})

                async def delta(text):
                    await emit("delta", {"text": text})

                result = await llm.stream_text(
                    report_prompt(topic, context),
                    on_delta=delta,
                    operation="report_generation",
                    max_output_tokens=8192,
                )
                usage = {
                    "prompt_tokens": result.prompt_tokens,
                    "output_tokens": result.output_tokens,
                    "estimated_cost_usd": result.estimated_cost_usd,
                    "latency_ms": (time.perf_counter() - started) * 1000,
                }
                title = validate_report(result.text, sources)
                async with SessionFactory() as session:
                    report = Report(
                        project_id=project_id,
                        user_id=user_id,
                        title=title,
                        content=result.text,
                        topic=topic,
                        selected_source_ids=[str(v) for v in payload.source_ids],
                        sources=sources,
                        coverage=coverage,
                        usage=usage,
                    )
                    session.add(report)
                    session.add(
                        ReportRun(
                            project_id=project_id,
                            user_id=user_id,
                            status="completed",
                            latency_ms=usage["latency_ms"],
                            usage=usage,
                        )
                    )
                    await session.commit()
                    outcome = "completed"
                    await session.refresh(report)
                    await emit("completion", {"report": serialize(report)})
            except asyncio.CancelledError:
                if outcome != "completed":
                    outcome = "interrupted"
                raise
            except Exception as exc:
                logger.error("Report generation failed (%s)", type(exc).__name__)
                message = (
                    str(exc)
                    if isinstance(exc, StudyMateError)
                    else "Report generation was interrupted. Please try again."
                )
                await emit("error", {"message": message})
            finally:
                try:
                    if outcome != "completed":
                        async with SessionFactory() as session:
                            session.add(
                                ReportRun(
                                    project_id=project_id,
                                    user_id=user_id,
                                    status=outcome,
                                    latency_ms=(time.perf_counter() - started) * 1000,
                                    usage=usage,
                                )
                            )
                            await session.commit()
                finally:
                    await llm.close()

        task = asyncio.create_task(produce())
        try:
            while True:
                try:
                    kind, data = await asyncio.wait_for(queue.get(), timeout=15)
                except TimeoutError:
                    yield ": keep-alive\n\n"
                    continue
                yield f"event: {kind}\ndata: {json.dumps(data)}\n\n"
                if kind in {"completion", "error"}:
                    await task
                    break
        finally:
            if not task.done():
                task.cancel()
            await asyncio.shield(asyncio.gather(task, return_exceptions=True))

    return StreamingResponse(
        events(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
