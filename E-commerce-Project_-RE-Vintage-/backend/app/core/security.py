from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_access_token(subject: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_MINUTES)
    return jwt.encode({"sub": subject, "exp": exp}, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_state_token(payload: dict) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=10)
    return jwt.encode({**payload, "exp": exp, "typ": "oauth_state"}, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_state_token(token: str) -> dict | None:
    try:
        data = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None
    return data if data.get("typ") == "oauth_state" else None


def decode_token(token: str) -> str | None:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])["sub"]
    except jwt.PyJWTError:
        return None
