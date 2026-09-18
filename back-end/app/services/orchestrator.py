import uuid
from typing import Any, Literal, TypedDict

from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt

from app.core.config import Settings
from app.core.guardrails import has_valid_citation, inspect_query
from app.db.session import SessionFactory
from app.schemas import RetrievedSource
from app.services.llm import OpenAIService
from app.services.retrieval import RetrievalService, format_context


class RAGState(TypedDict, total=False):
    run_id: str
    user_id: str
    project_id: str
    session_id: str
    question: str
    history: list[dict[str, str]]
    explicit_approval: bool
    requires_approval: bool
    guardrail_reason: str | None
    sources: list[dict[str, Any]]
    answer: str
    status: str
    grounded: bool
    retrieval_hit: bool
    prompt_tokens: int
    output_tokens: int
    estimated_cost_usd: float
    approval_reason: str | None


class StudyGraph:
    def __init__(self, settings: Settings, *, in_memory: bool = False) -> None:
        self.settings = settings
        self.llm = OpenAIService(settings)
        self.retrieval = RetrievalService(settings, self.llm)
        self.in_memory = in_memory
        self._checkpoint_context: Any = None
        self._checkpointer: Any = None
        self.graph: Any = None

    async def startup(self) -> None:
        if self.in_memory:
            self._checkpointer = MemorySaver()
        else:
            self._checkpoint_context = AsyncPostgresSaver.from_conn_string(
                self.settings.checkpoint_database_url
            )
            self._checkpointer = await self._checkpoint_context.__aenter__()
            await self._checkpointer.setup()
        self.graph = self._build_graph(self._checkpointer)

    async def shutdown(self) -> None:
        await self.llm.close()
        if self._checkpoint_context is not None:
            await self._checkpoint_context.__aexit__(None, None, None)

    async def run(
        self,
        *,
        run_id: str,
        user_id: uuid.UUID,
        project_id: uuid.UUID,
        session_id: uuid.UUID,
        question: str,
        history: list[dict[str, str]],
        explicit_approval: bool,
    ) -> RAGState:
        if self.graph is None:
            raise RuntimeError("StudyGraph.startup() must be called before run()")
        result = await self.graph.ainvoke(
            {
                "run_id": run_id,
                "user_id": str(user_id),
                "project_id": str(project_id),
                "session_id": str(session_id),
                "question": question,
                "history": history,
                "explicit_approval": explicit_approval,
                "status": "running",
            },
            config={"configurable": {"thread_id": run_id}},
        )
        return self._with_interrupt_status(result)

    async def resume(self, *, run_id: str, approved: bool, note: str | None) -> RAGState:
        if self.graph is None:
            raise RuntimeError("StudyGraph.startup() must be called before resume()")
        result = await self.graph.ainvoke(
            Command(resume={"approved": approved, "note": note}),
            config={"configurable": {"thread_id": run_id}},
        )
        return self._with_interrupt_status(result)

    @staticmethod
    def _with_interrupt_status(result: dict[str, Any]) -> RAGState:
        if result.get("__interrupt__"):
            result["status"] = "pending_approval"
            interruption = result["__interrupt__"][0]
            value = getattr(interruption, "value", {})
            result["approval_reason"] = (
                value.get("reason") if isinstance(value, dict) else str(value)
            )
        return result  # type: ignore[return-value]

    def _build_graph(self, checkpointer: Any):
        builder = StateGraph(RAGState)
        builder.add_node("guard", self._guard)
        builder.add_node("blocked", self._blocked)
        builder.add_node("retrieve", self._retrieve)
        builder.add_node("no_context", self._no_context)
        builder.add_node("approval", self._approval)
        builder.add_node("approval_unavailable", self._approval_unavailable)
        builder.add_node("rejected", self._rejected)
        builder.add_node("generate", self._generate)
        builder.add_node("validate", self._validate)

        builder.add_edge(START, "guard")
        builder.add_conditional_edges(
            "guard", self._route_after_guard, {"blocked": "blocked", "retrieve": "retrieve"}
        )
        builder.add_edge("blocked", END)
        builder.add_conditional_edges(
            "retrieve",
            self._route_after_retrieval,
            {
                "no_context": "no_context",
                "approval": "approval",
                "approval_unavailable": "approval_unavailable",
                "generate": "generate",
            },
        )
        builder.add_edge("no_context", END)
        builder.add_edge("approval_unavailable", END)
        builder.add_conditional_edges(
            "approval", self._route_after_approval, {"generate": "generate", "rejected": "rejected"}
        )
        builder.add_edge("rejected", END)
        builder.add_edge("generate", "validate")
        builder.add_edge("validate", END)
        return builder.compile(checkpointer=checkpointer)

    async def _guard(self, state: RAGState) -> dict[str, Any]:
        decision = inspect_query(
            state["question"], explicit_approval=state.get("explicit_approval", False)
        )
        return {
            "guardrail_reason": decision.reason,
            "requires_approval": decision.requires_approval,
            "status": "blocked" if decision.blocked else "guarded",
        }

    @staticmethod
    def _route_after_guard(state: RAGState) -> Literal["blocked", "retrieve"]:
        return "blocked" if state.get("status") == "blocked" else "retrieve"

    @staticmethod
    def _blocked(state: RAGState) -> dict[str, Any]:
        return {
            "answer": state.get("guardrail_reason") or "This request cannot be processed safely.",
            "grounded": False,
            "status": "blocked",
            "sources": [],
        }

    async def _retrieve(self, state: RAGState) -> dict[str, Any]:
        async with SessionFactory() as db:
            sources = await self.retrieval.search(
                db,
                query=state["question"],
                project_id=uuid.UUID(state["project_id"]),
                user_id=uuid.UUID(state["user_id"]),
            )
        hit = bool(
            sources and sources[0].score >= self.settings.retrieval_min_similarity
        )
        return {
            "sources": [source.model_dump() for source in sources],
            "retrieval_hit": hit,
            "status": "retrieved",
        }

    def _route_after_retrieval(
        self, state: RAGState
    ) -> Literal["no_context", "approval", "approval_unavailable", "generate"]:
        if not state.get("retrieval_hit"):
            return "no_context"
        if state.get("requires_approval"):
            return "approval" if self.settings.human_approval_enabled else "approval_unavailable"
        return "generate"

    @staticmethod
    def _no_context(state: RAGState) -> dict[str, Any]:
        return {
            "answer": "I don't have enough information in the uploaded sources.",
            "grounded": False,
            "status": "abstained",
        }

    @staticmethod
    def _approval(state: RAGState) -> dict[str, Any]:
        decision = interrupt(
            {
                "kind": "grounded_answer_review",
                "reason": "This question is high-stakes or was explicitly submitted for review.",
                "question": state["question"],
                "source_count": len(state.get("sources", [])),
                "allowed_decisions": ["approve", "reject"],
            }
        )
        approved = bool(decision.get("approved")) if isinstance(decision, dict) else False
        return {"status": "approved" if approved else "rejected"}

    @staticmethod
    def _route_after_approval(state: RAGState) -> Literal["generate", "rejected"]:
        return "generate" if state.get("status") == "approved" else "rejected"

    @staticmethod
    def _approval_unavailable(state: RAGState) -> dict[str, Any]:
        return {
            "answer": "This request requires human review, but approvals are disabled.",
            "grounded": False,
            "status": "blocked",
        }

    @staticmethod
    def _rejected(state: RAGState) -> dict[str, Any]:
        return {
            "answer": "A reviewer rejected this request.",
            "grounded": False,
            "status": "rejected",
        }

    async def _generate(self, state: RAGState) -> dict[str, Any]:
        sources = [RetrievedSource.model_validate(source) for source in state["sources"]]
        result = await self.llm.answer(
            question=state["question"],
            context=format_context(sources),
            history=state.get("history", []),
        )
        return {
            "answer": result.text,
            "prompt_tokens": result.prompt_tokens,
            "output_tokens": result.output_tokens,
            "estimated_cost_usd": result.estimated_cost_usd,
            "status": "generated",
        }

    @staticmethod
    def _validate(state: RAGState) -> dict[str, Any]:
        grounded = has_valid_citation(state.get("answer", ""), len(state.get("sources", [])))
        if not grounded:
            return {
                "answer": "I don't have enough information in the uploaded sources.",
                "grounded": False,
                "status": "abstained",
            }
        return {"grounded": True, "status": "completed"}
