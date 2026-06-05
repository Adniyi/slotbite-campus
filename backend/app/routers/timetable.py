# routers/timetable.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, time, timedelta
from datetime import datetime, time, timedelta, date as date_obj
from typing import List

from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_user

router = APIRouter(tags=["timetable"])

@router.post("/add-class")
def add_class_schedule(
    schedule: schemas.ClassScheduleBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.STUDENT:
        raise HTTPException(403, detail="Only students can add schedules")
    
    new_class = models.ClassSchedule(
        user_id=current_user.id,
        **schedule.dict()
    )
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return new_class


@router.get("/my")
def get_my_timetable(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.ClassSchedule).filter(
        models.ClassSchedule.user_id == current_user.id
    ).all()


@router.post("/check-clash")
def check_slot_clash(
    slot_time: datetime,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Check if a slot clashes with student's timetable"""
    day_name = slot_time.strftime("%A")  # e.g., "Monday"
    slot_start = slot_time.time()
    slot_end = (slot_time + timedelta(minutes=20)).time()  # Assume 20 min pickup window

    classes = db.query(models.ClassSchedule).filter(
        models.ClassSchedule.user_id == current_user.id,
        models.ClassSchedule.day == day_name
    ).all()

    for cls in classes:
        # Check for overlap
        if not (slot_end <= cls.start_time or slot_start >= cls.end_time):
            return {
                "status": "red",
                "message": f"Clashes with {cls.course_code} ({cls.start_time.strftime('%H:%M')} - {cls.end_time.strftime('%H:%M')})"
            }

    return {
        "status": "green",
        "message": "No clash detected. Good time!"
    }


@router.get("/recommend")
def recommend_slots(
    cafeteria_id: int | None = None,
    date: str | None = None,  # YYYY-MM-DD
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Return ranked recommended slots based on student's timetable and slot availability.
    If `cafeteria_id` is omitted, return best slots across all cafeterias.
    """
    # Determine target date
    if date:
        try:
            target_date = datetime.fromisoformat(date).date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    else:
        target_date = datetime.now().date()

    # helper to generate slots for a cafeteria (mirrors cafeterias.get_available_slots)
    def gen_slots_for_caf(caf: models.Cafeteria):
        max_capacity = caf.max_orders_per_slot if caf else 25
        is_paused = bool(caf.is_paused) if caf else False
        start_time = datetime.combine(target_date, time(hour=10, minute=0))
        
        # Optimization: Fetch all counts for this cafeteria and date in one query
        order_counts = db.query(models.Order.slot_time, models.func.count(models.Order.id))\
            .filter(
                models.Order.cafeteria_id == caf.id,
                models.func.date(models.Order.slot_time) == target_date,
                models.Order.status != models.OrderStatus.CANCELLED
            )\
            .group_by(models.Order.slot_time)\
            .all()
        counts_map = {slot: count for slot, count in order_counts}

        slots_list = []
        for i in range(25):
            slot_time = start_time + timedelta(minutes=15 * i)
            available = max(0, max_capacity - counts_map.get(slot_time, 0))
            available = 0 if is_paused else available
            slots_list.append({
                "slot_time": slot_time,
                "display_time": slot_time.strftime("%I:%M %p"),
                "available": available,
                "total_capacity": max_capacity,
                "paused": is_paused,
                "cafeteria_id": caf.id,
                "cafeteria_name": caf.name,
            })
        return slots_list

    # collect cafeterias to evaluate
    cafeterias = []
    if cafeteria_id:
        caf = db.query(models.Cafeteria).filter(models.Cafeteria.id == cafeteria_id).first()
        if not caf:
            raise HTTPException(status_code=404, detail="Cafeteria not found")
        cafeterias = [caf]
    else:
        cafeterias = db.query(models.Cafeteria).all()

    # load user's schedules into a map by day
    schedules = db.query(models.ClassSchedule).filter(models.ClassSchedule.user_id == current_user.id).all()
    schedules_by_day = {}
    for s in schedules:
        schedules_by_day.setdefault(s.day, []).append(s)

    recommendations = []

    for caf in cafeterias:
        slots = gen_slots_for_caf(caf)
        scored = []
        for s in slots:
            day_name = s["slot_time"].strftime("%A")
            slot_start = s["slot_time"].time()
            slot_end = (s["slot_time"] + timedelta(minutes=20)).time()

            # default
            status = "green"
            message = "No clash detected"

            for cls in schedules_by_day.get(day_name, []):
                if not (slot_end <= cls.start_time or slot_start >= cls.end_time):
                    status = "red"
                    message = f"Clashes with {cls.course_code} ({cls.start_time.strftime('%H:%M')} - {cls.end_time.strftime('%H:%M')})"
                    break

            # score: prefer green and higher availability
            score = s["available"]
            if status == "green":
                score += 1000
            elif status == "red":
                score -= 1000

            scored.append({**s, "status": status, "message": message, "score": score})

        # pick top 5 for this cafeteria
        scored_sorted = sorted(scored, key=lambda x: x["score"], reverse=True)
        top = scored_sorted[:5]
        recommendations.extend(top)

    # sort global recommendations
    recommendations = sorted(recommendations, key=lambda x: x["score"], reverse=True)

    # serialize slot_time to ISO strings for JSON
    for r in recommendations:
        r["slot_time"] = r["slot_time"].isoformat()

    return recommendations

@router.delete("/{class_id}")
def delete_class_schedule(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_class = db.query(models.ClassSchedule).filter(
        models.ClassSchedule.id == class_id,
        models.ClassSchedule.user_id == current_user.id
    ).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    db.delete(db_class)
    db.commit()
    return {"message": "Class deleted successfully"}