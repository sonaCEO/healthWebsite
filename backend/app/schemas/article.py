from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ArticleBase(BaseModel):
    title: str
    content: str
    author: str
    category: str
    read_time: int
    image_url: Optional[str] = None
    tags: List[str] = []

class ArticleCreate(ArticleBase):
    pass

class ArticleResponse(ArticleBase):
    id: int
    published_at: datetime
    
    class Config:
        from_attributes = True