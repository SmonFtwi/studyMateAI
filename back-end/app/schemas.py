from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)
    name: str = Field(min_length=1, max_length=160)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        return " ".join(value.strip().split())


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenCheckRequest(BaseModel):
    token: str = Field(min_length=20)


class ProjectCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=240)
    description: str = Field(default="", max_length=4_000)


class ChatSessionCreateRequest(BaseModel):
    title: str = Field(default="New chat", min_length=1, max_length=240)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8_000)
    require_approval: bool = False


class ApprovalDecisionRequest(BaseModel):
    decision: Literal["approve", "reject"]
    note: str | None = Field(default=None, max_length=2_000)


class FlashcardSpec(BaseModel):
    question: str
    answer: str


class FlashcardSet(BaseModel):
    flashcards: list[FlashcardSpec] = Field(min_length=5, max_length=8)


class QuizQuestionSpec(BaseModel):
    question: str
    options: list[str] = Field(min_length=4, max_length=4)
    correct_answer: str


class QuizSet(BaseModel):
    questions: list[QuizQuestionSpec] = Field(min_length=5, max_length=5)


class RetrievedSource(BaseModel):
    chunk_id: str
    document_id: str
    filename: str
    content: str
    score: float
    metadata: dict[str, Any] = Field(default_factory=dict)


class LLMResult(BaseModel):
    text: str
    prompt_tokens: int = 0
    output_tokens: int = 0
    estimated_cost_usd: float = 0.0

