import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models import ConditionGrade, MediaType, UserRole, VinylBadgeStatus


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def within_bcrypt_limit(cls, v: str) -> str:
        if len(v.encode()) > 72:
            raise ValueError("Password must be at most 72 bytes")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(ORM):
    id: uuid.UUID
    email: EmailStr
    role: UserRole


class Token(ORM):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ShopCreate(BaseModel):
    shop_name: str = Field(min_length=2, max_length=120)
    bio: str | None = Field(None, max_length=2000)


class ShopOut(ORM):
    id: uuid.UUID
    owner_id: uuid.UUID
    shop_name: str
    slug: str
    bio: str | None
    vinyl_badge_status: VinylBadgeStatus


class BadgeUpdate(BaseModel):
    vinyl_badge_status: VinylBadgeStatus


class ProductCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    artist_brand: str = Field(min_length=1, max_length=255)
    price: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    condition_grade: ConditionGrade
    stock_quantity: int = Field(1, ge=0)
    media_type: MediaType


class ProductOut(ORM):
    id: uuid.UUID
    shop_id: uuid.UUID
    title: str
    artist_brand: str
    price: Decimal
    condition_grade: ConditionGrade
    stock_quantity: int
    media_type: MediaType
