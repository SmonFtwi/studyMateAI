"""Request-local event sink; never persisted in graph checkpoints."""

from collections.abc import Awaitable, Callable
from contextvars import ContextVar
from typing import Any

chat_events: ContextVar[Callable[[str, dict[str, Any]], Awaitable[None]] | None] = ContextVar(
    "chat_events", default=None
)
