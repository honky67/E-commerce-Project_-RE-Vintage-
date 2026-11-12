"""Development-only demo accounts (created on startup when APP_ENV=development)."""
from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models import ConditionGrade, MediaType, Product, Shop, User, UserRole

DEMO_PASSWORD = "Demo1234!"
DEMO_USERS = {
    "admin@revintage.demo": UserRole.ADMIN,
    "seller@revintage.demo": UserRole.SELLER,
    "customer@revintage.demo": UserRole.BUYER,
}


async def seed_demo_users() -> None:
    async with AsyncSessionLocal() as db:
        found = {u.email: u for u in (await db.scalars(select(User).where(User.email.in_(DEMO_USERS)))).all()}
        for email, role in DEMO_USERS.items():
            if email not in found:
                found[email] = User(email=email, hashed_password=hash_password(DEMO_PASSWORD), role=role)
                db.add(found[email])
        await db.flush()

        seller = found["seller@revintage.demo"]
        if not await db.scalar(select(Shop.id).where(Shop.owner_id == seller.id)):
            shop = Shop(
                owner_id=seller.id,
                shop_name="Demo Records",
                slug="demo-records",
                bio="Demo store with sample listings. Add or remove products from the dashboard.",
            )
            db.add(shop)
            await db.flush()
            db.add_all(
                [
                    Product(shop_id=shop.id, title="Midnight at the Blue Room", artist_brand="The Hollis Quartet", price=42,
                            condition_grade=ConditionGrade.VG_PLUS, stock_quantity=2, media_type=MediaType.VINYL),
                    Product(shop_id=shop.id, title="Tour Windbreaker, 1978", artist_brand="Northgate Surplus", price=65,
                            condition_grade=ConditionGrade.VG, stock_quantity=1, media_type=MediaType.APPAREL),
                ]
            )
        await db.commit()
