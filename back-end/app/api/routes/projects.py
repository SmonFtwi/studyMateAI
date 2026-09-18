import time
import uuid

from fastapi import APIRouter, Request, Response, UploadFile, status
from opentelemetry import trace
from sqlalchemy import delete, func, select

from app.api.dependencies import AppSettings, CurrentUser, DbSession
from app.core.errors import NotFoundError, ValidationError
from app.core.metrics import PENDING_APPROVALS
from app.db.models import (
    ApprovalRequest,
    ChatMessage,
    ChatRun,
    ChatSession,
    Flashcard,
    Project,
    QuizQuestion,
    SourceDocument,
    utcnow,
)
from app.schemas import ChatRequest, ChatSessionCreateRequest, ProjectCreateRequest, RetrievedSource
from app.services.audit import record_audit
from app.services.documents import DocumentProcessingService
from app.services.llm import OpenAIService
from app.services.retrieval import RetrievalService, public_sources

router = APIRouter(prefix="/projects", tags=["projects"])


def _project_json(project: Project, *, sources: int = 0) -> dict:
    return {
        "_id": str(project.id),
        "project_id": str(project.id),
        "title": project.title,
        "description": project.description,
        "createdAt": project.created_at.isoformat(),
        "updatedAt": project.updated_at.isoformat(),
        "sources": sources,
    }


def _session_json(session: ChatSession) -> dict:
    return {
        "_id": str(session.id),
        "projectId": str(session.project_id),
        "userId": str(session.user_id),
        "title": session.title,
        "createdAt": session.created_at.isoformat(),
        "updatedAt": session.updated_at.isoformat(),
    }


def _message_json(message: ChatMessage) -> dict:
    return {
        "_id": str(message.id),
        "sessionId": str(message.session_id),
        "projectId": str(message.project_id),
        "userId": str(message.user_id),
        "role": message.role,
        "content": message.content,
        "sources": message.sources,
        "createdAt": message.created_at.isoformat(),
    }


async def _owned_project(db: DbSession, project_id: uuid.UUID, user_id: uuid.UUID) -> Project:
    project = await db.scalar(
        select(Project).where(Project.id == project_id, Project.user_id == user_id)
    )
    if project is None:
        raise NotFoundError("Project not found")
    return project


async def _owned_session(
    db: DbSession, *, session_id: uuid.UUID, project_id: uuid.UUID, user_id: uuid.UUID
) -> ChatSession:
    session = await db.scalar(
        select(ChatSession).where(
            ChatSession.id == session_id,
            ChatSession.project_id == project_id,
            ChatSession.user_id == user_id,
        )
    )
    if session is None:
        raise NotFoundError("Chat session not found")
    return session


@router.post("/createProject")
async def create_project(payload: ProjectCreateRequest, db: DbSession, user: CurrentUser) -> dict:
    project = Project(
        user_id=user.id,
        title=payload.title.strip(),
        description=payload.description.strip(),
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return {"message": "Project created successfully", "project": _project_json(project)}


@router.get("/getProjects")
async def list_projects(db: DbSession, user: CurrentUser) -> dict:
    count_query = (
        select(SourceDocument.project_id, func.count(SourceDocument.id).label("source_count"))
        .where(SourceDocument.user_id == user.id)
        .group_by(SourceDocument.project_id)
        .subquery()
    )
    statement = (
        select(Project, func.coalesce(count_query.c.source_count, 0))
        .outerjoin(count_query, count_query.c.project_id == Project.id)
        .where(Project.user_id == user.id)
        .order_by(Project.updated_at.desc())
    )
    rows = (await db.execute(statement)).all()
    return {
        "message": "Projects fetched successfully",
        "projects": [_project_json(project, sources=count) for project, count in rows],
    }


@router.delete("/deleteProject/{project_id}")
async def delete_project(project_id: uuid.UUID, db: DbSession, user: CurrentUser) -> dict:
    project = await _owned_project(db, project_id, user.id)
    response = _project_json(project)
    await db.delete(project)
    await db.commit()
    return {"message": "Project deleted successfully", "project": response}


@router.get("/{project_id}/files")
async def list_project_files(project_id: uuid.UUID, db: DbSession, user: CurrentUser) -> dict:
    await _owned_project(db, project_id, user.id)
    documents = (
        await db.scalars(
            select(SourceDocument)
            .where(
                SourceDocument.project_id == project_id, SourceDocument.user_id == user.id
            )
            .order_by(SourceDocument.created_at.desc())
        )
    ).all()
    return {
        "message": "Files fetched successfully",
        "files": [
            {
                "_id": str(document.id),
                "file_id": str(document.id),
                "filename": document.filename,
                "status": document.status.value,
                "chunk_count": document.chunk_count,
                "createdAt": document.created_at.isoformat(),
                "updatedAt": document.updated_at.isoformat(),
            }
            for document in documents
        ],
    }


@router.post("/{project_id}/sources")
async def upload_project_sources(
    project_id: uuid.UUID,
    files: list[UploadFile],
    request: Request,
    db: DbSession,
    user: CurrentUser,
    settings: AppSettings,
) -> dict:
    if not files:
        raise ValidationError("No files uploaded")
    service = DocumentProcessingService(settings, request.app.state.study_graph.llm)
    uploaded: list[dict] = []
    for uploaded_file in files:
        content = await uploaded_file.read(settings.max_upload_bytes + 1)
        document, job, deduplicated = await service.process(
            db,
            project_id=project_id,
            user_id=user.id,
            filename=uploaded_file.filename or "upload",
            content_type=uploaded_file.content_type or "application/octet-stream",
            content=content,
            request_id=getattr(request.state, "request_id", None),
        )
        uploaded.append(
            {
                "_id": str(document.id),
                "file_id": str(document.id),
                "filename": document.filename,
                "status": document.status.value,
                "chunk_count": document.chunk_count,
                "integration_job_id": str(job.id),
                "attempts": job.attempts,
                "deduplicated": deduplicated,
            }
        )
    return {"message": "Files uploaded and embedded successfully", "files": uploaded}


@router.post("/{project_id}/chat/sessions", status_code=201)
async def create_chat_session(
    project_id: uuid.UUID,
    payload: ChatSessionCreateRequest,
    db: DbSession,
    user: CurrentUser,
) -> dict:
    await _owned_project(db, project_id, user.id)
    session = ChatSession(
        project_id=project_id, user_id=user.id, title=payload.title.strip() or "New chat"
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return {"message": "Chat session created", "session": _session_json(session)}


@router.get("/{project_id}/chat/sessions")
async def list_chat_sessions(project_id: uuid.UUID, db: DbSession, user: CurrentUser) -> dict:
    await _owned_project(db, project_id, user.id)
    sessions = (
        await db.scalars(
            select(ChatSession)
            .where(ChatSession.project_id == project_id, ChatSession.user_id == user.id)
            .order_by(ChatSession.updated_at.desc())
        )
    ).all()
    return {"sessions": [_session_json(session) for session in sessions]}


@router.get("/{project_id}/chat/{session_id}/messages")
async def list_chat_messages(
    project_id: uuid.UUID, session_id: uuid.UUID, db: DbSession, user: CurrentUser
) -> dict:
    await _owned_session(db, session_id=session_id, project_id=project_id, user_id=user.id)
    messages = (
        await db.scalars(
            select(ChatMessage)
            .where(
                ChatMessage.session_id == session_id,
                ChatMessage.project_id == project_id,
                ChatMessage.user_id == user.id,
            )
            .order_by(ChatMessage.created_at)
        )
    ).all()
    return {"messages": [_message_json(message) for message in messages]}


@router.post("/{project_id}/chat/{session_id}/messages")
async def send_chat_message(
    project_id: uuid.UUID,
    session_id: uuid.UUID,
    payload: ChatRequest,
    request: Request,
    response: Response,
    db: DbSession,
    user: CurrentUser,
) -> dict:
    session = await _owned_session(
        db, session_id=session_id, project_id=project_id, user_id=user.id
    )
    history_rows = (
        await db.scalars(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id, ChatMessage.user_id == user.id)
            .order_by(ChatMessage.created_at.desc())
            .limit(10)
        )
    ).all()
    history = [
        {"role": item.role, "content": item.content} for item in reversed(history_rows)
    ]
    db.add(
        ChatMessage(
            session_id=session_id,
            project_id=project_id,
            user_id=user.id,
            role="user",
            content=payload.message.strip(),
            sources=[],
        )
    )
    session.updated_at = utcnow()
    await db.commit()

    started = time.perf_counter()
    run_id = f"{session_id}:{uuid.uuid4()}"
    result = await request.app.state.study_graph.run(
        run_id=run_id,
        user_id=user.id,
        project_id=project_id,
        session_id=session_id,
        question=payload.message.strip(),
        history=history,
        explicit_approval=payload.require_approval,
    )
    elapsed_ms = (time.perf_counter() - started) * 1_000
    sources = [RetrievedSource.model_validate(item) for item in result.get("sources", [])]
    chat_run = ChatRun(
        session_id=session_id,
        project_id=project_id,
        user_id=user.id,
        status=result.get("status", "failed"),
        latency_ms=elapsed_ms,
        prompt_tokens=result.get("prompt_tokens", 0),
        completion_tokens=result.get("output_tokens", 0),
        estimated_cost_usd=result.get("estimated_cost_usd", 0.0),
        retrieved_count=len(sources),
        retrieval_hit=result.get("retrieval_hit", False),
        grounded=result.get("grounded", False),
        trace_id=_trace_id(),
    )
    db.add(chat_run)
    await db.flush()

    if result.get("status") == "pending_approval":
        approval = ApprovalRequest(
            thread_id=run_id,
            session_id=session_id,
            project_id=project_id,
            user_id=user.id,
            reason=result.get("approval_reason") or "Human review requested",
            payload={"chat_run_id": str(chat_run.id), "question": payload.message.strip()},
        )
        db.add(approval)
        record_audit(
            db,
            actor_id=user.id,
            action="approval.requested",
            resource_type="chat_run",
            resource_id=str(chat_run.id),
            outcome="pending",
            details={"approval_id": str(approval.id)},
            request_id=getattr(request.state, "request_id", None),
        )
        await db.commit()
        PENDING_APPROVALS.inc()
        response.status_code = status.HTTP_202_ACCEPTED
        return {
            "status": "pending_approval",
            "approval_id": str(approval.id),
            "message": {
                "role": "assistant",
                "content": "This request is waiting for human approval.",
            },
            "sources": public_sources(sources),
        }

    assistant = ChatMessage(
        session_id=session_id,
        project_id=project_id,
        user_id=user.id,
        role="assistant",
        content=result.get("answer", "I could not complete that request."),
        sources=public_sources(sources),
    )
    db.add(assistant)
    await db.commit()
    await db.refresh(assistant)
    return {
        "status": result.get("status"),
        "message": _message_json(assistant),
        "sources": assistant.sources,
        "metrics": {
            "latency_ms": round(elapsed_ms, 2),
            "estimated_cost_usd": chat_run.estimated_cost_usd,
            "retrieval_hit": chat_run.retrieval_hit,
            "grounded": chat_run.grounded,
            "trace_id": chat_run.trace_id,
        },
    }


@router.get("/{project_id}/flashcards")
async def list_flashcards(project_id: uuid.UUID, db: DbSession, user: CurrentUser) -> dict:
    await _owned_project(db, project_id, user.id)
    cards = (
        await db.scalars(
            select(Flashcard)
            .where(Flashcard.project_id == project_id, Flashcard.user_id == user.id)
            .order_by(Flashcard.created_at.desc())
        )
    ).all()
    return {"flashcards": [_flashcard_json(card) for card in cards]}


@router.post("/{project_id}/flashcards/generate", status_code=201)
async def generate_flashcards(
    project_id: uuid.UUID,
    request: Request,
    db: DbSession,
    user: CurrentUser,
    settings: AppSettings,
) -> dict:
    await _owned_project(db, project_id, user.id)
    llm: OpenAIService = request.app.state.study_graph.llm
    context = await RetrievalService(settings, llm).project_context(
        db, project_id=project_id, user_id=user.id
    )
    if not context:
        raise ValidationError("No content found in project to generate flashcards")
    generated, _ = await llm.generate_flashcards(context)
    cards = [
        Flashcard(
            project_id=project_id,
            user_id=user.id,
            question=item.question,
            answer=item.answer,
        )
        for item in generated.flashcards
    ]
    db.add_all(cards)
    await db.commit()
    return {
        "message": "Flashcards generated successfully",
        "count": len(cards),
        "flashcards": [_flashcard_json(card) for card in cards],
    }


@router.delete("/{project_id}/flashcards/{flashcard_id}")
async def delete_flashcard(
    project_id: uuid.UUID, flashcard_id: uuid.UUID, db: DbSession, user: CurrentUser
) -> dict:
    deleted = await db.execute(
        delete(Flashcard).where(
            Flashcard.id == flashcard_id,
            Flashcard.project_id == project_id,
            Flashcard.user_id == user.id,
        )
    )
    if deleted.rowcount == 0:
        raise NotFoundError("Flashcard not found")
    await db.commit()
    return {"message": "Flashcard deleted"}


@router.get("/{project_id}/quiz")
async def list_quiz(project_id: uuid.UUID, db: DbSession, user: CurrentUser) -> dict:
    await _owned_project(db, project_id, user.id)
    questions = (
        await db.scalars(
            select(QuizQuestion)
            .where(QuizQuestion.project_id == project_id, QuizQuestion.user_id == user.id)
            .order_by(QuizQuestion.created_at.desc())
        )
    ).all()
    return {"questions": [_quiz_json(question) for question in questions]}


@router.post("/{project_id}/quiz/generate", status_code=201)
async def generate_quiz(
    project_id: uuid.UUID,
    request: Request,
    db: DbSession,
    user: CurrentUser,
    settings: AppSettings,
) -> dict:
    await _owned_project(db, project_id, user.id)
    llm: OpenAIService = request.app.state.study_graph.llm
    context = await RetrievalService(settings, llm).project_context(
        db, project_id=project_id, user_id=user.id
    )
    if not context:
        raise ValidationError("No content found in project to generate quiz questions")
    generated, _ = await llm.generate_quiz(context)
    questions: list[QuizQuestion] = []
    for item in generated.questions:
        if item.correct_answer not in item.options:
            raise ValidationError("Generated quiz answer does not match an option")
        questions.append(
            QuizQuestion(
                project_id=project_id,
                user_id=user.id,
                question=item.question,
                options=item.options,
                correct_answer=item.correct_answer,
            )
        )
    db.add_all(questions)
    await db.commit()
    return {
        "message": "Quiz questions generated successfully",
        "count": len(questions),
        "questions": [_quiz_json(question) for question in questions],
    }


def _flashcard_json(card: Flashcard) -> dict:
    return {
        "_id": str(card.id),
        "question": card.question,
        "answer": card.answer,
        "mastered": card.mastered,
        "createdAt": card.created_at.isoformat(),
    }


def _quiz_json(question: QuizQuestion) -> dict:
    return {
        "_id": str(question.id),
        "question": question.question,
        "options": question.options,
        "correctAnswer": question.correct_answer,
        "type": question.question_type,
        "createdAt": question.created_at.isoformat(),
    }


def _trace_id() -> str | None:
    context = trace.get_current_span().get_span_context()
    return f"{context.trace_id:032x}" if context.is_valid else None
