from fastapi import APIRouter

from app.api.dependencies import AppSettings, DbSession
from app.schemas import LoginRequest, RegisterRequest, TokenCheckRequest
from app.services.auth import AuthService

router = APIRouter(prefix="/users", tags=["authentication"])


@router.post("/register", status_code=201)
async def register(payload: RegisterRequest, db: DbSession, settings: AppSettings) -> dict:
    token, profile = await AuthService(settings).register(
        db, email=str(payload.email), password=payload.password, name=payload.name
    )
    return {
        "message": (
            "User registered"
            if token
            else "User registered; confirm the email address before signing in"
        ),
        "token": token,
        "user": {"id": str(profile.id), "email": profile.email, "name": profile.name},
    }


@router.post("/login")
async def login(payload: LoginRequest, db: DbSession, settings: AppSettings) -> dict:
    token = await AuthService(settings).login(
        db, email=str(payload.email), password=payload.password
    )
    return {"token": token}


@router.post("/checkAuth")
async def check_auth(payload: TokenCheckRequest, db: DbSession, settings: AppSettings) -> dict:
    user = await AuthService(settings).authenticate(db, payload.token)
    return {
        "id": str(user.id),
        "name": user.name,
        "username": user.name,
        "email": user.email,
        "role": user.role,
        "profile_image": "",
    }
