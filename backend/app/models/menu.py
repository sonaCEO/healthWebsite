from sqlalchemy import Column, Integer, String, Float, Text, JSON
from app.db.base import Base

class MenuPlan(Base):
    __tablename__ = "menu_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    calories = Column(Integer)
    protein = Column(Float)
    carbs = Column(Float)
    fat = Column(Float)
    goal = Column(String(20))  # loss, maintain, gain
    difficulty = Column(String(20))  # easy, medium, hard
    days = Column(Integer, default=28)  # продолжительность плана // 28 ВЫБРАЛА
    price = Column(Float, default=0.0)
    items = Column(JSON)  # Список блюд/рецептов
    pdf_filename = Column(String(500), nullable=True)  # имя PDF файла
    pdf_url = Column(String(500), nullable=True)        # URL до PDF
    is_active = Column(Integer, default=1)