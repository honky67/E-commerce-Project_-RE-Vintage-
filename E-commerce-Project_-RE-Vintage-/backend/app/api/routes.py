import re
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user, require_admin
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models import Product, Shop, User, UserRole
from app.schemas import (BadgeUpdate, ProductCreate, ProductOut, ShopCreate, ShopOut, Token, UserCreate, UserLogin,
                         UserOut)

auth = APIRouter(prefix="/auth", tags=["auth"])
shops = APIRouter(prefix="/shops", tags=["shops"])
products = APIRouter(tags=["products"])
admin = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


# ---------- auth ----------
@auth.post("/register", response_model=Token, status_code=201)
async def register(body: UserCreate, db: AsyncSession = Depends(get_db)):
    user = User(email=body.email.lower(), hashed_password=hash_password(body.password))
    db.add(user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(409, "Email already registered")
    return Token(access_token=create_access_token(str(user.id)), user=user)


@auth.post("/login", response_model=Token)
async def login(body: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.email == body.email.lower()))
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password")
    return Token(access_token=create_access_token(str(user.id)), user=user)


@auth.get("/me", response_model=UserOut)
async def me(user: User = Depends(current_user)):
    return user


# ---------- shops ----------
def slugify(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "shop"


@shops.get("", response_model=list[ShopOut])
async def list_shops(db: AsyncSession = Depends(get_db)):
    return (await db.scalars(select(Shop).order_by(Shop.created_at.desc()))).all()


@shops.get("/mine", response_model=list[ShopOut])  # declared before /{slug}
async def my_shops(user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    return (await db.scalars(select(Shop).where(Shop.owner_id == user.id))).all()


@shops.get("/{slug}", response_model=ShopOut)
async def get_shop(slug: str, db: AsyncSession = Depends(get_db)):
    shop = await db.scalar(select(Shop).where(Shop.slug == slug))
    if not shop:
        raise HTTPException(404, "Shop not found")
    return shop


@shops.post("", response_model=ShopOut, status_code=201)
async def create_shop(body: ShopCreate, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    slug = slugify(body.shop_name)
    if await db.scalar(select(Shop.id).where(Shop.slug == slug)):
        slug = f"{slug}-{uuid.uuid4().hex[:4]}"
    shop = Shop(owner_id=user.id, shop_name=body.shop_name.strip(), slug=slug, bio=body.bio)
    if user.role == UserRole.BUYER:
        user.role = UserRole.SELLER  # launching a store makes you a seller
    db.add(shop)
    await db.commit()
    return shop


# ---------- products ----------
async def owned_shop(shop_id: uuid.UUID, user: User, db: AsyncSession) -> Shop:
    shop = await db.get(Shop, shop_id)
    if not shop:
        raise HTTPException(404, "Shop not found")
    if shop.owner_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(403, "Not your shop")
    return shop


@products.get("/shops/{shop_id}/products", response_model=list[ProductOut])
async def list_products(shop_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return (await db.scalars(select(Product).where(Product.shop_id == shop_id).order_by(Product.created_at.desc()))).all()


@products.post("/shops/{shop_id}/products", response_model=ProductOut, status_code=201)
async def create_product(
    shop_id: uuid.UUID, body: ProductCreate, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)
):
    await owned_shop(shop_id, user, db)
    product = Product(shop_id=shop_id, **body.model_dump())
    db.add(product)
    await db.commit()
    return product


@products.delete("/products/{product_id}", status_code=204)
async def delete_product(product_id: uuid.UUID, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    await owned_shop(product.shop_id, user, db)
    await db.delete(product)
    await db.commit()


# ---------- admin ----------
@admin.get("/users", response_model=list[UserOut])
async def admin_users(db: AsyncSession = Depends(get_db)):
    return (await db.scalars(select(User).order_by(User.created_at.desc()))).all()


@admin.get("/shops", response_model=list[ShopOut])
async def admin_shops(db: AsyncSession = Depends(get_db)):
    return (await db.scalars(select(Shop).order_by(Shop.created_at.desc()))).all()


@admin.patch("/shops/{shop_id}/badge", response_model=ShopOut)
async def set_badge(shop_id: uuid.UUID, body: BadgeUpdate, db: AsyncSession = Depends(get_db)):
    shop = await db.get(Shop, shop_id)
    if not shop:
        raise HTTPException(404, "Shop not found")
    shop.vinyl_badge_status = body.vinyl_badge_status
    await db.commit()
    return shop


@admin.delete("/shops/{shop_id}", status_code=204)
async def admin_delete_shop(shop_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    shop = await db.get(Shop, shop_id)
    if not shop:
        raise HTTPException(404, "Shop not found")
    await db.delete(shop)
    await db.commit()
