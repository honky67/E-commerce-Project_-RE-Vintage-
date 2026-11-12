import enum
from typing import TYPE_CHECKING

from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.shop import Shop


class UserRole(enum.StrEnum):
    BUYER = "buyer"
    SELLER = "seller"
    ADMIN = "admin"


class User(BaseModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(
        Enum(
            UserRole,
            name="user_role",
            values_callable=lambda e: [m.value for m in e],
        ),
        default=UserRole.BUYER,
        server_default=UserRole.BUYER.value,
    )

    shops: Mapped[list["Shop"]] = relationship(
        back_populates="owner",
        lazy="raise",
    )
