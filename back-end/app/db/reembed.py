import asyncio

from sqlalchemy import select

from app.core.config import get_settings
from app.db.models import DocumentChunk
from app.db.session import SessionFactory, engine
from app.services.llm import OpenAIService


async def reembed_stale_chunks(batch_size: int = 20) -> int:
    """Replace vectors created by another provider without needing original uploads."""
    settings = get_settings()
    llm = OpenAIService(settings)
    updated = 0

    try:
        async with SessionFactory() as db:
            while True:
                chunks = (
                    await db.scalars(
                        select(DocumentChunk)
                        .where(DocumentChunk.embedding_model != settings.openai_embedding_model)
                        .order_by(DocumentChunk.created_at, DocumentChunk.id)
                        .limit(batch_size)
                    )
                ).all()
                if not chunks:
                    break

                vectors = await llm.embed_documents([chunk.content for chunk in chunks])
                for chunk, vector in zip(chunks, vectors, strict=True):
                    chunk.embedding = vector
                    chunk.embedding_model = settings.openai_embedding_model
                await db.commit()
                updated += len(chunks)
                print(f"Re-embedded {updated} document chunks")
    finally:
        await llm.close()

    return updated


async def main() -> None:
    try:
        updated = await reembed_stale_chunks()
        print(f"OpenAI embedding migration complete: {updated} chunks updated")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
