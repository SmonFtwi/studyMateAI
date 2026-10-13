# StudyMate AI

StudyMate AI is a full-stack study workspace with a Next.js dashboard and a Python FastAPI
backend. Uploaded course documents are extracted, chunked, embedded with OpenAI, and stored in
Supabase PostgreSQL with pgvector. A resumable LangGraph workflow retrieves tenant-scoped
sources, applies guardrails, pauses high-stakes requests for human approval, and produces cited
answers.

## Architecture

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **API:** FastAPI, Pydantic, async SQLAlchemy
- **Orchestration:** LangGraph with PostgreSQL checkpoints and dynamic interrupts
- **Data:** Supabase-hosted PostgreSQL for application data and pgvector for embeddings
- **Authentication:** Supabase Auth in staging/production; isolated local JWT mode for Docker
- **Models:** OpenAI `gpt-5-nano` through the Responses API and
  `text-embedding-3-small` with 768-dimensional vectors
- **Observability:** OpenTelemetry traces, Prometheus metrics, persisted request latency/cost/quality
- **Delivery:** Docker, Docker Compose, GitHub Actions, GHCR, and a Render Blueprint

The frontend-facing project, source, chat, flashcard, and quiz URLs remain compatible with the
previous Express backend. FastAPI also exposes interactive API documentation at `/docs`.

## Local development

Requirements: Docker Desktop and an OpenAI API key.

```bash
export OPENAI_API_KEY="your-key"
export LOCAL_JWT_SECRET="replace-with-at-least-32-random-characters"
docker compose up --build
```

The API is available at `http://localhost:3005`, and PostgreSQL is private to the Compose network.
Set `NEXT_PUBLIC_backend_url=http://localhost:3005` in `front-end/.env.local`, then run the frontend:

```bash
cd front-end
npm install
npm run dev
```

Compose uses local auth so the stack does not require a complete self-hosted Supabase installation.
It uses exactly the same PostgreSQL/pgvector schema as production. Local credentials are development
only and must never be reused outside a workstation.

For a non-container Python workflow:

```bash
cd back-end
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
cp .env.example .env
.venv/bin/python -m app.db.migrate
.venv/bin/uvicorn app.main:app --reload --port 3005
```

## Supabase setup

1. Create a Supabase project and copy its direct or session-pooler PostgreSQL connection string.
2. Enable email/password authentication. Decide whether users must confirm email before login.
3. Run `back-end/migrations/001_initial.sql` in the Supabase SQL editor, or run
   `python -m app.db.migrate` with `DATABASE_URL` configured.
4. Configure the backend from `back-end/.env.example`. Production requires `AUTH_MODE=supabase`,
   `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `DATABASE_URL`, and `OPENAI_API_KEY`.
5. Use a direct/session-pooler database role for the trusted backend. Browser clients should use
   Supabase's publishable key and the included row-level security policies.

The backend proxies signup/login to Supabase Auth to preserve the existing frontend contract.
Supabase projects that require email confirmation return no signup token; the user must confirm and
then log in. The API verifies Supabase access tokens against the Auth service and scopes every query
by both `user_id` and `project_id`.

### Run only the backend in Docker with Supabase

Fill `back-end/.env` with the Supabase session-pooler `DATABASE_URL`, `SUPABASE_URL`,
`SUPABASE_PUBLISHABLE_KEY`, and `OPENAI_API_KEY`. Use session mode on port `5432`, not transaction
mode on port `6543`, because the API and LangGraph checkpointer use long-lived database sessions.

If the local Docker stack is running, stop it first so port 3005 is available:

```bash
docker compose down
```

Apply the schema once, unless `back-end/migrations/001_initial.sql` was already run in the Supabase
SQL editor:

```bash
docker compose -f docker-compose.supabase.yml --env-file back-end/.env \
  run --rm --build migrate
```

Then start only the containerized FastAPI backend:

```bash
docker compose -f docker-compose.supabase.yml --env-file back-end/.env \
  up -d --build backend
docker compose -f docker-compose.supabase.yml logs -f backend
```

The frontend remains outside Docker and should use
`NEXT_PUBLIC_backend_url=http://localhost:3005`. The API is available at
`http://localhost:3005`, with documentation at `http://localhost:3005/docs`. Supabase PostgreSQL,
pgvector, and Auth remain cloud-hosted; this Compose file does not start a local database.

## Retrieval, approvals, and document integration

Document processing supports PDF, DOCX, XLSX, CSV, TXT, and Markdown. Each upload is hashed for
idempotency and creates an integration job. Extraction/embedding failures retry up to three times
with exponential backoff; every start, retry, deduplication, completion, and failure is written to
`audit_logs`. Job state is available at `GET /integrations/document-processing/{job_id}`.

The LangGraph path is:

```text
guard query -> retrieve pgvector chunks -> confidence gate -> optional human interrupt
            -> OpenAI grounded answer -> citation validation -> persist answer and metrics
```

Prompt-injection patterns are blocked. Missing or weak retrieval causes an explicit abstention.
High-stakes medical, legal, or investment requests—and requests sent with
`require_approval: true`—return HTTP 202 and an `approval_id`. Reviewers can use:

```http
GET  /approvals
POST /approvals/{approval_id}/decision
Content-Type: application/json

{"decision":"approve","note":"Reviewed against the uploaded material"}
```

LangGraph checkpoints are persisted in PostgreSQL, so interrupted runs survive an API restart.

## Quality and observability

Prometheus metrics are served at `/metrics` and can be protected with `METRICS_BEARER_TOKEN`.
Set `OTEL_EXPORTER_OTLP_ENDPOINT` to export request and graph-adjacent spans to an OTLP collector.
Every chat run persists latency, input/output tokens, configurable model-list-price cost, retrieval
hit, grounding result, and trace ID. Admin profiles can query rolling production metrics:

```http
GET /ops/metrics/summary?hours=24
```

The response includes request count, retrieval hit rate, grounded-answer pass rate, p95 latency,
and average cost per request. To grant an operator access, set their `profiles.role` to `admin` in
the trusted database console.

The repository includes 60 deterministic evaluation cases covering grounded Q&A, unknown answers,
prompt injection, and approval routing. The offline suite is deliberately zero-cost; production cost
and latency come from `chat_runs`.

```bash
cd back-end
.venv/bin/python -m pytest
.venv/bin/python -m app.evaluation.runner \
  --dataset evaluation/cases.jsonl \
  --output evaluation/report.json \
  --min-retrieval-hit-rate 0.90 \
  --min-grounded-pass-rate 0.90
```

## CI/CD and cloud deployment

`Backend CI` lints the service, applies the migration to PostgreSQL/pgvector, runs tests and the
60-case evaluation gate, audits dependencies, builds the Docker image, and publishes successful
main-branch images to GHCR. The production deployment workflow uses a protected GitHub environment
and a `RENDER_DEPLOY_HOOK_URL` repository secret.

To deploy, create a Render Blueprint from `render.yaml`, supply the required secret environment
variables, add the deploy-hook secret to GitHub, and set the frontend backend URL to the Render
service URL. Render runs the PostgreSQL migration before starting the new Docker release and checks
`/health/ready` before routing traffic.

## Important operational notes

- The migration creates the new PostgreSQL schema; it does not copy historical MongoDB/Pinecone data.
- After changing from Gemini embeddings, rebuild vectors once with
  `python -m app.db.reembed`. Until then, retrieval deliberately ignores chunks created by the old
  embedding model so vectors from different embedding spaces are never compared.
- Keep `EMBEDDING_DIMENSIONS=768` synchronized with the SQL vector column and embedding model.
- Update the configurable token prices when model pricing changes.
- Apply migrations in staging before production and retain a database backup for rollback.

## License

MIT.

## Live answer-quality evaluation

The default CI suite remains offline and free. To benchmark actual OpenAI embeddings and
answers, run the opt-in evaluator from `back-end`:

```bash
.venv/bin/python -m app.evaluation.live \
  --dataset evaluation/cases.jsonl \
  --output evaluation/live-report.json \
  --limit 60 --min-pass-rate 0.8 --allow-paid-api
```

This sends the selected questions and benchmark documents to OpenAI and incurs API charges.
Use synthetic or approved evaluation data. `--limit` caps evaluated questions (default 10);
the complete benchmark document corpus is embedded even with a smaller question limit.
It never inserts benchmark documents into the application's database.

The report includes recall@6, mean reciprocal rank@6, per-case answers and retrieved IDs,
behavior checks, case latency, and estimated generation/judge costs. An LLM judge scores
faithfulness, correctness, relevance, and citation support from 0 to 1 with a written reason.
Answer cases require every score to reach 0.8; API errors fail their cases. The command exits
nonzero when the overall pass rate misses `--min-pass-rate`.

The judge uses the same configured model in a separate call, which can introduce correlated
bias. Review a sample of its judgments manually; these scores are not proof of correctness.
This is an isolated cosine-similarity benchmark using the production embedding and answer
helpers, not an end-to-end test of ingestion, pgvector SQL, authentication, or approvals.
Reported latency includes judging and excludes initial corpus embedding. Cost excludes
embeddings and usage from failed calls. Keep model prices in backend settings current.

## Viewing application performance

Open **Analytics** from the dashboard sidebar (`/Dashboard/Dash`). Students see only their
own recorded chat runs; admins see workspace-wide runs. Select 24 hours, 7 days, or 30 days
and click **Refresh** for current data. The page shows p95 response time, recorded token usage,
estimated generation cost, retrieval/citation-check rates, outcomes, and the latest 20 runs.
Greeting and abstention runs count in the displayed rate denominators. Citation checks do
not measure factual correctness. No runs means no observations, not a healthy service signal.
Failed graph requests are now recorded as failed runs; older failures are not backfilled.

For deeper troubleshooting:

- **Container logs:** `docker compose logs --tail=100 backend` (use
  `docker compose -f docker-compose.supabase.yml logs --tail=100 backend` for Supabase mode).
- **Health:** `/health/live` checks liveness; `/health/ready` checks readiness.
- **Prometheus:** scrape `/metrics` using `METRICS_BEARER_TOKEN` when configured.
  Example PromQL: `histogram_quantile(0.95, sum by (le) (rate(studymate_http_request_duration_seconds_bucket[5m])))`
  for HTTP p95, and `sum(rate(studymate_http_requests_total{status=~"5.."}[5m]))`
  for recorded HTTP server errors per second. Use Grafana with your Prometheus data source
  to graph these series; neither service is installed by this change.
- **Traces:** set `OTEL_EXPORTER_OTLP_ENDPOINT` to your collector's OTLP HTTP trace endpoint
  (typically ending in `/v1/traces`) and restart the backend. HTTP traces use service name
  `studymate-api`; admins can copy a recorded trace ID from Analytics into their trace viewer.
  A recorded trace ID alone does not mean a collector received the trace.

Live evaluation JSON reports are local artifacts, separate from production Analytics.
Prometheus counters reset when the process restarts; recorded chat metrics persist in PostgreSQL.

## Blog reports from project sources

Open a project’s **Reports** tab, choose up to 20 completed sources, optionally enter a topic,
and select **Generate report**. The English educational article streams as a draft and is saved
only after title/citation validation succeeds. Tab switching preserves generation. Saved versions
can be reopened, copied, downloaded as Markdown with source references, or deleted after confirmation.
Reports preserve source excerpts so their citations remain readable after source deletion.

Report context is distributed across every selected document, with a default total budget of
60,000 characters (`REPORT_CONTEXT_CHARS`). Topic-based selection ranks chunks within each document;
overviews sample across each document. The UI identifies partial document coverage. Citation checks
validate source IDs, not factual accuracy. High-stakes topics use the existing chat review workflow.

Apply migrations before running the new backend:

```bash
docker compose run --rm backend python -m app.db.migrate
docker compose up -d backend
```

For Supabase, use `docker compose -f docker-compose.supabase.yml --env-file back-end/.env`
in place of `docker compose`. The migration runner applies ordered, idempotent SQL files in a
transaction, including `002_reports.sql`. Reports and separate `report_runs` records are owner scoped
and removed with their project. Generation token/cost counters use operation `report_generation`;
report runs do not inflate chat Analytics. Failed calls can have unavailable token/cost usage.

The default Compose file loads `OPENAI_API_KEY` from your shell or the repository-root
`.env`; it does not automatically read `back-end/.env`. For persistent local configuration,
set `OPENAI_API_KEY` in the root `.env` (ignored by Git), then recreate the backend:

```bash
docker compose up -d --build backend
```

Never commit `.env` files. A missing backend key produces a configuration error when generating reports.
