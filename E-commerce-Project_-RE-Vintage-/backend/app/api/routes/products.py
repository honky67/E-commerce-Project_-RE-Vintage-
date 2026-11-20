import uuid

from decimal import Decimal

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user
from app.core.storage import delete_image, save_image
from app.db.session import get_db
from app.models import ConditionGrade, MediaType, Product, Shop, User, UserRole
from app.schemas import CATEGORY_TO_MEDIA, CatalogProduct, Category, ProductCreate, ProductOut

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
    image_url = product.image_url
    await db.delete(product)
    await db.commit()
    delete_image(image_url)


@router.post("/products/{product_id}/image", response_model=ProductOut)
async def upload_product_image(
    product_id: uuid.UUID,
    file: UploadFile = File(...),
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    await owned_shop(product.shop_id, user, db)
    old_url, product.image_url = product.image_url, await save_image(file)
    await db.commit()
    delete_image(old_url)  # replace, don't pile up files
    return product


def to_catalog(p: Product, shop_name: str, shop_slug: str) -> CatalogProduct:
    return CatalogProduct(**ProductOut.model_validate(p).model_dump(), shop_name=shop_name, shop_slug=shop_slug)


@router.get("/products", response_model=list[CatalogProduct])
async def catalog(
    shop: str | None = None,  # shop slug
    media_type: MediaType | None = None,
    limit: int = Query(48, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Product, Shop.shop_name, Shop.slug).join(Shop, Shop.id == Product.shop_id)
    if shop:
        stmt = stmt.where(Shop.slug == shop)
    if media_type:
        stmt = stmt.where(Product.media_type == media_type)
    rows = (await db.execute(stmt.order_by(Product.created_at.desc()).limit(limit).offset(offset))).all()
    return [to_catalog(p, name, slug) for p, name, slug in rows]


@router.get("/products/{product_id}", response_model=CatalogProduct)
async def get_product(product_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    row = (
        await db.execute(
            select(Product, Shop.shop_name, Shop.slug).join(Shop, Shop.id == Product.shop_id).where(Product.id == product_id)
        )
    ).first()
    if not row:
        raise HTTPException(404, "Product not found")
    return to_catalog(*row)


@router.post("/products", response_model=ProductOut, status_code=201)
async def create_product_form(
    title: str = Form(..., min_length=1, max_length=255),
    category: Category = Form(...),
    price: Decimal = Form(..., ge=0, max_digits=10, decimal_places=2),
    condition: ConditionGrade = Form(...),
    description: str = Form("", max_length=5000),
    artist_brand: str = Form("", max_length=255),
    stock_quantity: int = Form(1, ge=0),
    shop_id: uuid.UUID | None = Form(None),  # admins pick a shop; sellers default to their own
    image: UploadFile | None = File(None),
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
):
    if shop_id:
        shop = await owned_shop(shop_id, user, db)
    else:
        shop = await db.scalar(select(Shop).where(Shop.owner_id == user.id).order_by(Shop.created_at))
        if not shop:
            raise HTTPException(400, "Create your store before adding products")
    image_url = await save_image(image) if image is not None and image.filename else None
    product = Product(
        shop_id=shop.id,
        title=title.strip(),
        artist_brand=artist_brand.strip(),
        price=price,
        condition_grade=condition,
        stock_quantity=stock_quantity,
        media_type=CATEGORY_TO_MEDIA[category],
        description=description.strip(),
        image_url=image_url,
    )
    db.add(product)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        delete_image(image_url)
        raise
    return product
