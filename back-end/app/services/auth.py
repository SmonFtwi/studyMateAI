import base64
import hashlib
import hmac
import os
import uuid
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any

import httpx
import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.core.errors import AuthenticationError, ValidationError
from app.db.models import Profile


@dataclass(frozen=True)
class AuthenticatedUser:
    id: uuid.UUID
    email: str
    name: str
    role: str


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.scrypt(
        password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1, dklen=64
    )
    encoded_salt = base64.urlsafe_b64encode(salt).decode()
    encoded_digest = base64.urlsafe_b64encode(digest).decode()
    return f"scrypt$16384$8$1${encoded_salt}${encoded_digest}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, n, r, p, salt_value, digest_value = encoded.split("$")
        if algorithm != "scrypt":
            return False
        salt = base64.urlsafe_b64decode(salt_value.encode())
        expected = base64.urlsafe_b64decode(digest_value.encode())
        actual = hashlib.scrypt(
            password.encode("utf-8"),
            salt=salt,
            n=int(n),
            r=int(r),
            p=int(p),
            dklen=len(expected),
        )
        return hmac.compare_digest(expected, actual)
    except (ValueError, TypeError):
        return False


class AuthService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def register(
        self, db: AsyncSession, *, email: str, password: str, name: str
    ) -> tuple[str | None, Profile]:
        normalized_email = email.strip().lower()
        existing = await db.scalar(select(Profile).where(Profile.email == normalized_email))
        if existing:
            raise ValidationError("Email already exists", code="email_exists")

        if self.settings.auth_mode == "supabase":
            payload = await self._supabase_request(
                "POST",
                "/auth/v1/signup",
                json={"email": normalized_email, "password": password, "data": {"name": name}},
            )
            remote_user = payload.get("user") or {}
            if not remote_user.get("id"):
                raise AuthenticationError("Supabase did not return a user")
            user_id = uuid.UUID(remote_user["id"])
            token = payload.get("access_token")
            password_hash = None
        else:
            user_id = uuid.uuid4()
            token = self._create_local_token(user_id, normalized_email)
            password_hash = hash_password(password)

        profile = Profile(
            id=user_id,
            email=normalized_email,
            name=name,
            password_hash=password_hash,
            role="student",
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        return token, profile

    async def login(self, db: AsyncSession, *, email: str, password: str) -> str:
        normalized_email = email.strip().lower()
        if self.settings.auth_mode == "supabase":
            payload = await self._supabase_request(
                "POST",
                "/auth/v1/token?grant_type=password",
                json={"email": normalized_email, "password": password},
            )
            token = payload.get("access_token")
            if not token:
                raise AuthenticationError("Invalid email or password")
            return str(token)

        profile = await db.scalar(select(Profile).where(Profile.email == normalized_email))
        if (
            not profile
            or not profile.password_hash
            or not verify_password(password, profile.password_hash)
        ):
            raise AuthenticationError("Invalid email or password")
        return self._create_local_token(profile.id, profile.email)

    async def authenticate(self, db: AsyncSession, token: str) -> AuthenticatedUser:
        if self.settings.auth_mode == "supabase":
            payload = await self._supabase_request("GET", "/auth/v1/user", token=token)
            user_id_value = payload.get("id")
            email = payload.get("email")
            if not user_id_value or not email:
                raise AuthenticationError("Invalid or expired token")
            user_id = uuid.UUID(user_id_value)
            metadata: dict[str, Any] = payload.get("user_metadata") or {}
        else:
            try:
                claims = jwt.decode(
                    token,
                    self.settings.local_jwt_secret,
                    algorithms=["HS256"],
                    options={"require": ["exp", "sub"]},
                )
                user_id = uuid.UUID(claims["sub"])
                email = claims.get("email", "")
                metadata = {}
            except (jwt.PyJWTError, ValueError, KeyError) as exc:
                raise AuthenticationError("Invalid or expired token") from exc

        profile = await db.get(Profile, user_id)
        if profile is None:
            profile = Profile(
                id=user_id,
                email=email.lower(),
                name=str(metadata.get("name") or email.split("@", 1)[0]),
                role="student",
            )
            db.add(profile)
            await db.commit()
            await db.refresh(profile)
        return AuthenticatedUser(profile.id, profile.email, profile.name, profile.role)

    def _create_local_token(self, user_id: uuid.UUID, email: str) -> str:
        now = datetime.now(UTC)
        return jwt.encode(
            {
                "sub": str(user_id),
                "email": email,
                "iat": now,
                "exp": now + timedelta(minutes=self.settings.access_token_ttl_minutes),
                "iss": "studymate-local",
            },
            self.settings.local_jwt_secret,
            algorithm="HS256",
        )

    async def _supabase_request(
        self,
        method: str,
        path: str,
        *,
        json: dict[str, Any] | None = None,
        token: str | None = None,
    ) -> dict[str, Any]:
        if not self.settings.supabase_url or not self.settings.supabase_publishable_key:
            raise AuthenticationError("Supabase authentication is not configured")
        headers = {
            "apikey": self.settings.supabase_publishable_key,
            "Content-Type": "application/json",
        }
        if token:
            headers["Authorization"] = f"Bearer {token}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.request(
                    method,
                    f"{self.settings.supabase_url.rstrip('/')}{path}",
                    headers=headers,
                    json=json,
                )
            except httpx.HTTPError as exc:
                raise AuthenticationError("Authentication service is unavailable") from exc
        if response.status_code >= 400:
            detail = response.json().get("msg") if response.content else None
            raise AuthenticationError(detail or "Authentication failed")
        return response.json()
