from functools import lru_cache
from typing import Annotated, Literal

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "StudyMate AI API"
    environment: Literal["local", "test", "staging", "production"] = "local"
    api_port: int = 3005
    log_level: str = "INFO"
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:3000"]
    )

    database_url: str = "postgresql+asyncpg://studymate:studymate@db:5432/studymate"
    database_pool_size: int = 10
    database_max_overflow: int = 20

    auth_mode: Literal["supabase", "local"] = "local"
    supabase_url: str | None = None
    supabase_publishable_key: str | None = None
    local_jwt_secret: str = Field(
        default="change-me-in-local-env",
        validation_alias=AliasChoices("LOCAL_JWT_SECRET", "JWT_SECRET"),
    )
    access_token_ttl_minutes: int = 60 * 24 * 7

    openai_api_key: str | None = None
    openai_chat_model: str = "gpt-5-nano"
    openai_embedding_model: str = "text-embedding-3-small"
    openai_reasoning_effort: Literal["low", "medium", "high", "xhigh", "max"] = "low"
    embedding_dimensions: int = 768
    llm_input_cost_per_million_usd: float = 0.05
    llm_output_cost_per_million_usd: float = 0.40

    retrieval_top_k: int = 6
    retrieval_min_similarity: float = 0.45
    chunk_size_chars: int = 1400
    chunk_overlap_chars: int = 220
    max_upload_bytes: int = 20 * 1024 * 1024
    document_processing_attempts: int = 3

    human_approval_enabled: bool = True
    metrics_bearer_token: str | None = None
    otel_exporter_otlp_endpoint: str | None = None
    otel_service_name: str = "studymate-api"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [part.strip() for part in value.split(",") if part.strip()]
        return value

    @field_validator("database_url")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+asyncpg://", 1)
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+asyncpg://", 1)
        return value

    @property
    def checkpoint_database_url(self) -> str:
        return self.database_url.replace("postgresql+asyncpg://", "postgresql://", 1)

    def validate_runtime(self) -> None:
        if self.environment in {"staging", "production"} and self.auth_mode != "supabase":
            raise ValueError("Staging and production must use Supabase authentication")
        if self.auth_mode == "supabase" and not (
            self.supabase_url and self.supabase_publishable_key
        ):
            raise ValueError(
                "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required in Supabase auth mode"
            )
        if self.environment in {"staging", "production"} and not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY is required in staging and production")
        if self.auth_mode == "local" and self.local_jwt_secret == "change-me-in-local-env":
            if self.environment != "test":
                raise ValueError("Set LOCAL_JWT_SECRET before using local authentication")


@lru_cache
def get_settings() -> Settings:
    return Settings()
