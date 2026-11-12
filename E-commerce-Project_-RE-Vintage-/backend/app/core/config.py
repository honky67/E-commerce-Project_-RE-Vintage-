from functools import lru_cache
from pathlib import Path

from pydantic import PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"  # backend/.env, whatever the working directory


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
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

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
