from functools import lru_cache
from pathlib import Path

from pydantic import PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

def find_env_file() -> Path:
    backend_env = Path(__file__).resolve().parents[2] / ".env"
    if backend_env.is_file():
        return backend_env
    cwd_env = Path.cwd() / ".env"
    if cwd_env.is_file():
        return cwd_env
    cwd_backend_env = Path.cwd() / "backend" / ".env"
    if cwd_backend_env.is_file():
        return cwd_backend_env
    return backend_env


ENV_FILE = find_env_file()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # e.g. postgresql+asyncpg://user:pass@localhost:5432/vinyl_db
    DATABASE_URL: PostgresDsn

    DB_ECHO: bool = False
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800

    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_MINUTES: int = 60
    APP_ENV: str = "development"  # set to "production" to disable demo accounts
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"  # comma-separated
    # Development only: also allow localhost and private-network IPs (VM host-only / bridged adapters).
    CORS_ORIGIN_REGEX: str = (
        r"^https?://(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|"
        r"172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|[a-zA-Z0-9.-]+\.local):3000$"
    )
    APP_URL: str | None = None  # public site URL for OAuth redirects, e.g. http://192.168.56.10:3000 (auto-detected if empty)
    FRONTEND_URL: str | None = None  # Next.js origin; defaults to APP_URL, then auto-detected on port 3000
    UPLOAD_DIR: str | None = None  # defaults to backend/uploads

    # Optional social login keys. Without them, development mode uses a built-in demo flow.
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None
    FACEBOOK_CLIENT_ID: str | None = None
    FACEBOOK_CLIENT_SECRET: str | None = None
    INSTAGRAM_CLIENT_ID: str | None = None
    INSTAGRAM_CLIENT_SECRET: str | None = None

    @field_validator(
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "FACEBOOK_CLIENT_ID",
        "FACEBOOK_CLIENT_SECRET",
        "INSTAGRAM_CLIENT_ID",
        "INSTAGRAM_CLIENT_SECRET",
        "APP_URL",
        "FRONTEND_URL",
        mode="before",
    )
    @classmethod
    def strip_whitespace_and_quotes(cls, v: str | None) -> str | None:
        if isinstance(v, str):
            cleaned = v.strip().strip("'\"").strip()
            return cleaned if cleaned else None
        return v

    @property
    def cors_origins(self) -> list[str]:
        origins = [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]
        if self.FRONTEND_URL and self.FRONTEND_URL.strip():
            origins.append(self.FRONTEND_URL.strip().rstrip("/"))
        if self.APP_URL and self.APP_URL.strip():
            origins.append(self.APP_URL.strip().rstrip("/"))
        return list(dict.fromkeys(origins))

    @field_validator("DATABASE_URL")
    @classmethod
    def require_asyncpg_driver(cls, v: PostgresDsn) -> PostgresDsn:
        if v.scheme != "postgresql+asyncpg":
            raise ValueError("DATABASE_URL must use the 'postgresql+asyncpg' scheme")
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
