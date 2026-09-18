import asyncio
from pathlib import Path

import asyncpg

from app.core.config import get_settings

SQL_PATH = Path(__file__).resolve().parents[2] / "migrations" / "001_initial.sql"


async def migrate() -> None:
    settings = get_settings()
    connection = await asyncpg.connect(settings.checkpoint_database_url)
    try:
        await connection.execute(SQL_PATH.read_text(encoding="utf-8"))
    finally:
        await connection.close()


if __name__ == "__main__":
    asyncio.run(migrate())
