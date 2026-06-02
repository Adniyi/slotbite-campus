# routers/orders.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from ..database import get_db
from .. import models, schemas, crud
from ..dependencies import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])

# ===================== STUDENT ENDPOINTS =====================

@router.post("/", response_model=schemas.OrderResponse)
def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Only students can create orders
    if current_user.role.value != models.UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can place orders")
    
    # Check if slot is available
    existing_orders = db.query(models.Order).filter(
        models.Order.cafeteria_id == order.cafeteria_id,
        models.Order.slot_time == order.slot_time,
        models.Order.status != models.OrderStatus.CANCELLED
    ).count()

    cafeteria = db.query(models.Cafeteria).filter(models.Cafeteria.id == order.cafeteria_id).first()
    if not cafeteria:
        raise HTTPException(status_code=404, detail="Cafeteria not found")
    
    if existing_orders >= cafeteria.max_orders_per_slot: # type: ignore
        raise HTTPException(status_code=400, detail="This time slot is fully booked")

    user_id = int(current_user.id) # type: ignore
    new_order = crud.create_order(db, order, user_id)
    
    return new_order


@router.get("/my", response_model=List[schemas.OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_user_orders(db, current_user.id) # type: ignore


@router.get("/{order_id}/qr")
def get_order_qr(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.user_id != current_user.id and current_user.role == models.UserRole.STUDENT: # type: ignore
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return {"order_id": order.id, "qr_data": f"SLOTBITE-ORDER-{order.id}"}


# ===================== VENDOR ENDPOINTS =====================

@router.get("/vendor", response_model=List[schemas.OrderResponse])
def get_vendor_orders(
    slot_time: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.VENDOR: # type: ignore
        raise HTTPException(status_code=403, detail="Vendor access only")
    
    return crud.get_vendor_orders(db, current_user.id, slot_time) # type: ignore


@router.patch("/vendor/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    order_id: int,
    status_update: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.VENDOR: # type: ignore
        raise HTTPException(status_code=403, detail="Vendor access only")
    
    return crud.update_order_status(db, order_id, status_update.status)


@router.get("/vendor/dashboard", response_model=schemas.VendorDashboardSummary)
def vendor_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.VENDOR: # type: ignore
        raise HTTPException(status_code=403, detail="Vendor access only")
    
    return crud.get_vendor_dashboard(db, current_user.id) # type: ignore