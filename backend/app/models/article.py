from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from app.db.base import Base
from datetime import datetime

class Article(Base):
    __tablename__ = "articles"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String(100), nullable=False)
    category = Column(String(50))  # nutrition, health, etc
    read_time = Column(Integer)  # в минутах
    published_at = Column(DateTime, default=datetime.utcnow)
    image_url = Column(String(500), nullable=True)
    tags = Column(JSON)
    is_active = Column(Integer, default=1)