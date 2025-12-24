from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from sqlalchemy.orm import Session

router = APIRouter()



from app.schemas.order import Order, OrderCreate, OrderResponse, OrderItem

@router.post("/create", response_model=OrderResponse)
def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Создать новый заказ"""
    
    total_amount = sum(item.price * item.quantity for item in order_data.items)
    
    db_order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        status="pending",
        delivery_address=order_data.delivery_address,
        phone=order_data.phone,
        delivery_date=order_data.delivery_date,
        notes=order_data.notes
    )
    
    db.add(db_order)
    db.flush()  
    
    for item in order_data.items:
        db_item = OrderItem(
            order_id=db_order.id,
            menu_id=item.menu_id,
            quantity=item.quantity,
            price=item.price
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_order)
    
    return db_order

@router.get("/my-orders", response_model=List[OrderResponse])
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить заказы текущего пользователя"""
    orders = db.query(Order).filter(Order.user_id == current_user.id).all()
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить детали заказа"""
    order = db.query(Order).filter(
        Order.id == order_id, 
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order

@router.put("/{order_id}/cancel")
def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Отменить заказ"""
    order = db.query(Order).filter(
        Order.id == order_id, 
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status not in ["pending", "confirmed"]:
        raise HTTPException(status_code=400, detail="Cannot cancel order in current status")
    
    order.status = "cancelled"
    db.commit()
    
    return {"message": "Order cancelled successfully"}