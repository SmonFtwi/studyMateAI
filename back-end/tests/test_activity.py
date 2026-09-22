import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.dependencies import get_current_user
from app.api.routes.operations import _chat_metrics, router
from app.db.session import get_db


async def test_personal_metrics_scope_every_query_and_empty_results():
    db = AsyncMock()
    db.execute.side_effect = [
        MagicMock(one=lambda: (0, 0, 0, 0, 0)),
        MagicMock(all=lambda: []),
        MagicMock(one=lambda: (0, 0)),
    ]
    db.scalars.return_value = MagicMock(all=lambda: [])
    user_id = uuid.uuid4()
    result = await _chat_metrics(db, hours=9999, user_id=user_id)
    assert result["scope"] == "personal"
    assert result["window_hours"] == 720
    assert result["requests"] == 0
    assert result["recent_runs"] == []
    for call in db.execute.call_args_list + db.scalars.call_args_list:
        statement = call.args[0].compile()
        assert "chat_runs.user_id =" in str(statement)
        assert user_id in statement.params.values()


@pytest.mark.parametrize("role,status", [("student", 403), ("admin", 200)])
def test_workspace_metrics_require_admin(role, status):
    app = FastAPI()
    app.include_router(router)
    db = AsyncMock()
    db.execute.side_effect = [
        MagicMock(one=lambda: (0, 0, 0, 0, 0)),
        MagicMock(all=lambda: []),
        MagicMock(one=lambda: (0, 0)),
    ]
    db.scalars.return_value = MagicMock(all=lambda: [])
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(role=role, id=uuid.uuid4())
    from fastapi.responses import JSONResponse

    from app.core.errors import StudyMateError

    @app.exception_handler(StudyMateError)
    async def handler(request, exc):
        return JSONResponse(status_code=exc.status_code, content={"error": exc.message})

    response = TestClient(app).get("/ops/metrics/summary")
    assert response.status_code == status
    if role == "student":
        db.execute.assert_not_called()
