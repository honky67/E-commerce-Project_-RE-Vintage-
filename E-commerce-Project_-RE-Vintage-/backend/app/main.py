import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.api.router import api_router
from app.core.config import settings
from app.core.storage import UPLOAD_DIR
from app.db.session import engine
from app.models import Base
from app.seed import seed_demo_users

log = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        # Dev convenience: create tables on startup. Use Alembic migrations in production.
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            # create_all never alters existing tables; this keeps older databases in sync until Alembic is added.
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT ''"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS specs TEXT"))
            await conn.execute(text("ALTER TABLE shops ADD COLUMN IF NOT EXISTS location VARCHAR(200)"))
            await conn.execute(text("ALTER TABLE shops ADD COLUMN IF NOT EXISTS rating FLOAT"))
            await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS full_name VARCHAR(200)"))
            await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS address VARCHAR(500)"))
            await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS city VARCHAR(200)"))
            await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone VARCHAR(50)"))
            await conn.execute(
                text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) NOT NULL DEFAULT 'COD'")
            )
            await conn.execute(text("ALTER TABLE order_items ALTER COLUMN title TYPE VARCHAR(255)"))
            # Normalize any legacy hardcoded image URLs in existing database records
            await conn.execute(
                text(
                    "UPDATE products SET image_url = SUBSTRING(image_url FROM '/uploads/.*') "
                    "WHERE image_url LIKE '%/uploads/%' AND image_url NOT LIKE '/uploads/%'"
                )
            )
    except Exception as exc:
        log.error("Cannot reach the database (%s). Run scripts/setup_db.sh and check backend/.env", type(exc).__name__)
        raise
    if settings.APP_ENV == "development":
        await seed_demo_users()
    yield
    await engine.dispose()


app = FastAPI(title="RE:VINTAGE API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX if settings.APP_ENV == "development" else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix="/api")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/health")
@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/health/db")
async def health_db():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(503, f"Database unavailable ({type(exc).__name__})")
    return {"db": "ok"}
