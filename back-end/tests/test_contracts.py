from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def test_database_migration_enables_vector_search_and_rls() -> None:
    migration = (ROOT / "back-end/migrations/001_initial.sql").read_text()
    assert "CREATE EXTENSION IF NOT EXISTS vector" in migration
    assert "extensions.vector(768)" in migration
    assert "USING hnsw" in migration
    assert "ENABLE ROW LEVEL SECURITY" in migration
    assert "match_document_chunks" in migration


def test_delivery_assets_exist() -> None:
    expected = [
        ROOT / "back-end/Dockerfile",
        ROOT / "docker-compose.yml",
        ROOT / "render.yaml",
        ROOT / ".github/workflows/backend-ci.yml",
        ROOT / ".github/workflows/deploy-render.yml",
    ]
    assert all(path.is_file() for path in expected)


def test_openai_provider_and_vector_migration_are_configured() -> None:
    requirements = (ROOT / "back-end/requirements.txt").read_text()
    compose = (ROOT / "docker-compose.yml").read_text()
    retrieval = (ROOT / "back-end/app/services/retrieval.py").read_text()

    assert "openai>=2.0,<3" in requirements
    assert "google-genai" not in requirements
    assert "OPENAI_API_KEY" in compose
    assert "GEMINI_API_KEY" not in compose
    assert "embedding_model == self.settings.openai_embedding_model" in retrieval
    assert (ROOT / "back-end/app/db/reembed.py").is_file()
