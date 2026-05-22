# from fastapi import FastAPI
# from app.api.v1.routers import menu
# from app.db import base
# from app.core.dependencies import engine

# app = FastAPI()

# base.Base.metadata.create_all(bind=engine)

# @app.get("/health", tags=["health"])
# def health():
#     return {"status": "ok"}

# app.include_router(menu.router, prefix="/api/v1/menu", tags=["menu"])

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.utils import get_openapi
from fastapi.responses import Response, PlainTextResponse
from app.api.v1.routers import auth, menu, recipes, articles, orders, ai, admin
from app.db.base import Base
from app.core.dependencies import engine
import os
from app.core.dependencies import SessionLocal
from app.models.recipe import Recipe
from app.models.article import Article
from datetime import datetime

from dotenv import load_dotenv
load_dotenv()

app = FastAPI(
    title="Health & Nutrition API",
    description="API для сайта здорового питания pp.health",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(menu.router, prefix="/api/v1/menu", tags=["menu"])
app.include_router(recipes.router, prefix="/api/v1/recipes", tags=["recipes"])
app.include_router(articles.router, prefix="/api/v1/articles", tags=["articles"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["orders"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Health & Nutrition API",
        version="1.0.0",
        description="API для сайта здорового питания pp.health",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "Bearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"Bearer": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

@app.get("/")
def root():
    return {"message": "Добро пожаловать в API pp.health"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

@app.get("/robots.txt", response_class=PlainTextResponse)
def robots_txt():
    return """User-agent: *
Allow: /
Allow: /recipes
Allow: /articles
Allow: /menu

Disallow: /admin
Disallow: /orders
Disallow: /checkout
Disallow: /api/

Sitemap: http://localhost:5173/sitemap.xml
"""
@app.get("/sitemap.xml")
def sitemap():
    db = SessionLocal()
    try:
        # Получаем все активные рецепты и статьи
        recipes_list = db.query(Recipe).filter(Recipe.is_active == 1).all()
        articles_list = db.query(Article).filter(Article.is_active == 1).all()
    finally:
        db.close()

    base_url = "http://localhost:5173"
    today = datetime.utcnow().strftime("%Y-%m-%d")

    # Статические страницы
    static_pages = [
        {"url": "/", "priority": "1.0", "changefreq": "daily"},
        {"url": "/recipes", "priority": "0.9", "changefreq": "daily"},
        {"url": "/articles", "priority": "0.9", "changefreq": "daily"},
        {"url": "/menu", "priority": "0.8", "changefreq": "weekly"},
    ]

    urls = ""

    # статические страницы
    for page in static_pages:
        urls += f"""
    <url>
        <loc>{base_url}{page['url']}</loc>
        <lastmod>{today}</lastmod>
        <changefreq>{page['changefreq']}</changefreq>
        <priority>{page['priority']}</priority>
    </url>"""

    # страницы рецептов
    for recipe in recipes_list:
        urls += f"""
    <url>
        <loc>{base_url}/recipes/{recipe.id}</loc>
        <lastmod>{today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>"""

    # Добавляем страницы статей
    for article in articles_list:
        urls += f"""
    <url>
        <loc>{base_url}/articles/{article.id}</loc>
        <lastmod>{today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>"""

    xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{urls}
</urlset>"""

    return Response(content=xml_content, media_type="application/xml")

# JSON-LD структурированные данные для рецептов
@app.get("/api/v1/seo/recipe/{recipe_id}")
def get_recipe_jsonld(recipe_id: int):
    db = SessionLocal()
    try:
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if not recipe:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Recipe not found")

        import json
        ingredients = json.loads(recipe.ingredients) if isinstance(recipe.ingredients, str) else recipe.ingredients

        return {
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": recipe.title,
            "description": recipe.description,
            "recipeIngredient": [
                f"{i.get('amount', '')} {i.get('unit', '')} {i.get('name', '')}"
                for i in ingredients
            ],
            "recipeCategory": recipe.category,
            "nutrition": {
                "@type": "NutritionInformation",
                "calories": f"{recipe.calories} calories",
                "proteinContent": f"{recipe.protein}g",
                "fatContent": f"{recipe.fat}g",
                "carbohydrateContent": f"{recipe.carbs}g",
            },
            "prepTime": f"PT{recipe.cooking_time}M",
        }
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    
@app.get("/health")
async def health_check():
    return {"status": "healthy"}