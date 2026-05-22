from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), default="pending")
    delivery_address = Column(Text, nullable=False)
    phone = Column(String(20), nullable=False)
    delivery_date = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=True)
    menu_plan_id = Column(Integer, ForeignKey("menu_plans.id"), nullable=True)
    quantity = Column(Integer, default=1)
    price = Column(Float, nullable=False)
    title = Column(String(200), nullable=False)
    
    order = relationship("Order", back_populates="items")
    recipe = relationship("Recipe", back_populates="orders")
    menu_plan = relationship("MenuPlan")