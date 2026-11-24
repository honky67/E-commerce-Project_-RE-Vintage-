import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile

from app.core.config import settings

# Served at /uploads. Created on startup if missing.
UPLOAD_DIR = Path(settings.UPLOAD_DIR) if settings.UPLOAD_DIR else Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_BYTES = 5 * 1024 * 1024
EXT = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}


def sniff_type(head: bytes) -> str | None:
    """Detect the real format from the file's magic bytes (a renamed .exe or a spoofed content-type fails)."""
    if head.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "image/webp"
    return None


async def save_image(file: UploadFile) -> str:
    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Image must be 5 MB or smaller")
    mime = sniff_type(data[:12])
    if not mime:
        raise HTTPException(415, "Only JPG, PNG or WebP images are allowed")
    name = f"{uuid.uuid4().hex}{EXT[mime]}"
    (UPLOAD_DIR / name).write_bytes(data)
    return f"/uploads/{name}"


def delete_image(url: str | None) -> None:
    if url and "/uploads/" in url:
        name = url.split("/uploads/")[-1]
        (UPLOAD_DIR / Path(name).name).unlink(missing_ok=True)
