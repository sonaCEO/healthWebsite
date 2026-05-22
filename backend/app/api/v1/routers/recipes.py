from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from app.core.dependencies import get_db
from app.models.recipe import Recipe
from app.schemas.recipes import RecipeResponse, RecipeSearch
from collections import Counter
import json
from pydantic import BaseModel

router = APIRouter()


# схема пагинации
class PaginatedRecipes(BaseModel):
    items: List[RecipeResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    class Config:
        from_attributes = True


def recipe_to_response(recipe: Recipe) -> RecipeResponse:
    # Конвертируем модель БД в схему ответа
    return RecipeResponse(
        id=recipe.id,
        title=recipe.title,
        description=recipe.description,
        ingredients=(
            json.loads(recipe.ingredients)
            if isinstance(recipe.ingredients, str)
            else recipe.ingredients
        ),
        instructions=(
            json.loads(recipe.instructions)
            if isinstance(recipe.instructions, str)
            else recipe.instructions
        ),
        cooking_time=recipe.cooking_time,
        calories=recipe.calories,
        protein=recipe.protein,
        carbs=recipe.carbs,
        fat=recipe.fat,
        category=recipe.category,
        difficulty=recipe.difficulty,
        image_url=recipe.image_url,
        tags=(
            json.loads(recipe.tags)
            if isinstance(recipe.tags, str)
            else recipe.tags or []
        ),
    )


# @router.get("/", response_model=List[RecipeResponse])
@router.get("/", response_model=PaginatedRecipes)
def get_all_recipes(
    # Фильтрация
    category: Optional[str] = Query(None, description="Фильтр по категории"),
    difficulty: Optional[str] = Query(None, description="Фильтр по сложности"),
    max_cooking_time: Optional[int] = Query(
        None, description="Макс. время готовки (мин)"
    ),
    max_calories: Optional[int] = Query(None, description="Макс. калорийность"),
    min_protein: Optional[int] = Query(None, description="Мин. белки (г)"),
    tags: Optional[str] = Query(None, description="Теги через запятую"),
    search: Optional[str] = Query(None, description="Поиск по названию и описанию"),
    # Сортировка
    sort_by: Optional[str] = Query(
        "id", description="Поле сортировки: id, calories, cooking_time, protein"
    ),
    sort_order: Optional[str] = Query("asc", description="Порядок: asc или desc"),
    # Пагинация
    page: int = Query(1, ge=1, description="Номер страницы"),
    page_size: int = Query(6, ge=1, le=50, description="Размер страницы"),
    db: Session = Depends(get_db),
):
    query = db.query(Recipe).filter(Recipe.is_active == 1)

    # Фильтрация
    if category:
        query = query.filter(Recipe.category == category)
    if difficulty:
        query = query.filter(Recipe.difficulty == difficulty)
    if max_cooking_time:
        query = query.filter(Recipe.cooking_time <= max_cooking_time)
    if max_calories:
        query = query.filter(Recipe.calories <= max_calories)
    if min_protein:
        query = query.filter(Recipe.protein >= min_protein)
    if search:
        query = query.filter(
            Recipe.title.ilike(f"%{search}%") | Recipe.description.ilike(f"%{search}%")
        )

    # Сортировка
    sort_fields = {
        "id": Recipe.id,
        "calories": Recipe.calories,
        "cooking_time": Recipe.cooking_time,
        "protein": Recipe.protein,
    }
    sort_field = sort_fields.get(sort_by, Recipe.id)
    if sort_order == "desc":
        query = query.order_by(desc(sort_field))
    else:
        query = query.order_by(asc(sort_field))

    # Считаем общее количество до пагинации
    total = query.count()

    # Пагинация
    offset = (page - 1) * page_size
    recipes = query.offset(offset).limit(page_size).all()

    # Фильтрация по тегам (после запроса, т.к. теги в JSON)
    if tags:
        tag_list = [tag.strip().lower() for tag in tags.split(",")]
        recipes = [
            r
            for r in recipes
            if any(
                tag in (json.loads(r.tags) if isinstance(r.tags, str) else r.tags or [])
                for tag in tag_list
            )
        ]
        total = len(recipes)

    return PaginatedRecipes(
        items=[recipe_to_response(r) for r in recipes],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{recipe_id}", response_model=RecipeResponse)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = (
        db.query(Recipe).filter(Recipe.id == recipe_id, Recipe.is_active == 1).first()
    )
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe_to_response(recipe)


@router.get("/categories/list")
def get_categories(db: Session = Depends(get_db)):
    recipes = db.query(Recipe).filter(Recipe.is_active == 1).all()
    categories = list(set(r.category for r in recipes))
    return {"categories": categories}


@router.get("/tags/popular")
def get_popular_tags(db: Session = Depends(get_db)):
    recipes = db.query(Recipe).filter(Recipe.is_active == 1).all()
    all_tags = []
    for recipe in recipes:
        tags = (
            json.loads(recipe.tags)
            if isinstance(recipe.tags, str)
            else recipe.tags or []
        )
        all_tags.extend(tags)
    popular_tags = Counter(all_tags).most_common(10)
    return {"tags": [tag for tag, count in popular_tags]}


@router.post("/search", response_model=List[RecipeResponse])
def search_recipes(search: RecipeSearch, db: Session = Depends(get_db)):
    query = db.query(Recipe).filter(Recipe.is_active == 1)

    if search.category:
        query = query.filter(Recipe.category == search.category)
    if search.max_cooking_time:
        query = query.filter(Recipe.cooking_time <= search.max_cooking_time)
    if search.max_calories:
        query = query.filter(Recipe.calories <= search.max_calories)

    recipes = query.all()

    if search.query:
        q = search.query.lower()
        recipes = [
            r for r in recipes if q in r.title.lower() or q in r.description.lower()
        ]

    if search.tags:
        recipes = [
            r
            for r in recipes
            if any(
                tag in (json.loads(r.tags) if isinstance(r.tags, str) else r.tags or [])
                for tag in search.tags
            )
        ]

    return [recipe_to_response(r) for r in recipes]
