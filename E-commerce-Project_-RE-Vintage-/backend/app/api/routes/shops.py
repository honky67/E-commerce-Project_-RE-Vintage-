import re
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user
from app.db.session import get_db
from app.models import Shop, User, UserRole
from app.schemas import ShopCreate, ShopOut

router = APIRouter(prefix="/shops", tags=["shops"])


def slugify(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "shop"


@router.get("", response_model=list[ShopOut])
async def list_shops(
    limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0), db: AsyncSession = Depends(get_db)
):
    return (await db.scalars(select(Shop).order_by(Shop.created_at.desc()).limit(limit).offset(offset))).all()


@router.get("/mine", response_model=list[ShopOut])  # declared before /{slug}
async def my_shops(user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    return (await db.scalars(select(Shop).where(Shop.owner_id == user.id))).all()


@router.get("/{slug}", response_model=ShopOut)
async def get_shop(slug: str, db: AsyncSession = Depends(get_db)):
    shop = await db.scalar(select(Shop).where(Shop.slug == slug))
    if not shop:
        raise HTTPException(404, "Shop not found")
    return shop


@router.post("", response_model=ShopOut, status_code=201)
async def create_shop(body: ShopCreate, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    base = slugify(body.shop_name)
    owner_id, upgrade = user.id, user.role == UserRole.BUYER
    taken = await db.scalar(select(Shop.id).where(Shop.slug == base)) is not None
    for _ in range(3):  # retry covers two people claiming the same name at once
        slug = f"{base}-{uuid.uuid4().hex[:4]}" if taken else base
        shop = Shop(owner_id=owner_id, shop_name=body.shop_name.strip(), slug=slug, bio=body.bio)
        db.add(shop)
        if upgrade:  # launching a store makes you a seller
            await db.execute(update(User).where(User.id == owner_id).values(role=UserRole.SELLER))
        try:
            await db.commit()
            return shop
        except IntegrityError:
            await db.rollback()
            taken = True
    raise HTTPException(409, "Could not reserve a store address, try a different name")
