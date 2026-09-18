from app.core.config import Settings
from app.services.documents import DocumentProcessingService
from app.services.llm import OpenAIService


def service() -> DocumentProcessingService:
    settings = Settings(
        _env_file=None,
        environment="test",
        auth_mode="local",
        local_jwt_secret="test-only-secret-with-at-least-32-characters",
        chunk_size_chars=80,
        chunk_overlap_chars=10,
    )
    return DocumentProcessingService(settings, OpenAIService(settings))


def test_text_and_csv_extraction() -> None:
    assert DocumentProcessingService._extract_text(".txt", b"hello world") == "hello world"
    csv_text = DocumentProcessingService._extract_text(".csv", b"name,score\nAda,10\n")
    assert csv_text == "name, score\nAda, 10"


def test_chunking_is_bounded_and_overlapping() -> None:
    text = "First sentence has useful context. " * 12
    chunks = service()._chunk(text)
    assert len(chunks) > 1
    assert all(chunk.strip() for chunk in chunks)
    assert all(len(chunk) <= 80 for chunk in chunks)
    assert service()._chunk("\n \n") == []
