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


@router.get("/{cafeteria_id}/menu", response_model=List[schemas.MenuItem])
def get_cafeteria_menu(cafeteria_id: int, db: Session = Depends(get_db)):
    menu = db.query(models.MenuItem).filter(
        models.MenuItem.cafeteria_id == cafeteria_id,
        models.MenuItem.available == True
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