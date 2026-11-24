import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import current_user, require_admin
from app.db.session import get_db
from app.models import CartItem, Order, OrderItem, OrderStatus, Product, User
from app.schemas import CheckoutRequest, OrderOut, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/checkout", response_model=OrderOut, status_code=201)
async def checkout(
    payload: CheckoutRequest,
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart cannot be empty. Please add items before checking out.")

    # Aggregate requested quantities per product
    quantities: dict[uuid.UUID, int] = {}
    for item in payload.items:
        quantities[item.product_id] = quantities.get(item.product_id, 0) + item.quantity

    product_ids = list(quantities.keys())
    stmt = select(Product).where(Product.id.in_(product_ids)).order_by(Product.id).with_for_update()
    result = await db.scalars(stmt)
    products_by_id = {p.id: p for p in result.all()}

    # Validate existence and stock
    for pid, requested_qty in quantities.items():
        product = products_by_id.get(pid)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID '{pid}' was not found in catalog.")
        if product.stock_quantity <= 0:
            raise HTTPException(
                status_code=409,
                detail=f"'{product.title}' is currently out of stock and cannot be purchased.",
            )
        if product.stock_quantity < requested_qty:
            raise HTTPException(
                status_code=409,
                detail=f"Requested {requested_qty} units of '{product.title}', but only {product.stock_quantity} are available in stock.",
            )

    total_price = Decimal("0.00")
    order_items: list[OrderItem] = []

    # Decrement stock and build order items
    for item in payload.items:
        product = products_by_id[item.product_id]
        line_price = product.price * item.quantity
        total_price += line_price
        product.stock_quantity -= item.quantity

        order_items.append(
            OrderItem(
                product_id=product.id,
                title=product.title,
                price=product.price,
                quantity=item.quantity,
                option=item.option,
                image_url=product.image_url,
            )
        )

    shipping_address = payload.shipping_address
    if not shipping_address:
        shipping_address = payload.address or "Standard Delivery"
    order = Order(
        user_id=user.id,
        total_price=total_price,
        status=OrderStatus.PENDING.value,
        full_name=payload.full_name,
        address=payload.address,
        city=payload.city,
        phone=payload.phone,
        payment_method=payload.payment_method,
        shipping_address=shipping_address,
        items=order_items,
    )

    db.add(order)
    try:
        await db.execute(delete(CartItem).where(CartItem.user_id == user.id))
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    # Reload order with its items to return full OrderOut
    fresh_order = await db.scalar(
        select(Order).where(Order.id == order.id).options(selectinload(Order.items))
    )
    return fresh_order


@router.get("", response_model=list[OrderOut])
@router.get("/mine", response_model=list[OrderOut])
async def my_orders(
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Order)
        .where(Order.user_id == user.id)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )
    return (await db.scalars(stmt)).all()


@router.patch("/{order_id}/status", response_model=OrderOut, dependencies=[Depends(require_admin)])
async def update_order_status(
    order_id: uuid.UUID,
    payload: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    order = await db.scalar(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    await db.commit()
    return order


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(
    order_id: uuid.UUID,
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    order = await db.scalar(stmt)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this order")
    return order
