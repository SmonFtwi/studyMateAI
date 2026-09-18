import re
from dataclasses import dataclass

PROMPT_INJECTION_PATTERNS = (
    re.compile(r"ignore .{0,40}(previous|prior|system).{0,30}instructions", re.I),
    re.compile(r"reveal (the |your )?(system prompt|hidden instructions|developer message)", re.I),
    re.compile(r"act as (an? )?(unrestricted|jailbroken)", re.I),
    re.compile(r"<\s*(system|assistant|tool)\s*>", re.I),
)
HIGH_STAKES_PATTERNS = (
    re.compile(r"\b(diagnose|dosage|prescription|medical emergency)\b", re.I),
    re.compile(r"\b(legal advice|lawsuit|contract liability)\b", re.I),
    re.compile(r"\b(buy|sell|invest)\b.{0,40}\b(stock|crypto|security|option)\b", re.I),
)


@dataclass(frozen=True)
class GuardrailDecision:
    blocked: bool
    requires_approval: bool
    reason: str | None = None


def inspect_query(query: str, *, explicit_approval: bool = False) -> GuardrailDecision:
    normalized = query.strip()
    if not normalized:
        return GuardrailDecision(True, False, "Question cannot be empty")
    if len(normalized) > 8_000:
        return GuardrailDecision(True, False, "Question exceeds the 8,000 character limit")
    if any(pattern.search(normalized) for pattern in PROMPT_INJECTION_PATTERNS):
        return GuardrailDecision(
            True,
            False,
            "The request contains instructions that conflict with the grounded study workflow",
        )
    high_stakes = any(pattern.search(normalized) for pattern in HIGH_STAKES_PATTERNS)
    return GuardrailDecision(False, explicit_approval or high_stakes)


def has_valid_citation(answer: str, source_count: int) -> bool:
    if source_count == 0:
        return False
    citations = {int(value) for value in re.findall(r"\[S(\d+)\]", answer)}
    return bool(citations) and all(1 <= value <= source_count for value in citations)
