from sqlalchemy import Column, Integer, String, Float, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Recipe(Base):
    __tablename__ = "recipes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    ingredients = Column(JSON)  
    instructions = Column(JSON)  
    cooking_time = Column(Integer)  
    calories = Column(Integer)
    protein = Column(Integer)
    carbs = Column(Integer)
    fat = Column(Integer)
    category = Column(String(50))  
    difficulty = Column(String(20)) 
    image_url = Column(String(500), nullable=True)
    tags = Column(JSON) 
    is_active = Column(Integer, default=1)
    
    # Связи
    orders = relationship("OrderItem", back_populates="recipe")
