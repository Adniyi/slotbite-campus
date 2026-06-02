# crud.py
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from . import models, schemas
from .utils.security import get_password_hash, verify_password


# ===================== AUTH =====================
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=user.role,
        phone=user.phone,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password): # type: ignore
        return False
    return user


# ===================== ORDERS =====================
def create_order(db: Session, order: schemas.OrderCreate, user_id: int):
    # Calculate total and create order
    total = 0.0
    db_order = models.Order(
        user_id=user_id,
        cafeteria_id=order.cafeteria_id,
        slot_time=order.slot_time,
        total_amount=0.0,
        status=models.OrderStatus.PENDING
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    for item in order.items:
        menu_item = db.query(models.MenuItem).filter(
            models.MenuItem.id == item.menu_item_id
        ).first()
        
        if menu_item and menu_item.available is True:
            order_item = models.OrderItem(
                order_id=db_order.id,
                menu_item_id=item.menu_item_id,
                quantity=item.quantity
            )
            db.add(order_item)
            total += menu_item.price * item.quantity

    db_order.total_amount = total # type: ignore
    db.commit()
    db.refresh(db_order)
    return db_order


def get_user_orders(db: Session, user_id: int) -> List[models.Order]:
    return db.query(models.Order)\
        .filter(models.Order.user_id == user_id)\
        .order_by(models.Order.created_at.desc())\
        .all()


def get_order(db: Session, order_id: int) -> Optional[models.Order]:
    return db.query(models.Order).filter(models.Order.id == order_id).first()


def get_vendor_orders(db: Session, slot_time: Optional[datetime] = None):
    """Get orders for vendor dashboard"""
    query = db.query(models.Order)
    
    if slot_time:
        query = query.filter(models.Order.slot_time == slot_time)
    else:
        # Today's orders by default
        today = datetime.now().date()
        query = query.filter(models.Order.slot_time.cast('date') == today) # type: ignore
    
    return query.order_by(models.Order.slot_time.asc()).all()


def update_order_status(db: Session, order_id: int, status: models.OrderStatus):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if order:
        order.status = status.value if isinstance(status, models.OrderStatus) else status # type: ignore
        db.commit()
        db.refresh(order)
    return order


def get_enhanced_vendor_dashboard(db: Session):
    today = datetime.now().date()
    
    orders = db.query(models.Order).filter(
        models.Order.slot_time.cast('date') == today # type: ignore
    ).all() 

    total = len(orders)
    pending = sum(1 for o in orders if o.status == models.OrderStatus.PENDING) # type: ignore
    preparing = sum(1 for o in orders if o.status == models.OrderStatus.PREPARING) # type: ignore
    ready = sum(1 for o in orders if o.status == models.OrderStatus.READY) # type: ignore
    revenue = sum(o.total_amount for o in orders)

    # Top 5 selling items
    from collections import defaultdict
    item_count = defaultdict(int)
    item_revenue = defaultdict(float)

    for order in orders:
        for item in order.items:
            item_count[item.menu_item.name] += item.quantity
            item_revenue[item.menu_item.name] += item.quantity * item.menu_item.price

    top_items = sorted(
        [{"name": name, "count": count, "revenue": item_revenue[name]} 
         for name, count in item_count.items()],
        key=lambda x: x["count"], reverse=True
    )[:5]

    return {
        "total_orders_today": total,
        "pending_orders": pending,
        "preparing_orders": preparing,
        "ready_orders": ready,
        "revenue_today": round(revenue, 2), # type: ignore
        "top_items": top_items,
        "next_busy_slots": []  # Can be expanded later
    }