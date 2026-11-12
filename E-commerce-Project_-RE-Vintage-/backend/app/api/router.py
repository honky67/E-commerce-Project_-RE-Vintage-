from fastapi import APIRouter

from app.api.routes import admin, auth, products, shops

api_router = APIRouter()
for module in (auth, shops, products, admin):
    api_router.include_router(module.router)
