# routers/vendor.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from ..database import get_db
from .. import models, schemas, crud
from ..dependencies import get_current_user

router = APIRouter(prefix="/vendor", tags=["vendor"])

# ===================== VENDOR DASHBOARD =====================

@router.get("/dashboard")
def get_vendor_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role.value != models.UserRole.VENDOR:
        raise HTTPException(status_code=403, detail="Vendor access only")
    
    return schemas.VendorDashboardSummary(**crud.get_vendor_dashboard(db)) # type: ignore


@router.get("/orders")
def get_orders_by_slot(
    slot_time: datetime,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """View orders for a specific time slot"""
    if current_user.role != models.UserRole.VENDOR: # type: ignore
        raise HTTPException(status_code=403, detail="Vendor access only")
    
    orders = crud.get_vendor_orders(db, slot_time)
    return orders


@router.patch("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status_update: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Change status of an order (Pending → Preparing → Ready)"""
    if current_user.role != models.UserRole.VENDOR: # type: ignore
        raise HTTPException(status_code=403, detail="Vendor access only")
    
    order = crud.update_order_status(db, order_id, status_update.status)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order


# ===================== PAUSE / RESUME ORDERS =====================

@router.post("/pause")
def pause_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Pause accepting new orders"""
    if current_user.role != models.UserRole.VENDOR: # type: ignore
        raise HTTPException(status_code=403, detail="Vendor access only")
    
    # Assuming one cafeteria per vendor for now
    cafeteria = db.query(models.Cafeteria).first()  # Improve this logic later
    if cafeteria:
        cafeteria.is_paused = True # type: ignore
        db.commit()
        db.refresh(cafeteria)
        return {"message": "Orders paused successfully. No new bookings will be accepted."}
    
    raise HTTPException(status_code=404, detail="Cafeteria not found")


@router.post("/resume")
def resume_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Resume accepting new orders"""
    if current_user.role != models.UserRole.VENDOR: # type: ignore
        raise HTTPException(status_code=403, detail="Vendor access only")
    
    cafeteria = db.query(models.Cafeteria).first()
    if cafeteria:
        cafeteria.is_paused = False # type: ignore
        db.commit()
        db.refresh(cafeteria)
        return {"message": "Orders resumed successfully."}
    
    raise HTTPException(status_code=404, detail="Cafeteria not found")


@router.get("/slots")
def get_vendor_slots(
    date: str = None, # type: ignore
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """View all time slots with order counts"""
    if current_user.role != models.UserRole.VENDOR: # type: ignore
        raise HTTPException(status_code=403, detail="Vendor access only")
    
    # Reuse the logic from cafeterias router or duplicate for now
    from .cafeterias import get_available_slots
    # For simplicity, use first cafeteria (you can improve later)
    cafeteria = db.query(models.Cafeteria).first()
    
    if not cafeteria:
        raise HTTPException(status_code=404, detail="No cafeteria found")
    
    return get_available_slots(cafeteria.id, date, db) # type: ignore