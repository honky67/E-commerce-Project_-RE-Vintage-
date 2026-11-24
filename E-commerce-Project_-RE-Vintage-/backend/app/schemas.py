import enum
import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models import ConditionGrade, MediaType, UserRole, VinylBadgeStatus


class Category(str, enum.Enum):
    RECORDS = "RECORDS"
    APPAREL = "APPAREL"
    TURNTABLES = "TURNTABLES"


CATEGORY_TO_MEDIA = {Category.RECORDS: MediaType.VINYL, Category.APPAREL: MediaType.APPAREL, Category.TURNTABLES: MediaType.TURNTABLE}


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
    location: str | None = Field(None, max_length=200)


class ShopOut(ORM):
    item_count: int = 0
    id: uuid.UUID
    owner_id: uuid.UUID
    shop_name: str
    slug: str
    bio: str | None
    location: str | None = None
    rating: float | None = None
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
    description: str = Field("", max_length=5000)
    specs: str | None = Field(None, description="JSON-encoded list of {label, value} pairs")


class ProductOut(ORM):
    id: uuid.UUID
    shop_id: uuid.UUID
    title: str
    artist_brand: str
    price: Decimal
    condition_grade: ConditionGrade
    stock_quantity: int
    media_type: MediaType
    image_url: str | None = None
    description: str = ""
    specs: str | None = None

    @field_validator("image_url", mode="before")
    @classmethod
    def normalize_image_url(cls, v: str | None) -> str | None:
        if not v:
            return None
        if "/uploads/" in v:
            return v[v.find("/uploads/"):]
        if "/products/" in v:
            return v[v.find("/products/"):]
        return v


class CatalogProduct(ProductOut):
    shop_name: str
    shop_slug: str


class CheckoutItem(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(1, ge=1)
    option: str | None = None


class CheckoutRequest(BaseModel):
    items: list[CheckoutItem]
    full_name: str | None = Field(None, min_length=1, max_length=200)
    address: str | None = Field(None, min_length=1, max_length=500)
    city: str | None = Field(None, min_length=1, max_length=200)
    phone: str | None = Field(None, min_length=1, max_length=50)
    payment_method: str = Field("COD", min_length=1, max_length=50)
    shipping_address: str | None = Field(None, max_length=500)

    @field_validator("full_name", "address", "city", "phone", "payment_method")
    @classmethod
    def trim_shipping_fields(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Shipping details cannot be empty")
        return value


class OrderStatusUpdate(BaseModel):
    status: str = Field(pattern="^(pending|shipped|delivered)$")


class OrderItemOut(ORM):
    id: uuid.UUID
    product_id: uuid.UUID | None = None
    title: str
    price: Decimal
    quantity: int
    option: str | None = None
    image_url: str | None = None


class OrderOut(ORM):
    id: uuid.UUID
    user_id: uuid.UUID
    total_price: Decimal
    status: str
    shipping_address: str | None = None
    full_name: str | None = None
    address: str | None = None
    city: str | None = None
    phone: str | None = None
    payment_method: str = "COD"
    created_at: datetime
    items: list[OrderItemOut]
