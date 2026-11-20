from dataclasses import dataclass

import httpx

from app.core.config import settings


@dataclass(frozen=True)
class Provider:
    name: str
    authorize_url: str
    token_url: str
    userinfo_url: str
    scope: str
    client_id: str | None
    client_secret: str | None
    bearer: bool = False  # send the token as a Bearer header (otherwise as ?access_token=)

    @property
    def configured(self) -> bool:
        return bool(self.client_id and self.client_secret)


@dataclass(frozen=True)
class Profile:
    sub: str
    email: str | None
    name: str | None


def get_provider(name: str) -> Provider | None:
    table = {
        "google": Provider(
            "google",
            "https://accounts.google.com/o/oauth2/v2/auth",
            "https://oauth2.googleapis.com/token",
            "https://openidconnect.googleapis.com/v1/userinfo",
            "openid email profile",
            settings.GOOGLE_CLIENT_ID,
            settings.GOOGLE_CLIENT_SECRET,
            bearer=True,
        ),
        "facebook": Provider(
            "facebook",
            "https://www.facebook.com/v19.0/dialog/oauth",
            "https://graph.facebook.com/v19.0/oauth/access_token",
            "https://graph.facebook.com/me?fields=id,name,email",
            "email,public_profile",
            settings.FACEBOOK_CLIENT_ID,
            settings.FACEBOOK_CLIENT_SECRET,
        ),
        # Meta only offers Instagram login for professional (business/creator) accounts and returns no email.
        "instagram": Provider(
            "instagram",
            "https://api.instagram.com/oauth/authorize",
            "https://api.instagram.com/oauth/access_token",
            "https://graph.instagram.com/me?fields=user_id,username",
            "instagram_business_basic",
            settings.INSTAGRAM_CLIENT_ID,
            settings.INSTAGRAM_CLIENT_SECRET,
        ),
    }
    return table.get(name)


async def fetch_profile(p: Provider, code: str, redirect_uri: str) -> Profile:
    """Exchange the authorization code for a token and read the user's profile. Raises httpx.HTTPError / KeyError."""
    async with httpx.AsyncClient(timeout=10) as client:
        tok = await client.post(
            p.token_url,
            data={
                "client_id": p.client_id,
                "client_secret": p.client_secret,
                "code": code,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        tok.raise_for_status()
        access = tok.json()["access_token"]
        info = await client.get(
            p.userinfo_url,
            headers={"Authorization": f"Bearer {access}"} if p.bearer else None,
            params=None if p.bearer else {"access_token": access},
        )
        info.raise_for_status()
        d = info.json()
    email = d.get("email") if d.get("email_verified", True) else None  # never trust an unverified email
    return Profile(sub=str(d.get("sub") or d.get("id") or d["user_id"]), email=email, name=d.get("name") or d.get("username"))
