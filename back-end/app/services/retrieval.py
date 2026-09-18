import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.core.metrics import RETRIEVAL_REQUESTS
from app.db.models import DocumentChunk, SourceDocument
from app.schemas import RetrievedSource
from app.services.llm import OpenAIService


class RetrievalService:
    def __init__(self, settings: Settings, llm: OpenAIService) -> None:
        self.settings = settings
        self.llm = llm

    async def search(
        self,
        db: AsyncSession,
        *,
        query: str,
        project_id: uuid.UUID,
        user_id: uuid.UUID,
        top_k: int | None = None,
    ) -> list[RetrievedSource]:
        vector = await self.llm.embed_query(query)
        distance = DocumentChunk.embedding.cosine_distance(vector).label("distance")
        statement = (
            select(DocumentChunk, SourceDocument.filename, distance)
            .join(SourceDocument, SourceDocument.id == DocumentChunk.document_id)
            .where(
                DocumentChunk.project_id == project_id,
                DocumentChunk.user_id == user_id,
                DocumentChunk.embedding_model == self.settings.openai_embedding_model,
            )
            .order_by(distance)
            .limit(top_k or self.settings.retrieval_top_k)
        )
        rows = (await db.execute(statement)).all()
        sources = [
            RetrievedSource(
                chunk_id=str(chunk.id),
                document_id=str(chunk.document_id),
                filename=filename,
                content=chunk.content,
                score=max(0.0, min(1.0, 1.0 - float(row_distance))),
                metadata=chunk.chunk_metadata,
            )
            for chunk, filename, row_distance in rows
        ]
        hit = bool(sources and sources[0].score >= self.settings.retrieval_min_similarity)
        RETRIEVAL_REQUESTS.labels(str(hit).lower()).inc()
        return sources

    async def project_context(
        self, db: AsyncSession, *, project_id: uuid.UUID, user_id: uuid.UUID, limit: int = 12
    ) -> str:
        statement = (
            select(DocumentChunk.content)
            .where(DocumentChunk.project_id == project_id, DocumentChunk.user_id == user_id)
            .order_by(DocumentChunk.created_at)
            .limit(limit)
        )
        return "\n\n".join((await db.scalars(statement)).all())


def format_context(sources: list[RetrievedSource]) -> str:
    return "\n\n".join(
        f"[S{index}] File: {source.filename}\n{source.content}"
        for index, source in enumerate(sources, start=1)
    )


def public_sources(sources: list[RetrievedSource]) -> list[dict]:
    return [
        {
            "label": f"Source {index}",
            "score": round(source.score, 4),
            "metadata": {
                **source.metadata,
                "chunk_id": source.chunk_id,
                "document_id": source.document_id,
                "filename": source.filename,
            },
        }
        for index, source in enumerate(sources, start=1)
    ]
