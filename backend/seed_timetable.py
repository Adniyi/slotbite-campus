# seed_timetable.py
from app.database import SessionLocal
from app import models
from datetime import time

def seed_timetables():
    db = SessionLocal()

    # Check if timetable already exists for the test user to ensure idempotency
    if db.query(models.ClassSchedule).filter(models.ClassSchedule.user_id == 1).first():
        print("⏭️  Timetable for user_id=1 already exists. Skipping.")
        db.close()
        return

    # Sample schedules for user_id = 1 (assuming your test student)
    schedules = [
        models.ClassSchedule(
            user_id=1,
            course_code="CSC 101",
            course_name="Introduction to Computer Science",
            start_time=time(9, 0),
            end_time=time(10, 0),
            day="Wednesday"
        ),
        models.ClassSchedule(
            user_id=1,
            course_code="PHY 102",
            course_name="General Physics II",
            start_time=time(11, 0),
            end_time=time(12, 0),
            day="Wednesday"
        ),
        models.ClassSchedule(
            user_id=1,
            course_code="MAT 201",
            course_name="Calculus II",
            start_time=time(14, 0),
            end_time=time(15, 0),
            day="Wednesday"
        ),
        models.ClassSchedule(
            user_id=1,
            course_code="GNS 102",
            course_name="Communication Skills",
            start_time=time(10, 0),
            end_time=time(11, 0),
            day="Thursday"
        ),
    ]

    db.add_all(schedules)
    db.commit()
    print(f"✅ Added {len(schedules)} sample class schedules for user_id=1")
    db.close()

if __name__ == "__main__":
    seed_timetables()