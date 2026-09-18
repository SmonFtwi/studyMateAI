import argparse
import json
import math
import re
import time
from collections import Counter
from pathlib import Path
from statistics import mean
from typing import Literal

from pydantic import BaseModel, Field

from app.core.guardrails import has_valid_citation, inspect_query

TOKEN_PATTERN = re.compile(r"[a-z0-9][a-z0-9-]*", re.I)
STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "do", "does", "for", "from",
    "how", "in", "is", "it", "of", "on", "or", "that", "the", "to", "was", "what",
    "s", "when", "where", "which", "who", "why", "with",
}


class EvaluationCase(BaseModel):
    id: str
    document: str
    question: str
    expected_terms: list[str] = Field(default_factory=list)
    behavior: Literal["answer", "abstain", "block", "approval"]
    source: str


class RankedDocument(BaseModel):
    case_id: str
    source: str
    document: str
    score: float


def tokenize(text: str) -> list[str]:
    return [token for token in TOKEN_PATTERN.findall(text.lower()) if token not in STOPWORDS]


class OfflineRetriever:
    """Deterministic TF-IDF retriever used as a zero-cost CI regression gate."""

    def __init__(self, cases: list[EvaluationCase]) -> None:
        self.documents = [case for case in cases if case.document]
        self.term_frequencies = [Counter(tokenize(case.document)) for case in self.documents]
        document_frequency = Counter(
            token for counts in self.term_frequencies for token in counts
        )
        count = max(1, len(self.documents))
        self.idf = {
            token: math.log((count + 1) / (frequency + 1)) + 1
            for token, frequency in document_frequency.items()
        }

    def search(self, query: str, *, top_k: int = 3) -> list[RankedDocument]:
        query_terms = Counter(tokenize(query))
        ranked: list[RankedDocument] = []
        for case, frequencies in zip(self.documents, self.term_frequencies, strict=True):
            score = sum(
                min(query_count, frequencies.get(term, 0)) * self.idf.get(term, 0.0)
                for term, query_count in query_terms.items()
            )
            normalization = math.sqrt(sum(value * value for value in frequencies.values())) or 1
            ranked.append(
                RankedDocument(
                    case_id=case.id,
                    source=case.source,
                    document=case.document,
                    score=score / normalization,
                )
            )
        return sorted(ranked, key=lambda item: (-item.score, item.case_id))[:top_k]


def extractive_answer(question: str, result: RankedDocument | None) -> str:
    if result is None or result.score <= 0:
        return "I don't have enough information in the uploaded sources."
    query_terms = set(tokenize(question))
    sentences = [value.strip() for value in re.split(r"(?<=[.!?])\s+", result.document)]
    sentence = max(
        sentences,
        key=lambda value: len(query_terms.intersection(tokenize(value))),
        default=result.document,
    )
    return f"{sentence} [S1]"


def percentile(values: list[float], quantile: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = min(len(ordered) - 1, math.ceil(quantile * len(ordered)) - 1)
    return ordered[index]


def evaluate(cases: list[EvaluationCase]) -> dict:
    retriever = OfflineRetriever(cases)
    answer_cases = [case for case in cases if case.behavior == "answer"]
    retrieval_hits = 0
    grounded_passes = 0
    behavior_passes = 0
    latencies: list[float] = []
    results: list[dict] = []

    for case in cases:
        started = time.perf_counter()
        guard = inspect_query(case.question)
        retrieved: list[RankedDocument] = []
        answer = ""
        passed = False
        if case.behavior == "block":
            passed = guard.blocked
        elif case.behavior == "approval":
            passed = not guard.blocked and guard.requires_approval
        elif case.behavior == "abstain":
            retrieved = retriever.search(case.question)
            answer = extractive_answer(
                case.question, retrieved[0] if retrieved and retrieved[0].score > 0 else None
            )
            passed = answer.startswith("I don't have enough information")
        else:
            retrieved = retriever.search(case.question)
            hit = bool(retrieved and retrieved[0].case_id == case.id and retrieved[0].score > 0)
            retrieval_hits += int(hit)
            answer = extractive_answer(case.question, retrieved[0] if retrieved else None)
            grounded = has_valid_citation(answer, 1) and all(
                term.lower() in answer.lower() for term in case.expected_terms
            )
            grounded_passes += int(grounded)
            passed = hit and grounded
        behavior_passes += int(passed)
        elapsed_ms = (time.perf_counter() - started) * 1_000
        latencies.append(elapsed_ms)
        results.append(
            {
                "id": case.id,
                "behavior": case.behavior,
                "passed": passed,
                "top_source": retrieved[0].source if retrieved else None,
                "latency_ms": round(elapsed_ms, 4),
            }
        )

    answer_count = max(1, len(answer_cases))
    return {
        "evaluation_cases": len(cases),
        "retrieval_hit_rate": round(retrieval_hits / answer_count, 4),
        "grounded_answer_pass_rate": round(grounded_passes / answer_count, 4),
        "behavior_pass_rate": round(behavior_passes / max(1, len(cases)), 4),
        "p95_latency_ms": round(percentile(latencies, 0.95), 4),
        "mean_latency_ms": round(mean(latencies), 4) if latencies else 0.0,
        "cost_per_request_usd": 0.0,
        "mode": "offline-deterministic",
        "results": results,
    }


def load_cases(path: Path) -> list[EvaluationCase]:
    return [
        EvaluationCase.model_validate_json(line)
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the StudyMate offline evaluation suite")
    parser.add_argument("--dataset", type=Path, required=True)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--min-retrieval-hit-rate", type=float, default=0.0)
    parser.add_argument("--min-grounded-pass-rate", type=float, default=0.0)
    args = parser.parse_args()
    report = evaluate(load_cases(args.dataset))
    serialized = json.dumps(report, indent=2)
    print(serialized)
    if args.output:
        args.output.write_text(serialized + "\n", encoding="utf-8")
    if report["retrieval_hit_rate"] < args.min_retrieval_hit_rate:
        return 1
    if report["grounded_answer_pass_rate"] < args.min_grounded_pass_rate:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
