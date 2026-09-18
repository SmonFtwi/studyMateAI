import time
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Request
from sqlalchemy import select

from app.api.dependencies import CurrentUser, DbSession
from app.core.errors import NotFoundError, ValidationError
from app.core.metrics import PENDING_APPROVALS
from app.db.models import (
    ApprovalRequest,
    ApprovalStatus,
    ChatMessage,
    ChatRun,
)
from app.schemas import ApprovalDecisionRequest, RetrievedSource
from app.services.audit import record_audit
from app.services.retrieval import public_sources

router = APIRouter(prefix="/approvals", tags=["human-approval"])


@router.get("")
async def list_pending_approvals(db: DbSession, user: CurrentUser) -> dict:
    approvals = (
        await db.scalars(
            select(ApprovalRequest)
            .where(
                ApprovalRequest.user_id == user.id,
                ApprovalRequest.status == ApprovalStatus.pending,
            )
            .order_by(ApprovalRequest.created_at)
        )
    ).all()
    return {"approvals": [_approval_json(item) for item in approvals]}


@router.post("/{approval_id}/decision")
async def decide_approval(
    approval_id: uuid.UUID,
    payload: ApprovalDecisionRequest,
    request: Request,
    db: DbSession,
    user: CurrentUser,
) -> dict:
    approval = await db.scalar(
        select(ApprovalRequest).where(
            ApprovalRequest.id == approval_id, ApprovalRequest.user_id == user.id
        )
    )
    if approval is None:
        raise NotFoundError("Approval request not found")
    if approval.status != ApprovalStatus.pending:
        raise ValidationError("Approval request has already been decided")

    approved = payload.decision == "approve"
    started = time.perf_counter()
    result = await request.app.state.study_graph.resume(
        run_id=approval.thread_id, approved=approved, note=payload.note
    )
    resume_latency_ms = (time.perf_counter() - started) * 1_000
    approval.status = ApprovalStatus.approved if approved else ApprovalStatus.rejected
    approval.decided_by = user.id
    approval.decision_note = payload.note
    approval.decided_at = datetime.now(UTC)
    PENDING_APPROVALS.dec()

    source_models = [
        RetrievedSource.model_validate(item) for item in result.get("sources", [])
    ]
    message = ChatMessage(
        session_id=approval.session_id,
        project_id=approval.project_id,
        user_id=approval.user_id,
        role="assistant",
        content=result.get("answer", "A reviewer rejected this request."),
        sources=public_sources(source_models),
    )
    db.add(message)

    chat_run_id = approval.payload.get("chat_run_id")
    chat_run = await db.get(ChatRun, uuid.UUID(chat_run_id)) if chat_run_id else None
    if chat_run:
        chat_run.status = result.get("status", "rejected")
        chat_run.latency_ms += resume_latency_ms
        chat_run.prompt_tokens = result.get("prompt_tokens", 0)
        chat_run.completion_tokens = result.get("output_tokens", 0)
        chat_run.estimated_cost_usd = result.get("estimated_cost_usd", 0.0)
        chat_run.grounded = result.get("grounded", False)
    record_audit(
        db,
        actor_id=user.id,
        action="approval.decided",
        resource_type="approval_request",
        resource_id=str(approval.id),
        outcome=payload.decision,
        details={"note": payload.note or ""},
        request_id=getattr(request.state, "request_id", None),
    )
    await db.commit()
    await db.refresh(message)
    return {
        "status": result.get("status"),
        "approval": _approval_json(approval),
        "message": {
            "_id": str(message.id),
            "role": message.role,
            "content": message.content,
            "sources": message.sources,
            "createdAt": message.created_at.isoformat(),
        },
    }


def _approval_json(approval: ApprovalRequest) -> dict:
    return {
        "id": str(approval.id),
        "thread_id": approval.thread_id,
        "session_id": str(approval.session_id),
        "project_id": str(approval.project_id),
        "reason": approval.reason,
        "payload": approval.payload,
        "status": approval.status.value,
        "created_at": approval.created_at.isoformat(),
        "decided_at": approval.decided_at.isoformat() if approval.decided_at else None,
    }

