# routers/cafeterias.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_user

router = APIRouter(tags=["cafeterias"])

@router.get("/", response_model=List[schemas.Cafeteria])
def get_all_cafeterias(db: Session = Depends(get_db)):
    cafeterias = db.query(models.Cafeteria).all()
    return cafeterias

@router.post("/", response_model=schemas.Cafeteria)
def create_cafeteria(
    cafeteria: schemas.CafeteriaBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Admin or Vendor can create new cafeteria"""
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.VENDOR]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_cafeteria = models.Cafeteria(
        name=cafeteria.name,
        location=cafeteria.location,
        is_open=cafeteria.is_open,
        max_orders_per_slot=cafeteria.max_orders_per_slot
    )
    db.add(db_cafeteria)
    db.commit()
    db.refresh(db_cafeteria)
    return db_cafeteria




@router.get("/{cafeteria_id}/menu", response_model=List[schemas.MenuItem])
def get_cafeteria_menu(cafeteria_id: int, db: Session = Depends(get_db)):
    menu = db.query(models.MenuItem).filter(
        models.MenuItem.cafeteria_id == cafeteria_id,
    ).all()
    
    if not menu:
        raise HTTPException(status_code=404, detail="Cafeteria or menu not found")
    return menu


@router.get("/slots/available")
def get_available_slots(
    cafeteria_id: int,
    date: str | None,   # format: YYYY-MM-DD
    db: Session = Depends(get_db)
):
    if date:
        target_date = datetime.fromisoformat(date)
    else:
        target_date = datetime.now()

    # Generate slots from 10:00 to 16:00 every 15 minutes
    slots = []
    start_time = target_date.replace(hour=10, minute=0, second=0, microsecond=0)
    
    for i in range(25):  # 25 slots
        slot_time = start_time + timedelta(minutes=15 * i)
        
        # Count existing orders in this slot
        count = db.query(models.Order).filter(
            models.Order.cafeteria_id == cafeteria_id,
            models.Order.slot_time == slot_time,
            models.Order.status != models.OrderStatus.CANCELLED
        ).count()
        
        cafeteria = db.query(models.Cafeteria).filter(models.Cafeteria.id == cafeteria_id).first()
        max_capacity = cafeteria.max_orders_per_slot if cafeteria else 25
        
        slots.append({
            "slot_time": slot_time,
            "available": max_capacity - count,
            "total_capacity": max_capacity
        })
    
    return slots


@router.get("/{cafeteria_id}")
def get_cafeteria(cafeteria_id: int, db: Session = Depends(get_db)):
    cafeteria = db.query(models.Cafeteria).filter(models.Cafeteria.id == cafeteria_id).first()
    if not cafeteria:
        raise HTTPException(status_code=404, detail="Cafeteria not found")
    return cafeteria


# Add this to cafeterias.py

@router.patch("/menu/{menu_id}/toggle")
def toggle_menu_availability(
    menu_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Vendor can mark a menu item as available/unavailable"""
    if current_user.role != models.UserRole.VENDOR: # type: ignore
        raise HTTPException(status_code=403, detail="Vendor access only")
    
    menu_item = db.query(models.MenuItem).filter(models.MenuItem.id == menu_id).first()
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    menu_item.available = not menu_item.available # type: ignore
    db.commit()
    db.refresh(menu_item)
    
    status = "available" if menu_item.available else "unavailable" # type: ignore
    return {"message": f"Menu item is now {status}", "item": menu_item}