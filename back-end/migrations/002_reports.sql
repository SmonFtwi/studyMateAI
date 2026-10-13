CREATE TABLE IF NOT EXISTS reports (
 id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
 project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 user_id uuid NOT NULL,
 title varchar(240) NOT NULL,
 content text NOT NULL,
 topic text NOT NULL DEFAULT '',
 selected_source_ids jsonb NOT NULL,
 sources jsonb NOT NULL,
 coverage jsonb NOT NULL,
 usage jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reports_owner_project ON reports(user_id, project_id, created_at);
CREATE TABLE IF NOT EXISTS report_runs (
 id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
 project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 user_id uuid NOT NULL,
 status varchar(32) NOT NULL,
 latency_ms double precision NOT NULL,
 usage jsonb NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS report_runs_owner_project ON report_runs(user_id, project_id, created_at);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON reports;
CREATE POLICY tenant_isolation ON reports FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS tenant_isolation ON report_runs;
CREATE POLICY tenant_isolation ON report_runs FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
