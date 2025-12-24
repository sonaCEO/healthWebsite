from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class OrderItem(BaseModel):
    menu_id: int
    quantity: int
    price: float


class OrderCreate(BaseModel):
    items: List[OrderItem]
    delivery_address: str
    phone: str
    delivery_date: datetime
    notes: Optional[str] = None


class OrderResponse(BaseModel):
    id: int
    user_id: int
    items: List[OrderItem]
    total_amount: float
    status: str
    delivery_address: str
    phone: str
    delivery_date: datetime
    created_at: datetime
    notes: Optional[str] = None

    class Config:
        from_attributes = True