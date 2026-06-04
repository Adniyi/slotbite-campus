# schemas.py
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, time
from typing import List, Optional
from .models import UserRole, OrderStatus

# ==================== AUTH ====================
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    matrix_number: Optional[str] = None
    password: str
    role: UserRole = UserRole.STUDENT
    phone: Optional[str] = None
    cafeteria_id: Optional[int] = None

class UserLogin(BaseModel):
    email: EmailStr
    role: UserRole = UserRole.STUDENT
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None

# ==================== CAFETERIA ====================
class MenuItemBase(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    available: bool = True

class MenuItem(MenuItemBase):
    id: int
    cafeteria_id: int

    class Config:
        from_attributes = True

class CafeteriaBase(BaseModel):
    name: str
    location: str
    is_open: bool = True
    max_orders_per_slot: int = 25

class Cafeteria(CafeteriaBase):
    id: int

    class Config:
        from_attributes = True

# ==================== ORDER ====================
class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int = 1

class OrderCreate(BaseModel):
    cafeteria_id: int
    slot_time: datetime
    items: List[OrderItemCreate]

class OrderItemResponse(BaseModel):
    menu_item_id: int
    quantity: int
    menu_item_name: Optional[str] = None
    price: Optional[float] = None

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    user_id: int
    cafeteria_id: int
    cafeteria_name: Optional[str] = None
    total_amount: float
    slot_time: datetime
    display_time: Optional[str] = None
    status: OrderStatus
    qr_code: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

# ==================== VENDOR DASHBOARD ====================
class SlotAvailability(BaseModel):
    slot_time: datetime
    available_slots: int
    total_capacity: int

class VendorDashboardSummary(BaseModel):
    total_orders_today: int
    pending_orders: int
    ready_orders: int
    revenue_today: float
    slot_availability: List[SlotAvailability]
    is_paused: bool = False



# Add to schemas.py
class TopMenuItem(BaseModel):
    name: str
    count: int
    revenue: float

class EnhancedVendorDashboard(BaseModel):
    total_orders_today: int
    pending_orders: int
    preparing_orders: int
    ready_orders: int
    revenue_today: float
    top_items: List[TopMenuItem]
    next_busy_slots: List[dict]


# ==================== Class Timeable ====================

class ClassScheduleBase(BaseModel):
    course_code: str
    course_name: str
    start_time: time
    end_time: time
    day: str  # e.g., "Monday", "Tuesday"

class ClassSchedule(ClassScheduleBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class TimetableClashResponse(BaseModel):
    slot_time: datetime
    status: str  # "green", "yellow", "red"
    message: str