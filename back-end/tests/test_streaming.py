import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.core.config import Settings
from app.schemas import LLMResult, RetrievedSource
from app.services.llm import OpenAIService
from app.services.orchestrator import StudyGraph
from app.services.streaming import chat_events


@pytest.mark.parametrize("answer,grounded", [("Supported [S1]", True), ("No citation", False)])
async def test_graph_streams_provisional_text_then_validates(answer, grounded):
    graph = StudyGraph(Settings(_env_file=None), in_memory=True)
    source = RetrievedSource(
        chunk_id="c",
        document_id="d",
        filename="notes",
        content="Original excerpt",
        score=0.9,
        metadata={},
    )
    graph._retrieve = AsyncMock(
        return_value={"sources": [source.model_dump()], "retrieval_hit": True}
    )

    async def stream_answer(**kwargs):
        await kwargs["on_delta"](answer)
        return LLMResult(text=answer)

    graph.llm.stream_answer = stream_answer
    events = []

    async def emit(kind, data):
        events.append((kind, data))

    await graph.startup()
    token = chat_events.set(emit)
    try:
        result = await graph.run(
            run_id=str(uuid.uuid4()),
            user_id=uuid.uuid4(),
            project_id=uuid.uuid4(),
            session_id=uuid.uuid4(),
            question="Explain the document",
            history=[],
            explicit_approval=False,
        )
        assert [kind for kind, _ in events] == ["sources", "delta"]
        assert events[0][1]["sources"][0]["id"] == "S1"
        assert events[0][1]["sources"][0]["metadata"]["chunk"] == "Original excerpt"
        assert result["grounded"] is grounded
        if not grounded:
            assert result["answer"].startswith("I don't have enough")
    finally:
        chat_events.reset(token)
        await graph.shutdown()


async def test_provider_stream_delivers_deltas_before_final_and_closes():
    class Stream:
        closed = False

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            self.closed = True

        def __aiter__(self):
            return self.events()

        async def events(self):
            yield SimpleNamespace(type="response.output_text.delta", delta="Hello")
            yield SimpleNamespace(type="response.output_text.delta", delta=" world")

        async def get_final_response(self):
            assert received == ["Hello", " world"]
            return SimpleNamespace(status="completed", output_text="Hello world", usage=None)

    stream = Stream()
    llm = OpenAIService(Settings(_env_file=None))
    llm.client = SimpleNamespace(responses=SimpleNamespace(stream=lambda **kwargs: stream))
    received = []

    async def delta(text):
        received.append(text)

    result = await llm.stream_answer(question="q", context="c", history=[], on_delta=delta)
    assert result.text == "Hello world"
    assert stream.closed


@pytest.mark.parametrize("outcome", ["completion", "approval-required", "error", "disconnect"])
async def test_sse_route_lifecycle(monkeypatch, outcome):
    import asyncio
    import json
    from contextlib import asynccontextmanager

    from app.api.routes import projects
    from app.schemas import ChatRequest

    closed = []

    @asynccontextmanager
    async def factory():
        try:
            yield object()
        finally:
            closed.append(True)

    monkeypatch.setattr(projects, "SessionFactory", factory)
    monkeypatch.setattr(projects, "_owned_session", AsyncMock())
    cancelled = []

    async def send(*args):
        sink = chat_events.get()
        await sink("sources", {"sources": []})
        await sink("delta", {"text": "partial"})
        if outcome == "error":
            raise RuntimeError("private provider detail")
        if outcome == "disconnect":
            try:
                await asyncio.Event().wait()
            except asyncio.CancelledError:
                cancelled.append(True)
                raise
        return {
            "message": {"content": "validated", "_id": "saved"},
            "sources": [],
            **({"approval_id": "a"} if outcome == "approval-required" else {}),
        }

    monkeypatch.setattr(projects, "send_chat_message", send)
    response = await projects.stream_chat_message(
        uuid.uuid4(),
        uuid.uuid4(),
        ChatRequest(message="question"),
        object(),
        object(),
        SimpleNamespace(id=uuid.uuid4()),
    )
    iterator = response.body_iterator
    first = await anext(iterator)
    assert first.startswith("event: sources")
    if outcome == "disconnect":
        await iterator.aclose()
        assert cancelled
    else:
        chunks = [chunk async for chunk in iterator]
        assert chunks[0].startswith("event: delta")
        assert chunks[-1].startswith(f"event: {outcome}")
        assert "private provider detail" not in "".join(chunks)
        if outcome == "completion":
            data = json.loads(chunks[-1].split("data: ")[1])
            assert data["message"]["_id"] == "saved"
    assert closed == [True]
    assert chat_events.get() is None


async def test_cancelled_generation_records_interruption_without_assistant(monkeypatch):
    import asyncio
    from unittest.mock import MagicMock

    from fastapi import Request, Response

    from app.api.routes import projects
    from app.db.models import ChatMessage, ChatRun
    from app.schemas import ChatRequest

    db = AsyncMock()
    db.add = MagicMock()
    db.scalars.return_value = SimpleNamespace(all=lambda: [])
    monkeypatch.setattr(projects, "_owned_session", AsyncMock(return_value=SimpleNamespace()))
    graph = SimpleNamespace(run=AsyncMock(side_effect=asyncio.CancelledError()))
    request = Request(
        {"type": "http", "app": SimpleNamespace(state=SimpleNamespace(study_graph=graph))}
    )
    with pytest.raises(asyncio.CancelledError):
        await projects.send_chat_message(
            uuid.uuid4(),
            uuid.uuid4(),
            ChatRequest(message="question"),
            request,
            Response(),
            db,
            SimpleNamespace(id=uuid.uuid4()),
        )
    records = [call.args[0] for call in db.add.call_args_list]
    assert [r.role for r in records if isinstance(r, ChatMessage)] == ["user"]
    assert [r.status for r in records if isinstance(r, ChatRun)] == ["interrupted"]
    assert db.commit.await_count == 2
