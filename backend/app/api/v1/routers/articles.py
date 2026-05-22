# from fastapi import APIRouter, Query
# from pydantic import BaseModel
# from typing import List, Optional
# from datetime import datetime

# router = APIRouter()

# class ArticleResponse(BaseModel):
#     id: int
#     title: str
#     content: str
#     author: str
#     category: str
#     read_time: int
#     published_at: datetime
#     image_url: Optional[str] = None
#     tags: List[str]

# SAMPLE_ARTICLES = [
#     ArticleResponse(
#         id=1,
#         title="10 принципов здорового питания",
#         content="Здоровое питание - это не диета, а образ жизни...",
#         author="Доктор Иванова",
#         category="nutrition",
#         read_time=5,
#         published_at=datetime(2024, 1, 15),
#         tags=["питание", "здоровье", "советы"]
#     ),
#     ArticleResponse(
#         id=2,
#         title="Как начать тренироваться: руководство для начинающих",
#         content="Начать заниматься спортом может быть непросто...",
#         author="Тренер Петров",
#         category="health",
#         read_time=7,
#         published_at=datetime(2024, 1, 10),
#         tags=["тренировки", "спорт", "начало"]
#     )
# ]

# @router.get("/", response_model=List[ArticleResponse])
# def get_articles(
#     category: Optional[str] = Query(None, description="Фильтр по категории"),
#     limit: int = Query(10, description="Лимит статей")
# ):
#     """Получить список статей"""
#     articles = SAMPLE_ARTICLES.copy()

#     if category:
#         articles = [a for a in articles if a.category == category]

#     return articles[:limit]

# @router.get("/{article_id}", response_model=ArticleResponse)
# def get_article(article_id: int):
#     """Получить статью по ID"""
#     article = next((a for a in SAMPLE_ARTICLES if a.id == article_id), None)
#     if not article:
#         from fastapi import HTTPException
#         raise HTTPException(status_code=404, detail="Article not found")
#     return article

# @router.get("/categories/list")
# def get_categories():
#     """Получить список категорий статей"""
#     categories = list(set(article.category for article in SAMPLE_ARTICLES))
#     return {"categories": categories}

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from app.core.dependencies import get_db
from app.models.article import Article
from app.schemas.article import ArticleResponse
from pydantic import BaseModel
import json

router = APIRouter()

class PaginatedArticles(BaseModel):
    items: List[ArticleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    class Config:
        from_attributes = True

def article_to_response(article: Article) -> ArticleResponse:
    return ArticleResponse(
        id=article.id,
        title=article.title,
        content=article.content,
        author=article.author,
        category=article.category,
        read_time=article.read_time,
        published_at=article.published_at,
        image_url=article.image_url,
        tags=(
            json.loads(article.tags)
            if isinstance(article.tags, str)
            else article.tags or []
        ),
    )


# @router.get("/", response_model=List[ArticleResponse])
# def get_articles(
#     category: Optional[str] = Query(None),
#     limit: int = Query(1000),
#     db: Session = Depends(get_db),
# ):
#     query = db.query(Article).filter(Article.is_active == 1)
#     if category:
#         query = query.filter(Article.category == category)
#     articles = query.limit(limit).all()
#     return [article_to_response(a) for a in articles]

@router.get("/", response_model=PaginatedArticles)
def get_articles(
    # Фильтрация
    category: Optional[str] = Query(None, description="Фильтр по категории"),
    search: Optional[str] = Query(None, description="Поиск по заголовку и содержанию"),
    author: Optional[str] = Query(None, description="Фильтр по автору"),
    min_read_time: Optional[int] = Query(None, description="Мин. время чтения (мин)"),
    max_read_time: Optional[int] = Query(None, description="Макс. время чтения (мин)"),
    # Сортировка
    sort_by: Optional[str] = Query("published_at", description="Поле сортировки: published_at, read_time, title"),
    sort_order: Optional[str] = Query("desc", description="Порядок: asc или desc"),
    # Пагинация
    page: int = Query(1, ge=1, description="Номер страницы"),
    page_size: int = Query(6, ge=1, le=50, description="Размер страницы"),
    db: Session = Depends(get_db),
):
    query = db.query(Article).filter(Article.is_active == 1)

    # Фильтрация
    if category:
        query = query.filter(Article.category == category)
    if author:
        query = query.filter(Article.author.ilike(f"%{author}%"))
    if min_read_time:
        query = query.filter(Article.read_time >= min_read_time)
    if max_read_time:
        query = query.filter(Article.read_time <= max_read_time)
    if search:
        query = query.filter(
            Article.title.ilike(f"%{search}%") |
            Article.content.ilike(f"%{search}%")
        )

    # Сортировка
    sort_fields = {
        "published_at": Article.published_at,
        "read_time": Article.read_time,
        "title": Article.title,
    }
    sort_field = sort_fields.get(sort_by, Article.published_at)
    if sort_order == "asc":
        query = query.order_by(asc(sort_field))
    else:
        query = query.order_by(desc(sort_field))

    # Общее количество
    total = query.count()

    # Пагинация
    offset = (page - 1) * page_size
    articles = query.offset(offset).limit(page_size).all()

    return PaginatedArticles(
        items=[article_to_response(a) for a in articles],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )


@router.get("/categories/list")
def get_categories(db: Session = Depends(get_db)):
    articles = db.query(Article).filter(Article.is_active == 1).all()
    categories = list(set(a.category for a in articles))
    return {"categories": categories}


@router.get("/{article_id}", response_model=ArticleResponse)
def get_article(article_id: int, db: Session = Depends(get_db)):
    article = (
        db.query(Article)
        .filter(Article.id == article_id, Article.is_active == 1)
        .first()
    )
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article_to_response(article)
