import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user
from app.db.session import get_db
from app.models import Product, Shop, User, UserRole
from app.schemas import ProductCreate, ProductOut

router = APIRouter(tags=["products"])


async def owned_shop(shop_id: uuid.UUID, user: User, db: AsyncSession) -> Shop:
    shop = await db.get(Shop, shop_id)
    if not shop:
        raise HTTPException(404, "Shop not found")
    if shop.owner_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(403, "Not your shop")
    return shop


@router.get("/shops/{shop_id}/products", response_model=list[ProductOut])
async def list_products(
    shop_id: uuid.UUID,
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Product).where(Product.shop_id == shop_id).order_by(Product.created_at.desc())
    return (await db.scalars(stmt.limit(limit).offset(offset))).all()


@router.post("/shops/{shop_id}/products", response_model=ProductOut, status_code=201)
async def create_product(
    shop_id: uuid.UUID, body: ProductCreate, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)
):
    await owned_shop(shop_id, user, db)
    product = Product(shop_id=shop_id, **body.model_dump())
    db.add(product)
    await db.commit()
    return product


@router.delete("/products/{product_id}", status_code=204)
async def delete_product(product_id: uuid.UUID, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    await owned_shop(product.shop_id, user, db)
    await db.delete(product)
    await db.commit()
