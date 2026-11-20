import enum
import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.shop import Shop


class ConditionGrade(enum.StrEnum):
    MINT = "Mint"
    VG_PLUS = "VG+"
    VG = "VG"
    FAIR = "Fair"


class MediaType(enum.StrEnum):
    VINYL = "vinyl"
    APPAREL = "apparel"
    TURNTABLE = "turntable"


class Product(BaseModel):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("price >= 0", name="price_non_negative"),
        CheckConstraint("stock_quantity >= 0", name="stock_non_negative"),
    )

    shop_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("shops.id", ondelete="CASCADE"),
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), index=True)
    artist_brand: Mapped[str] = mapped_column(String(255), index=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    condition_grade: Mapped[ConditionGrade] = mapped_column(
        Enum(
            ConditionGrade,
            name="condition_grade",
            values_callable=lambda e: [m.value for m in e],
        ),
    )
    stock_quantity: Mapped[int] = mapped_column(default=1, server_default="1")
    media_type: Mapped[MediaType] = mapped_column(
        Enum(
            MediaType,
            name="media_type",
            values_callable=lambda e: [m.value for m in e],
        ),
        index=True,
    )

    description: Mapped[str] = mapped_column(Text, default="", server_default="")
    specs: Mapped[str | None] = mapped_column(Text)  # JSON-encoded list of {label, value} pairs
    image_url: Mapped[str | None] = mapped_column(String(500))  # "/uploads/<file>" or "/products/<file>"

    shop: Mapped["Shop"] = relationship(back_populates="products", lazy="raise")
