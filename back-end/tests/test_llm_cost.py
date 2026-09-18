from types import SimpleNamespace
from unittest.mock import AsyncMock

from app.core.config import Settings
from app.services.llm import OpenAIService


def test_cost_is_calculated_from_configured_token_rates() -> None:
    settings = Settings(
        _env_file=None,
        environment="test",
        auth_mode="local",
        local_jwt_secret="test-only-secret-with-at-least-32-characters",
        llm_input_cost_per_million_usd=1.0,
        llm_output_cost_per_million_usd=2.0,
    )
    service = OpenAIService(settings)
    result = service._usage_result(
        "answer", SimpleNamespace(input_tokens=1_000, output_tokens=500)
    )
    assert result.prompt_tokens == 1_000
    assert result.output_tokens == 500
    assert result.estimated_cost_usd == 0.002


async def test_embedding_uses_openai_model_and_configured_dimensions() -> None:
    settings = Settings(
        _env_file=None,
        environment="test",
        auth_mode="local",
        local_jwt_secret="test-only-secret-with-at-least-32-characters",
        openai_api_key="test-key",
        embedding_dimensions=3,
    )
    service = OpenAIService(settings)
    create = AsyncMock(
        return_value=SimpleNamespace(
            data=[SimpleNamespace(index=0, embedding=[3.0, 4.0, 0.0])]
        )
    )
    service.client = SimpleNamespace(embeddings=SimpleNamespace(create=create))

    vector = await service.embed_query("What is mitosis?")

    assert vector == [0.6, 0.8, 0.0]
    create.assert_awaited_once_with(
        model="text-embedding-3-small",
        input=["What is mitosis?"],
        dimensions=3,
        encoding_format="float",
    )
