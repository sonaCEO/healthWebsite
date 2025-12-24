from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from sqlalchemy.orm import Session
from app.schemas.recipes import RecipeResponse, Ingredient, RecipeSearch


router = APIRouter()

SAMPLE_RECIPES = [
    RecipeResponse(
        id=1,
        title="Гречневая каша с курицей",
        description="Питательная гречневая каша с нежным куриным филе",
        ingredients=[
            Ingredient(name="Гречка", amount="100", unit="г"),
            Ingredient(name="Куриное филе", amount="150", unit="г"),
            Ingredient(name="Лук репчатый", amount="1", unit="шт"),
            Ingredient(name="Морковь", amount="1", unit="шт"),
            Ingredient(name="Оливковое масло", amount="1", unit="ст.л")
        ],
        instructions=[
            "Промойте гречку и отварите до готовности",
            "Нарежьте куриное филе кубиками и обжарьте на сковороде",
            "Добавьте нарезанные лук и морковь, тушите 10 минут",
            "Смешайте гречку с курицей и овощами",
            "Подавайте горячим"
        ],
        cooking_time=30,
        calories=350,
        protein=25,
        carbs=45,
        fat=8,
        category="main",
        difficulty="easy",
        tags=["гречка", "курица", "здоровое", "обед"]
    ),
    RecipeResponse(
        id=2,
        title="Овсянка с ягодами",
        description="Полезный завтрак с овсянкой и свежими ягодами",
        ingredients=[
            Ingredient(name="Овсяные хлопья", amount="50", unit="г"),
            Ingredient(name="Молоко", amount="200", unit="мл"),
            Ingredient(name="Мед", amount="1", unit="ч.л"),
            Ingredient(name="Смесь ягод", amount="100", unit="г")
        ],
        instructions=[
            "Доведите молоко до кипения",
            "Добавьте овсяные хлопья и варите 5-7 минут",
            "Добавьте мед и перемешайте",
            "Украсьте ягодами перед подачей"
        ],
        cooking_time=10,
        calories=250,
        protein=10,
        carbs=45,
        fat=5,
        category="breakfast",
        difficulty="very_easy",
        tags=["овсянка", "завтрак", "ягоды", "быстро"]
    )
]

@router.get("/", response_model=List[RecipeResponse])
def get_all_recipes(
    category: Optional[str] = Query(None, description="Фильтр по категории"),
    max_cooking_time: Optional[int] = Query(None, description="Максимальное время готовки"),
    tags: Optional[str] = Query(None, description="Теги через запятую")
):
    """Получить все рецепты с фильтрацией"""
    recipes = SAMPLE_RECIPES.copy()
    
    # Фильтрация по категории
    if category:
        recipes = [r for r in recipes if r.category == category]
    
    # Фильтрация по времени готовки
    if max_cooking_time:
        recipes = [r for r in recipes if r.cooking_time <= max_cooking_time]
    
    # Фильтрация по тегам
    if tags:
        tag_list = [tag.strip().lower() for tag in tags.split(",")]
        recipes = [r for r in recipes if any(tag in r.tags for tag in tag_list)]
    
    return recipes

@router.get("/{recipe_id}", response_model=RecipeResponse)
def get_recipe(recipe_id: int):
    """Получить рецепт по ID"""
    recipe = next((r for r in SAMPLE_RECIPES if r.id == recipe_id), None)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe

@router.post("/search", response_model=List[RecipeResponse])
def search_recipes(search: RecipeSearch):
    """Поиск рецептов по различным критериям"""
    recipes = SAMPLE_RECIPES.copy()
    
    # Поиск по тексту
    if search.query:
        query = search.query.lower()
        recipes = [r for r in recipes if query in r.title.lower() or query in r.description.lower()]
    
    # Фильтрация по категории
    if search.category:
        recipes = [r for r in recipes if r.category == search.category]
    
    # Фильтрация по времени готовки
    if search.max_cooking_time:
        recipes = [r for r in recipes if r.cooking_time <= search.max_cooking_time]
    
    # Фильтрация по калориям
    if search.max_calories:
        recipes = [r for r in recipes if r.calories <= search.max_calories]
    
    # Фильтрация по тегам
    if search.tags:
        recipes = [r for r in recipes if any(tag in r.tags for tag in search.tags)]
    
    return recipes

@router.get("/categories/list")
def get_categories():
    """Получить список всех категорий рецептов"""
    categories = list(set(recipe.category for recipe in SAMPLE_RECIPES))
    return {"categories": categories}

@router.get("/tags/popular")
def get_popular_tags():
    """Получить популярные теги"""
    all_tags = []
    for recipe in SAMPLE_RECIPES:
        all_tags.extend(recipe.tags)
    
    # Считаем популярность тегов
    from collections import Counter
    popular_tags = Counter(all_tags).most_common(10)
    
    return {"tags": [tag for tag, count in popular_tags]}