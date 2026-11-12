import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models import Shop, User
from app.schemas import BadgeUpdate, ShopOut, UserOut

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/users", response_model=list[UserOut])
async def admin_users(db: AsyncSession = Depends(get_db)):
    return (await db.scalars(select(User).order_by(User.created_at.desc()))).all()


@router.get("/shops", response_model=list[ShopOut])
async def admin_shops(db: AsyncSession = Depends(get_db)):
    return (await db.scalars(select(Shop).order_by(Shop.created_at.desc()))).all()


@router.patch("/shops/{shop_id}/badge", response_model=ShopOut)
async def set_badge(shop_id: uuid.UUID, body: BadgeUpdate, db: AsyncSession = Depends(get_db)):
    shop = await db.get(Shop, shop_id)
    if not shop:
        raise HTTPException(404, "Shop not found")
    shop.vinyl_badge_status = body.vinyl_badge_status
    await db.commit()
    return shop


@router.delete("/shops/{shop_id}", status_code=204)
async def admin_delete_shop(shop_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    shop = await db.get(Shop, shop_id)
    if not shop:
        raise HTTPException(404, "Shop not found")
    await db.delete(shop)
    await db.commit()
