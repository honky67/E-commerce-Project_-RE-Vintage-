import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.product import Product
    from app.models.user import User


class VinylBadgeStatus(enum.StrEnum):
    NONE = "none"
    PENDING = "pending"
    VERIFIED = "verified"
    REVOKED = "revoked"


class Shop(BaseModel):
    __tablename__ = "shops"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
    )
    shop_name: Mapped[str] = mapped_column(String(120))
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True)
    bio: Mapped[str | None] = mapped_column(Text)
    vinyl_badge_status: Mapped[VinylBadgeStatus] = mapped_column(
        Enum(
            VinylBadgeStatus,
            name="vinyl_badge_status",
            values_callable=lambda e: [m.value for m in e],
        ),
        default=VinylBadgeStatus.NONE,
        server_default=VinylBadgeStatus.NONE.value,
    )

    owner: Mapped["User"] = relationship(back_populates="shops", lazy="raise")
    products: Mapped[list["Product"]] = relationship(
        back_populates="shop",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="raise",
    )