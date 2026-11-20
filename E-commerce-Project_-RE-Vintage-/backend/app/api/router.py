from fastapi import APIRouter

from app.api.routes import admin, auth, oauth, products, shops

api_router = APIRouter()
for module in (auth, oauth, shops, products, admin):
    api_router.include_router(module.router)
