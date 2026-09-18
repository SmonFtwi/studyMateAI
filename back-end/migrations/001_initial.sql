CREATE SCHEMA IF NOT EXISTS extensions;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
BEGIN
    IF to_regprocedure('auth.uid()') IS NULL THEN
        EXECUTE $function$
            CREATE FUNCTION auth.uid() RETURNS uuid
            LANGUAGE sql STABLE
            AS 'SELECT nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid'
        $function$;
    END IF;
END $$;

DO $$ BEGIN
    CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE integration_processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY,
    email varchar(320) NOT NULL UNIQUE,
    name varchar(160) NOT NULL,
    role varchar(32) NOT NULL DEFAULT 'student',
    password_hash text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title varchar(240) NOT NULL,
    description text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_projects_user_id ON projects(user_id);

CREATE TABLE IF NOT EXISTS source_documents (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    filename varchar(512) NOT NULL,
    content_type varchar(160) NOT NULL DEFAULT 'application/octet-stream',
    sha256 varchar(64) NOT NULL,
    size_bytes integer NOT NULL,
    status processing_status NOT NULL DEFAULT 'pending',
    failure_reason text,
    chunk_count integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_project_document_hash UNIQUE(project_id, sha256)
);
CREATE INDEX IF NOT EXISTS ix_source_documents_project_id ON source_documents(project_id);
CREATE INDEX IF NOT EXISTS ix_source_documents_user_id ON source_documents(user_id);

CREATE TABLE IF NOT EXISTS document_chunks (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    document_id uuid NOT NULL REFERENCES source_documents(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    chunk_index integer NOT NULL,
    content text NOT NULL,
    token_count integer NOT NULL,
    embedding_model varchar(120) NOT NULL,
    embedding extensions.vector(768) NOT NULL,
    chunk_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_document_chunk_index UNIQUE(document_id, chunk_index)
);
CREATE INDEX IF NOT EXISTS ix_document_chunks_project_user ON document_chunks(project_id, user_id);
CREATE INDEX IF NOT EXISTS ix_document_chunks_embedding_hnsw
    ON document_chunks USING hnsw (embedding extensions.vector_cosine_ops);

CREATE TABLE IF NOT EXISTS chat_sessions (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title varchar(240) NOT NULL DEFAULT 'New chat',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_chat_sessions_project_user ON chat_sessions(project_id, user_id);

CREATE TABLE IF NOT EXISTS chat_messages (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role varchar(24) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content text NOT NULL,
    sources jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_chat_messages_session_created ON chat_messages(session_id, created_at);

CREATE TABLE IF NOT EXISTS flashcards (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    question text NOT NULL,
    answer text NOT NULL,
    mastered boolean NOT NULL DEFAULT false,
    source_document_id uuid REFERENCES source_documents(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_flashcards_project_user ON flashcards(project_id, user_id);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    question text NOT NULL,
    options jsonb NOT NULL,
    correct_answer text NOT NULL,
    question_type varchar(24) NOT NULL DEFAULT 'mcq',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_quiz_questions_project_user ON quiz_questions(project_id, user_id);

CREATE TABLE IF NOT EXISTS approval_requests (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    thread_id varchar(128) NOT NULL,
    session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason text NOT NULL,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    status approval_status NOT NULL DEFAULT 'pending',
    decided_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    decision_note text,
    decided_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_approval_requests_user_status ON approval_requests(user_id, status);

CREATE TABLE IF NOT EXISTS integration_jobs (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    integration varchar(64) NOT NULL DEFAULT 'document_processing',
    document_id uuid NOT NULL REFERENCES source_documents(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    idempotency_key varchar(128) NOT NULL UNIQUE,
    status integration_processing_status NOT NULL DEFAULT 'pending',
    attempts integer NOT NULL DEFAULT 0,
    last_error text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_integration_jobs_user_id ON integration_jobs(user_id);

CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    action varchar(160) NOT NULL,
    resource_type varchar(80) NOT NULL,
    resource_id varchar(128) NOT NULL,
    outcome varchar(32) NOT NULL,
    details jsonb NOT NULL DEFAULT '{}'::jsonb,
    request_id varchar(128),
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_audit_logs_actor_created ON audit_logs(actor_id, created_at DESC);

CREATE TABLE IF NOT EXISTS chat_runs (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status varchar(32) NOT NULL,
    latency_ms double precision NOT NULL,
    prompt_tokens integer NOT NULL DEFAULT 0,
    completion_tokens integer NOT NULL DEFAULT 0,
    estimated_cost_usd double precision NOT NULL DEFAULT 0,
    retrieved_count integer NOT NULL DEFAULT 0,
    retrieval_hit boolean NOT NULL DEFAULT false,
    grounded boolean NOT NULL DEFAULT false,
    trace_id varchar(64),
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_chat_runs_created_at ON chat_runs(created_at DESC);

CREATE OR REPLACE FUNCTION public.match_document_chunks(
    query_embedding extensions.vector(768),
    target_project_id uuid,
    target_user_id uuid,
    match_count integer DEFAULT 6,
    min_similarity double precision DEFAULT 0.0
)
RETURNS TABLE (
    chunk_id uuid,
    document_id uuid,
    filename varchar,
    content text,
    similarity double precision,
    metadata jsonb
)
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public, extensions
AS $$
    SELECT c.id, c.document_id, d.filename, c.content,
           1 - (c.embedding <=> query_embedding) AS similarity,
           c.chunk_metadata
    FROM document_chunks c
    JOIN source_documents d ON d.id = c.document_id
    WHERE c.project_id = target_project_id
      AND c.user_id = target_user_id
      AND 1 - (c.embedding <=> query_embedding) >= min_similarity
    ORDER BY c.embedding <=> query_embedding
    LIMIT LEAST(GREATEST(match_count, 1), 50)
$$;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_runs ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'projects', 'source_documents', 'document_chunks', 'chat_sessions', 'chat_messages',
    'flashcards', 'quiz_questions', 'approval_requests', 'integration_jobs', 'chat_runs'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', table_name);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())',
      table_name
    );
  END LOOP;
END $$;
DROP POLICY IF EXISTS profile_self_access ON profiles;
CREATE POLICY profile_self_access ON profiles FOR ALL USING (id = auth.uid()) WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS audit_self_read ON audit_logs;
CREATE POLICY audit_self_read ON audit_logs FOR SELECT USING (actor_id = auth.uid());
