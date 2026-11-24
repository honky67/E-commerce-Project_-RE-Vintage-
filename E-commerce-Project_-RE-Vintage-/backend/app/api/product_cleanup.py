import uuid

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import CartItem, OrderItem, Product


async def delete_products(db: AsyncSession, product_ids: list[uuid.UUID]) -> list[str | None]:
    if not product_ids:
        return []

    image_urls = (await db.scalars(select(Product.image_url).where(Product.id.in_(product_ids)))).all()
    await db.execute(delete(CartItem).where(CartItem.product_id.in_(product_ids)))
    await db.execute(
        update(OrderItem)
        .where(OrderItem.product_id.in_(product_ids))
        .values(product_id=None)
    )
    await db.execute(delete(Product).where(Product.id.in_(product_ids)))
    return list(image_urls)
