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
