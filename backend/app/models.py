# models.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Boolean, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

class UserRole(str, enum.Enum):
    STUDENT = "student"
    VENDOR = "vendor"
    ADMIN = "admin"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PREPARING = "preparing"
    READY = "ready"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    matrix_number = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.STUDENT)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


    cafeteria_id = Column(Integer, ForeignKey("cafeterias.id"), nullable=True)
    cafeteria = relationship("Cafeteria", back_populates="vendors")
    schedules = relationship("ClassSchedule", back_populates="user")

class Cafeteria(Base):
    __tablename__ = "cafeterias"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    is_open = Column(Boolean, default=True)
    max_orders_per_slot = Column(Integer, default=25)
    is_paused = Column(Boolean, default=False)  # For pause/resume orders

    menu_items = relationship("MenuItem", back_populates="cafeteria")
    vendors = relationship("User", back_populates="cafeteria")

class MenuItem(Base):
    __tablename__ = "menu_items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    description = Column(String, nullable=True)
    available = Column(Boolean, default=True)
    cafeteria_id = Column(Integer, ForeignKey("cafeterias.id"))
    
    cafeteria = relationship("Cafeteria", back_populates="menu_items")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    cafeteria_id = Column(Integer, ForeignKey("cafeterias.id"))
    total_amount = Column(Float)
    slot_time = Column(DateTime(timezone=True))   # e.g., 2026-06-02 12:15:00
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    qr_code = Column(String, nullable=True)       # store QR data or image path
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    cafeteria = relationship("Cafeteria")
    items = relationship("OrderItem", back_populates="order")

    @property
    def display_time(self):
        slot = getattr(self, "slot_time", None)
        return slot.strftime("%I:%M %p") if slot is not None else None

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"))
    quantity = Column(Integer, default=1)

    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem")


class ClassSchedule(Base):
    __tablename__ = "class_schedules"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_code = Column(String)
    course_name = Column(String)
    start_time = Column(Time)
    end_time = Column(Time)
    day = Column(String)  # Monday, Tuesday, etc.
    
    user = relationship("User", back_populates="schedules")