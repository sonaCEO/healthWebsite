from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class ArticleResponse(BaseModel):
    id: int
    title: str
    content: str
    author: str
    category: str
    read_time: int 
    published_at: datetime
    image_url: Optional[str] = None
    tags: List[str]

SAMPLE_ARTICLES = [
    ArticleResponse(
        id=1,
        title="10 принципов здорового питания",
        content="Здоровое питание - это не диета, а образ жизни...",
        author="Доктор Иванова",
        category="nutrition",
        read_time=5,
        published_at=datetime(2024, 1, 15),
        tags=["питание", "здоровье", "советы"]
    ),
    ArticleResponse(
        id=2,
        title="Как начать тренироваться: руководство для начинающих",
        content="Начать заниматься спортом может быть непросто...",
        author="Тренер Петров",
        category="health",
        read_time=7,
        published_at=datetime(2024, 1, 10),
        tags=["тренировки", "спорт", "начало"]
    )
]

@router.get("/", response_model=List[ArticleResponse])
def get_articles(
    category: Optional[str] = Query(None, description="Фильтр по категории"),
    limit: int = Query(10, description="Лимит статей")
):
    """Получить список статей"""
    articles = SAMPLE_ARTICLES.copy()
    
    if category:
        articles = [a for a in articles if a.category == category]
    
    return articles[:limit]

@router.get("/{article_id}", response_model=ArticleResponse)
def get_article(article_id: int):
    """Получить статью по ID"""
    article = next((a for a in SAMPLE_ARTICLES if a.id == article_id), None)
    if not article:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@router.get("/categories/list")
def get_categories():
    """Получить список категорий статей"""
    categories = list(set(article.category for article in SAMPLE_ARTICLES))
    return {"categories": categories}