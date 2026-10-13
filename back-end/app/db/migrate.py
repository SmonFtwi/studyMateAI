import asyncio
from pathlib import Path

import asyncpg

from app.core.config import get_settings

MIGRATIONS = Path(__file__).resolve().parents[2] / "migrations"


async def migrate() -> None:
    settings = get_settings()
    connection = await asyncpg.connect(settings.checkpoint_database_url)
    try:
        async with connection.transaction():
            for path in sorted(MIGRATIONS.glob("*.sql")):
                await connection.execute(path.read_text(encoding="utf-8"))
    finally:
        await connection.close()


if __name__ == "__main__":
    asyncio.run(migrate())
