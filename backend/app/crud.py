# crud.py
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, time
from typing import List, Optional
from sqlalchemy import cast, Date
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
        matrix_number=user.matrix_number,
        hashed_password=hashed_password,
        role=user.role,
        phone=user.phone,
        cafeteria_id=user.cafeteria_id if user.role == models.UserRole.VENDOR else None
    )
    # Validate that vendor must have a cafeteria
    if user.role == models.UserRole.VENDOR and not user.cafeteria_id:
        raise ValueError("Vendors must select a cafeteria")
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
    orders = db.query(models.Order)\
        .filter(models.Order.user_id == user_id)\
        .order_by(models.Order.created_at.desc())\
        .all()
    # Manually enrich the data with names and prices
    for order in orders:
        # Add cafeteria name
        cafeteria = db.query(models.Cafeteria).filter(
            models.Cafeteria.id == order.cafeteria_id
        ).first()
        if cafeteria:
            order.cafeteria_name = cafeteria.name

        # Add menu item details to each order item
        for item in order.items:
            menu_item = db.query(models.MenuItem).filter(
                models.MenuItem.id == item.menu_item_id
            ).first()
            if menu_item:
                item.menu_item_name = menu_item.name
                item.price = menu_item.price

    return orders


def get_order(db: Session, order_id: int) -> Optional[models.Order]:
    return db.query(models.Order).filter(models.Order.id == order_id).first()


# def get_vendor_orders(db: Session, vendor_id: int, slot_time: Optional[datetime] = None):
#     """Get orders only for the vendor's cafeteria"""
#     vendor = db.query(models.User).filter(models.User.id == vendor_id).first()
#     if not vendor:
#         return []

#     if vendor.cafeteria_id:
#         query = db.query(models.Order).filter(models.Order.cafeteria_id == vendor.cafeteria_id)
    
#     if slot_time:
#         query = query.filter(models.Order.slot_time == slot_time)
#     else:
#         today = datetime.now().date()
#         query = query.filter(cast(models.Order.slot_time, Date) == today)
    
#     # return query.order_by(models.Order.slot_time.asc()).all()
#     return db.query(models.Order).order_by(models.Order.created_at.desc()).all()


def update_order_status(db: Session, order_id: int, status: models.OrderStatus):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if order:
        order.status = status.value if isinstance(status, models.OrderStatus) else status # type: ignore
        db.commit()
        db.refresh(order)
    return order

from sqlalchemy.orm import joinedload
from sqlalchemy import cast, Date
from datetime import datetime
from typing import Optional, List

def get_vendor_orders(db: Session, vendor_id: int, slot_time: Optional[datetime] = None):
    """Get orders for vendor with full details (names, items, etc.)"""
    
    vendor = db.query(models.User).filter(models.User.id == vendor_id).first()
    if not vendor:
        return []

    # Start building query with eager loading
    query = db.query(models.Order)\
        .options(
            joinedload(models.Order.cafeteria),
            joinedload(models.Order.items).joinedload(models.OrderItem.menu_item)
        )

    # Filter by vendor's cafeteria (if assigned)
    if vendor.cafeteria_id is not None:
        query = query.filter(models.Order.cafeteria_id == vendor.cafeteria_id)
    # else: temporarily show all orders (for debugging)

    # Filter by slot_time or today
    if slot_time:
        query = query.filter(models.Order.slot_time == slot_time)
    else:
        # Get start and end of the current day
        today_start = datetime.combine(datetime.now().date(), datetime.min.time())
        today_end = datetime.combine(datetime.now().date(), datetime.max.time())
        
        # DEBUG PRINTS: Check your terminal logs to see what dates are being generated!
        print(f"🔎 DEBUG: Searching for orders between {today_start} and {today_end}")
        
        # Range filter (avoids tricky SQL casting issues)
        query = query.filter(models.Order.slot_time >= today_start, models.Order.slot_time <= today_end)

    return query.order_by(models.Order.created_at.desc()).all()




def get_enhanced_vendor_dashboard(db: Session, vendor_id: int | None = None):
    vendor = db.query(models.User).filter(models.User.id == vendor_id).first()
    if not vendor or vendor.cafeteria_id is None:
        return {
            "total_orders_today": 0,
            "pending_orders": 0,
            "preparing_orders": 0,
            "ready_orders": 0,
            "revenue_today": 0.0,
            "top_items": [],
            "next_busy_slots": [],
        }

    today = datetime.now().date()
    
    orders = db.query(models.Order).filter(
        models.Order.cafeteria_id == vendor.cafeteria_id,
        cast(models.Order.slot_time, Date) == today
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

def get_user_matric_number(db: Session, user_matric_number: str):
    return db.query(models.User).filter(models.User.matrix_number == user_matric_number).first()


# def get_vendor_dashboard(db: Session, vendor_id: int | None = None):
#     today = datetime.now().date()
#     orders = db.query(models.Order).filter(
#         cast(models.Order.created_at, Date) == today  # type: ignore
#     ).all()

#     total = len(orders)
#     pending = sum(
#         1
#         for o in orders
#         if (o.status.value if isinstance(o.status, models.OrderStatus) else str(o.status))
#         == models.OrderStatus.PENDING.value
#     )
#     ready = sum(
#         1
#         for o in orders
#         if (o.status.value if isinstance(o.status, models.OrderStatus) else str(o.status))
#         == models.OrderStatus.READY.value
#     )
#     revenue = sum(o.total_amount for o in orders)

#     slot_counts = {}
#     for o in orders:
#         slot_key = o.slot_time.replace(second=0, microsecond=0)
#         slot_counts[slot_key] = slot_counts.get(slot_key, 0) + 1

#     slot_availability = [
#         {
#             "slot_time": slot,
#             "available_slots": max(0, 25 - count),
#             "total_capacity": 25,
#         }
#         for slot, count in sorted(slot_counts.items())
#     ]

#     return {
#         "total_orders_today": total,
#         "pending_orders": pending,
#         "ready_orders": ready,
#         "revenue_today": revenue,
#         "slot_availability": slot_availability,
#     }

def get_vendor_dashboard(db: Session, vendor_id: int | None = None):
    # 1. Fetch vendor to filter by their cafeteria
    cafeteria_id = None
    is_paused = False
    if vendor_id:
        vendor = db.query(models.User).filter(models.User.id == vendor_id).first()
        if vendor:
            cafeteria_id = vendor.cafeteria_id
            if cafeteria_id is not None:
                cafeteria = db.query(models.Cafeteria).filter(models.Cafeteria.id == cafeteria_id).first()
                if cafeteria:
                    is_paused = bool(cafeteria.is_paused)

    # 2. Fix the SQLite Date casting by using an explicit day range
    today_start = datetime.combine(datetime.now().date(), time.min)
    today_end = datetime.combine(datetime.now().date(), time.max)

    # Start building the query
    query = db.query(models.Order).filter(
        models.Order.created_at >= today_start,
        models.Order.created_at <= today_end
    )

    # Filter by the vendor's cafeteria if available
    if cafeteria_id is not None:
        query = query.filter(models.Order.cafeteria_id == cafeteria_id)

    orders = query.all()

    # 3. Process calculations
    total = len(orders)
    pending = 0
    ready = 0
    completed = 0  # Added to track completed orders explicitly
    revenue = 0

    slot_counts = {}

    for o in orders:
        revenue += o.total_amount
        
        # Safe status string conversion
        status_str = o.status.value if isinstance(o.status, models.OrderStatus) else str(o.status)
        
        if status_str == models.OrderStatus.PENDING.value:
            pending += 1
        elif status_str == models.OrderStatus.READY.value:
            ready += 1

        # Track slots
        if o.slot_time is not None:
            slot_key = o.slot_time.replace(second=0, microsecond=0)
            slot_counts[slot_key] = slot_counts.get(slot_key, 0) + 1

    # Build slot capacity profile
    slot_availability = [
        {
            "slot_time": slot,
            "available_slots": max(0, 25 - count),
            "total_capacity": 25,
        }
        for slot, count in sorted(slot_counts.items())
    ]

    return {
        "total_orders_today": total,
        "pending_orders": pending,
        "ready_orders": ready,
        "completed_orders": completed,  # Returned to frontend
        "revenue_today": revenue,
        "slot_availability": slot_availability,
        "is_paused": is_paused,
    }