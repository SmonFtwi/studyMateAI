from prometheus_client import Counter, Gauge, Histogram

HTTP_REQUESTS = Counter(
    "studymate_http_requests_total",
    "HTTP requests handled by the API",
    ("method", "route", "status"),
)
HTTP_LATENCY = Histogram(
    "studymate_http_request_duration_seconds",
    "HTTP request latency",
    ("method", "route"),
    buckets=(0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30),
)
LLM_COST = Counter(
    "studymate_llm_cost_usd_total",
    "Estimated LLM cost in USD",
    ("model", "operation"),
)
LLM_TOKENS = Counter(
    "studymate_llm_tokens_total",
    "LLM tokens consumed",
    ("model", "operation", "direction"),
)
RETRIEVAL_REQUESTS = Counter(
    "studymate_retrieval_requests_total",
    "Retrieval requests partitioned by whether the minimum score was hit",
    ("hit",),
)
DOCUMENT_JOBS = Counter(
    "studymate_document_processing_jobs_total",
    "Document processing outcomes",
    ("status",),
)
PENDING_APPROVALS = Gauge(
    "studymate_pending_approvals",
    "Current in-process approval requests",
)


def observe_llm_usage(
    *, model: str, operation: str, prompt_tokens: int, output_tokens: int, cost_usd: float
) -> None:
    LLM_TOKENS.labels(model, operation, "input").inc(prompt_tokens)
    LLM_TOKENS.labels(model, operation, "output").inc(output_tokens)
    LLM_COST.labels(model, operation).inc(cost_usd)

