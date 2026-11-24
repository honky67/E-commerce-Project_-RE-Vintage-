from fastapi import APIRouter

from app.api.routes import admin, auth, oauth, orders, products, shops

api_router = APIRouter()
for module in (auth, oauth, shops, products, orders, admin):
    api_router.include_router(module.router)
