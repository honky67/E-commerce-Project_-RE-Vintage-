import secrets
from urllib.parse import quote, urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.oauth import Profile, Provider, fetch_profile, get_provider
from app.core.security import create_access_token, create_state_token, decode_state_token, hash_password
from app.db.session import get_db
from app.models import User

router = APIRouter(prefix="/auth/oauth", tags=["oauth"])
NAMES = ("google", "facebook", "instagram")


def _provider(name: str) -> Provider:
    p = get_provider(name)
    if not p:
        raise HTTPException(404, "Unknown provider")
    return p


def _safe_next(n: str | None) -> str:
    return n if n and n.startswith("/") and not n.startswith("//") else "/"


def _public_base(request: Request) -> str:
    """The URL the browser used (works behind the Next.js proxy and on any VM IP)."""
    if settings.APP_URL:
        return settings.APP_URL.rstrip("/")
    host = (request.headers.get("x-forwarded-host") or request.headers["host"]).split(",")[0].strip()
    proto = (request.headers.get("x-forwarded-proto") or request.url.scheme).split(",")[0].strip()
    return f"{proto}://{host}"


def _fail(reason: str) -> RedirectResponse:
    return RedirectResponse(f"{settings.APP_URL or ''}/login?error={reason}", status_code=302)


@router.get("/providers")
async def providers() -> dict[str, str]:
    """'live' = real OAuth keys set, 'demo' = built-in demo flow (development only), 'off' = unavailable."""
    demo = settings.APP_ENV == "development"
    return {n: "live" if get_provider(n).configured else ("demo" if demo else "off") for n in NAMES}  # type: ignore[union-attr]


@router.get("/{provider}/start")
async def start(provider: str, request: Request, next: str = "/"):
    p = _provider(provider)
    state = create_state_token({"p": provider, "n": _safe_next(next)})
    if not p.configured:
        if settings.APP_ENV != "development":
            raise HTTPException(503, f"{provider} login is not configured")
        return RedirectResponse(f"/api/auth/oauth/{provider}/callback?demo=1&state={state}", status_code=302)
    query = urlencode(
        {
            "client_id": p.client_id,
            "redirect_uri": f"{_public_base(request)}/api/auth/oauth/{provider}/callback",
            "response_type": "code",
            "scope": p.scope,
            "state": state,
        }
    )
    return RedirectResponse(f"{p.authorize_url}?{query}", status_code=302)


@router.get("/{provider}/callback")
async def callback(
    provider: str,
    request: Request,
    state: str,
    code: str | None = None,
    demo: int = 0,
    error: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    p = _provider(provider)
    data = decode_state_token(state)
    if not data or data.get("p") != provider:
        raise HTTPException(400, "Invalid or expired login state")
    if error or not (code or demo):
        return _fail("oauth_cancelled")

    if demo:
        if p.configured or settings.APP_ENV != "development":
            raise HTTPException(400, "Demo login is unavailable")
        profile = Profile(sub=f"demo-{provider}", email=f"{provider}.demo@revintage.demo", name=f"{provider.title()} Demo")
    else:
        try:
            profile = await fetch_profile(p, code or "", f"{_public_base(request)}/api/auth/oauth/{provider}/callback")
        except (httpx.HTTPError, KeyError, ValueError):
            return _fail("oauth_failed")

    # Accounts are matched by email; providers that return none (Instagram) get a stable placeholder address.
    email = (profile.email or f"{provider}-{profile.sub}@oauth.revintage.demo").lower()
    user = await db.scalar(select(User).where(User.email == email))
    if not user:
        user = User(email=email, hashed_password=hash_password(secrets.token_urlsafe(32)))
        db.add(user)
        await db.commit()
    token = create_access_token(str(user.id))
    return RedirectResponse(f"{settings.APP_URL or ''}/auth/callback#token={token}&next={quote(data['n'])}", status_code=302)
