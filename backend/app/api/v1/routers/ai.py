from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.recipe import Recipe
from typing import List, Optional
import openai
import os
import json
from dotenv import load_dotenv

router = APIRouter()

# Загружаем переменные окружения
load_dotenv()

# Получаем API ключ
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")

# Инициализируем OpenAI клиент
# client = openai.OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY
    client = openai
else:
    client = None
    
def ai_is_available():
    return OPENAI_API_KEY and OPENAI_API_KEY.startswith("sk-")

@router.post("/search-recipes")
async def ai_search_recipes(
    query: str,
    max_results: int = 10,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI-поиск рецептов по описанию
    Пример запроса: "вегетарианский ужин на 30 минут с низким содержанием углеводов"
    """
    
    # Если AI не настроен, используем обычный поиск
    if not ai_is_available():
        return fallback_search(query, db, max_results)
    
    try:
        # Шаг 1: AI анализирует запрос и извлекает критерии
        ai_criteria = await analyze_query_with_ai(query)
        
        # Шаг 2: Ищем рецепты в БД по критериям AI
        recipes = search_recipes_by_criteria(db, ai_criteria, max_results)
        
        # Шаг 3: AI ранжирует и комментирует результаты
        enhanced_recipes = await enhance_results_with_ai(recipes, query)
        
        return {
            "query": query,
            "ai_analysis": ai_criteria,
            "recipes": enhanced_recipes,
            "total_found": len(enhanced_recipes),
            "ai_available": True
        }
        
    except Exception as e:
        print(f"AI search error: {e}")
        # Fallback на обычный поиск
        return fallback_search(query, db, max_results)

async def analyze_query_with_ai(query: str) -> dict:
    """Анализ запроса пользователя с помощью AI"""
    
    system_prompt = """
    Ты - помощник по поиску рецептов здорового питания. 
    Проанализируй запрос пользователя и извлеки критерии поиска.
    
    Верни ТОЛЬКО JSON объект со следующими полями:
    {
        "meal_type": ["завтрак", "обед", "ужин", "десерт", "перекус"] или null,
        "max_cooking_time": число в минутах или null,
        "max_calories": число или null,
        "dietary_restrictions": ["вегетарианский", "низкоуглеводный", "белковый", "низкокалорийный", "безглютеновый"] или [],
        "ingredients": ["ингредиент1", "ингредиент2"] или [],
        "cuisine": ["итальянская", "азиатская", "русская"] или [],
        "difficulty": ["easy", "medium", "hard"] или []
    }
    
    Примеры:
    Запрос: "лёгкий вегетарианский ужин"
    Ответ: {"meal_type": ["ужин"], "max_cooking_time": null, "max_calories": null, "dietary_restrictions": ["вегетарианский"], "ingredients": [], "cuisine": [], "difficulty": ["easy"]}
    
    Запрос: "быстрый завтрак с яйцами на 15 минут"
    Ответ: {"meal_type": ["завтрак"], "max_cooking_time": 15, "max_calories": null, "dietary_restrictions": [], "ingredients": ["яйца"], "cuisine": [], "difficulty": []}
    """
    
    response = client.ChatCompletion.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Запрос пользователя: {query}"}
        ],
        temperature=0.3,
        max_tokens=300
    )
    
    # Парсим JSON ответ AI
    try:
        ai_response = response.choices[0].message.content.strip()
        criteria = json.loads(ai_response)
        return criteria
    except json.JSONDecodeError:
        # Если AI вернул не JSON, возвращаем пустые критерии
        return {}

def search_recipes_by_criteria(db: Session, criteria: dict, max_results: int) -> List[Recipe]:
    """Поиск рецептов в БД по критериям AI"""
    
    query = db.query(Recipe).filter(Recipe.is_active == 1)
    
    # Фильтрация по типу приёма пищи
    if criteria.get("meal_type"):
        # Здесь можно добавить логику сопоставления meal_type с category
        # Например: завтрак → breakfast, обед → main, etc.
        pass
    
    # Фильтрация по времени приготовления
    if criteria.get("max_cooking_time"):
        query = query.filter(Recipe.cooking_time <= criteria["max_cooking_time"])
    
    # Фильтрация по калориям
    if criteria.get("max_calories"):
        query = query.filter(Recipe.calories <= criteria["max_calories"])
    
    # Фильтрация по диетическим ограничениям (через теги)
    if criteria.get("dietary_restrictions"):
        restrictions = criteria["dietary_restrictions"]
        # Ищем рецепты, у которых есть хотя бы один из тегов
        for restriction in restrictions:
            query = query.filter(Recipe.tags.contains([restriction]))
    
    # Фильтрация по ингредиентам (в реальной БД нужно поле ingredients_search)
    if criteria.get("ingredients"):
        # Упрощённая проверка по названию рецепта/тегам
        ingredients = criteria["ingredients"]
        for ingredient in ingredients:
            query = query.filter(
                (Recipe.title.contains(ingredient)) | 
                (Recipe.tags.contains([ingredient]))
            )
    
    # Фильтрация по сложности
    if criteria.get("difficulty"):
        difficulties = criteria["difficulty"]
        query = query.filter(Recipe.difficulty.in_(difficulties))
    
    return query.limit(max_results).all()

async def enhance_results_with_ai(recipes: List[Recipe], original_query: str) -> List[dict]:
    """AI улучшает и комментирует результаты поиска"""
    
    if not recipes or not ai_is_available():
        return [recipe_to_dict(r) for r in recipes]
    
    # Подготавливаем данные для AI
    recipes_data = [recipe_to_dict(r) for r in recipes]
    
    system_prompt = """
    Ты - кулинарный эксперт. Проанализируй найденные рецепты относительно запроса пользователя.
    Для каждого рецепта добавь:
    1. Почему он подходит под запрос (1-2 предложения)
    2. Рекомендацию по приготовлению (если есть)
    3. Оценку соответствия запросу от 1 до 10
    
    Верни ТОЛЬКО JSON массив с дополненными рецептами.
    """
    
    try:
        response = client.ChatCompletion.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Запрос: {original_query}\nРецепты: {json.dumps(recipes_data, ensure_ascii=False)}"}
            ],
            temperature=0.5,
            max_tokens=1000
        )
        
        enhanced_recipes = json.loads(response.choices[0].message.content)
        return enhanced_recipes
        
    except Exception as e:
        print(f"AI enhancement error: {e}")
        return recipes_data

def fallback_search(query: str, db: Session, max_results: int) -> dict:
    """Обычный поиск, если AI недоступен"""
    
    recipes = db.query(Recipe).filter(
        Recipe.is_active == 1,
        (Recipe.title.contains(query)) | 
        (Recipe.description.contains(query)) |
        (Recipe.tags.contains([query]))
    ).limit(max_results).all()
    
    return {
        "query": query,
        "recipes": [recipe_to_dict(r) for r in recipes],
        "total_found": len(recipes),
        "ai_available": False,
        "note": "Используется обычный поиск. Для AI поиска настройте OpenAI API ключ."
    }

def recipe_to_dict(recipe: Recipe) -> dict:
    """Преобразование модели рецепта в словарь"""
    return {
        "id": recipe.id,
        "title": recipe.title,
        "description": recipe.description,
        "cooking_time": recipe.cooking_time,
        "calories": recipe.calories,
        "category": recipe.category,
        "difficulty": recipe.difficulty,
        "tags": recipe.tags or [],
        "protein": recipe.protein,
        "carbs": recipe.carbs,
        "fat": recipe.fat
    }

@router.get("/ai-status")
def check_ai_status():
    """Проверка статуса AI интеграции"""
    return {
        "ai_available": ai_is_available(),
        "model": OPENAI_MODEL if ai_is_available() else None,
        "note": "Для включения AI добавьте OPENAI_API_KEY в .env файл" if not ai_is_available() else "AI готов к работе"
    }

@router.post("/generate-menu-plan")
async def generate_ai_menu_plan(
    user_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Генерация персонального меню с помощью AI"""
    
    if not ai_is_available():
        raise HTTPException(status_code=400, detail="AI не доступен. Настройте OpenAI API.")
    
    try:
        # Извлекаем данные пользователя
        goal = user_data.get("goal", "maintain")  # loss, maintain, gain
        calories = user_data.get("calories", 2000)
        preferences = user_data.get("preferences", [])
        restrictions = user_data.get("restrictions", [])
        days = user_data.get("days", 7)
        
        system_prompt = f"""
        Ты - диетолог и нутрициолог. Создай персонализированное меню на {days} дней.
        
        Цель: {goal}
        Суточная норма калорий: {calories}
        Предпочтения: {', '.join(preferences) if preferences else 'нет'}
        Ограничения: {', '.join(restrictions) if restrictions else 'нет'}
        
        Верни ТОЛЬКО JSON объект со структурой:
        {{
            "plan_name": "название плана",
            "total_days": {days},
            "daily_calories": {calories},
            "days": [
                {{
                    "day": 1,
                    "meals": [
                        {{
                            "meal": "завтрак",
                            "description": "описание блюда",
                            "calories": число,
                            "recipe_suggestion": "предлагаемый рецепт"
                        }}
                    ]
                }}
            ],
            "shopping_list": ["ингредиент1", "ингредиент2"],
            "recommendations": ["рекомендация1", "рекомендация2"]
        }}
        """
        
        response = client.ChatCompletion.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Создай персональное меню питания"}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        menu_plan = json.loads(response.choices[0].message.content)
        
        # Сохраняем сгенерированное меню в БД
        db_menu = MenuPlan(
            title=menu_plan.get("plan_name", "AI-меню"),
            description=f"Сгенерировано AI для цели: {goal}",
            calories=calories,
            goal=goal,
            days=days,
            items=json.dumps(menu_plan),
            is_active=1
        )
        db.add(db_menu)
        db.commit()
        
        return {
            "menu": menu_plan,
            "menu_id": db_menu.id,
            "generated_by": "AI"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI ошибка: {str(e)}")