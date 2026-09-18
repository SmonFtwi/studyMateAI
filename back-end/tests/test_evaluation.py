from pathlib import Path

from app.evaluation.runner import (
    OfflineRetriever,
    evaluate,
    extractive_answer,
    load_cases,
    percentile,
    tokenize,
)

DATASET = Path(__file__).resolve().parents[1] / "evaluation" / "cases.jsonl"


def test_dataset_has_more_than_fifty_cases_and_all_behaviors() -> None:
    cases = load_cases(DATASET)
    assert len(cases) >= 50
    assert {case.behavior for case in cases} == {"answer", "abstain", "block", "approval"}
    assert len({case.id for case in cases}) == len(cases)


def test_offline_evaluation_meets_quality_gates() -> None:
    report = evaluate(load_cases(DATASET))
    assert report["evaluation_cases"] >= 50
    assert report["retrieval_hit_rate"] >= 0.90
    assert report["grounded_answer_pass_rate"] >= 0.90
    assert report["behavior_pass_rate"] >= 0.90
    assert report["p95_latency_ms"] >= 0
    assert report["cost_per_request_usd"] == 0


def test_retriever_and_extractive_answer() -> None:
    cases = load_cases(DATASET)
    retriever = OfflineRetriever(cases)
    result = retriever.search("Which cell structure translates messenger RNA?")[0]
    assert result.case_id == "bio-004"
    answer = extractive_answer("Which cell structure translates messenger RNA?", result)
    assert "Ribosomes" in answer
    assert answer.endswith("[S1]")
    assert extractive_answer("zephyrite nonsense", None).startswith("I don't have enough")


def test_tokenization_and_percentile_edges() -> None:
    assert tokenize("What is the Atomic-number?") == ["atomic-number"]
    assert percentile([], 0.95) == 0
    assert percentile([1, 5, 3, 2, 4], 0.95) == 5

