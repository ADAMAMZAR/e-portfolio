"""
JWT-based single-admin authentication.
"""
import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt.exceptions import InvalidTokenError
from passlib.hash import argon2
from pydantic import BaseModel

load_dotenv()

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 hours

bearer_scheme = HTTPBearer()


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_secret() -> str:
    secret = os.environ.get("JWT_SECRET")
    if not secret:
        raise RuntimeError("JWT_SECRET env var is not set")
    return secret


def _get_password_hash() -> str:
    h = os.environ.get("ADMIN_PASSWORD_HASH")
    if not h:
        raise RuntimeError("ADMIN_PASSWORD_HASH env var is not set")
    return h


def verify_password(plain: str) -> bool:
    return argon2.verify(plain, _get_password_hash())


def create_access_token() -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": "admin", "exp": expire}
    return jwt.encode(payload, _get_secret(), algorithm=ALGORITHM)


# ---------------------------------------------------------------------------
# FastAPI dependency
# ---------------------------------------------------------------------------

def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    """Dependency that validates the JWT and returns 'admin'."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, _get_secret(), algorithms=[ALGORITHM])
        sub: str = payload.get("sub")
        if sub != "admin":
            raise InvalidTokenError("bad subject")
        return sub
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
