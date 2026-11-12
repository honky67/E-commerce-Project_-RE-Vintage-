import uuid

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.session import get_db
from app.models import User, UserRole

bearer = HTTPBearer(auto_error=False)


async def current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    sub = decode_token(creds.credentials) if creds else None
    user = await db.get(User, uuid.UUID(sub)) if sub else None
    if not user:
        raise HTTPException(401, "Not authenticated")
    return user


async def require_admin(user: User = Depends(current_user)) -> User:
    if user.role != UserRole.ADMIN:
        raise HTTPException(403, "Admin only")
    return user
