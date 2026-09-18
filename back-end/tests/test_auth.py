import pytest

from app.core.config import Settings
from app.services.auth import hash_password, verify_password


def test_password_hash_round_trip_and_random_salts() -> None:
    first = hash_password("a-long-test-password")
    second = hash_password("a-long-test-password")
    assert first != second
    assert verify_password("a-long-test-password", first)
    assert not verify_password("wrong-password", first)
    assert not verify_password("anything", "invalid")


@pytest.mark.parametrize("environment", ["staging", "production"])
def test_deployed_environments_require_supabase_auth(environment: str) -> None:
    settings = Settings(
        environment=environment,
        auth_mode="local",
        local_jwt_secret="test-secret-with-at-least-32-characters",
    )

    with pytest.raises(ValueError, match="must use Supabase"):
        settings.validate_runtime()


def test_production_requires_openai_api_key() -> None:
    settings = Settings(
        _env_file=None,
        environment="production",
        auth_mode="supabase",
        supabase_url="https://example.supabase.co",
        supabase_publishable_key="test-publishable-key",
        openai_api_key=None,
    )

    with pytest.raises(ValueError, match="OPENAI_API_KEY"):
        settings.validate_runtime()
