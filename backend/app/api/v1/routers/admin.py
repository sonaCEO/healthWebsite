from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
from datetime import datetime
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.recipe import Recipe
from app.models.article import Article
from app.models.menu import MenuPlan
from app.models.order import Order, OrderItem
from app.schemas.recipes import RecipeResponse
from app.schemas.article import ArticleCreate, ArticleResponse
from app.schemas.menu import MenuPlanCreate, MenuPlanResponse
from app.schemas.order import OrderResponse

router = APIRouter()

import json


def recipe_to_response(recipe: Recipe) -> RecipeResponse:
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


def is_admin(user: User):
    return user.is_admin == True


UPLOAD_DIR = "uploads"
IMAGE_UPLOAD_DIR = os.path.join(UPLOAD_DIR, "images")
PDF_UPLOAD_DIR = os.path.join(UPLOAD_DIR, "menu_pdfs")

os.makedirs(IMAGE_UPLOAD_DIR, exist_ok=True)
os.makedirs(PDF_UPLOAD_DIR, exist_ok=True)


@router.get("/dashboard")
def admin_dashboard(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")

    stats = {
        "total_users": db.query(User).count(),
        "total_recipes": db.query(Recipe).filter(Recipe.is_active == 1).count(),
        "total_articles": db.query(Article).filter(Article.is_active == 1).count(),
        "total_menu_plans": db.query(MenuPlan).filter(MenuPlan.is_active == 1).count(),
        "total_orders": db.query(Order).count(),
        "pending_orders": db.query(Order).filter(Order.status == "pending").count(),
        "active_users": db.query(User).filter(User.is_active == True).count(),
    }

    return {
        "stats": stats,
        "admin": current_user.email,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/recipes", response_model=List[RecipeResponse])
def get_all_recipes_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):

    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")

    recipes = (
        db.query(Recipe).filter(Recipe.is_active == 1).offset(skip).limit(limit).all()
    )
    return [recipe_to_response(r) for r in recipes]


@router.post("/recipes", response_model=RecipeResponse)
def create_recipe_admin(
    recipe_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")

    recipe_data["is_active"] = 1

    db_recipe = Recipe(**recipe_data)
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)

    return recipe_to_response(db_recipe)


@router.put("/recipes/{recipe_id}", response_model=RecipeResponse)
def update_recipe_admin(
    recipe_id: int,
    recipe_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")

    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    for key, value in recipe_data.items():
        setattr(db_recipe, key, value)

    db.commit()
    db.refresh(db_recipe)
    return recipe_to_response(db_recipe)


@router.delete("/recipes/{recipe_id}")
def delete_recipe_admin(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")

    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    db_recipe.is_active = 0
    db.commit()
    return {"message": "Recipe deleted successfully"}


@router.get("/articles", response_model=List[ArticleResponse])
def get_all_articles_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    category: Optional[str] = None,
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")

    query = db.query(Article).filter(Article.is_active == 1)
    if category:
        query = query.filter(Article.category == category)

    articles = query.all()
    return [article_to_response(a) for a in articles]


@router.post("/articles", response_model=ArticleResponse)
def create_article_admin(
    article_data: ArticleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")

    db_article = Article(**article_data.dict())
    db_article.is_active = 1
    db_article.published_at = datetime.utcnow()

    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return article_to_response(db_article)


@router.get("/menu-plans", response_model=List[MenuPlanResponse])
def get_all_menu_plans_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    goal: Optional[str] = None,
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")

    query = db.query(MenuPlan).filter(MenuPlan.is_active == 1)
    if goal:
        query = query.filter(MenuPlan.goal == goal)

    plans = query.all()
    return plans


@router.post("/menu-plans", response_model=MenuPlanResponse)
def create_menu_plan_admin(
    menu_data: MenuPlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")

    db_menu = MenuPlan(**menu_data.dict())
    db_menu.is_active = 1

    db.add(db_menu)
    db.commit()
    db.refresh(db_menu)
    return db_menu


@router.get("/orders", response_model=List[OrderResponse])
def get_all_orders_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")

    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)

    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return orders


@router.put("/orders/{order_id}/status")
def update_order_status_admin(
    order_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")

    valid_statuses = [
        "pending",
        "confirmed",
        "preparing",
        "delivering",
        "delivered",
        "cancelled",
    ]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}"
        )

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    db.commit()

    return {"message": f"Order status updated to {status}", "order_id": order_id}


@router.get("/users")
def get_all_users_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")

    users = db.query(User).offset(skip).limit(limit).all()

    return [
        {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_active": user.is_active,
            "created_orders": len(user.orders) if hasattr(user, "orders") else 0,
        }
        for user in users
    ]


@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")

    user.is_active = not user.is_active
    db.commit()

    status = "activated" if user.is_active else "deactivated"
    return {
        "message": f"User {status}",
        "user_id": user_id,
        "is_active": user.is_active,
    }

from app.core.storage import upload_file, get_presigned_url, delete_file
from app.core.config import settings

@router.post("/upload-image")
async def upload_image_admin(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")
    
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Allowed extensions: {', '.join(allowed_extensions)}")
    
    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max size is 5MB")
    
    filename = upload_file(
        file_bytes=file_bytes,
        filename=file.filename,
        bucket=settings.MINIO_BUCKET_IMAGES,
        content_type=file.content_type or "image/jpeg"
    )
    
    url = get_presigned_url(filename, settings.MINIO_BUCKET_IMAGES)
    
    return {
        "message": "Image uploaded successfully",
        "filename": filename,
        "url": url,
        "size": len(file_bytes)
    }

@router.post("/upload-pdf")
async def upload_pdf_admin(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    file_bytes = await file.read()
    if len(file_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max size is 20MB")
    
    filename = upload_file(
        file_bytes=file_bytes,
        filename=file.filename,
        bucket=settings.MINIO_BUCKET_PDFS,
        content_type="application/pdf"
    )
    
    url = get_presigned_url(filename, settings.MINIO_BUCKET_PDFS)
    
    return {
        "message": "PDF uploaded successfully",
        "filename": filename,
        "url": url,
        "size": len(file_bytes)
    }

@router.get("/file-url/{bucket}/{filename}")
async def get_file_url(
    bucket: str,
    filename: str,
    current_user: User = Depends(get_current_user)
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")
    
    if bucket not in [settings.MINIO_BUCKET_IMAGES, settings.MINIO_BUCKET_PDFS]:
        raise HTTPException(status_code=400, detail="Invalid bucket")
    
    url = get_presigned_url(filename, bucket)
    return {"url": url}

@router.delete("/file/{bucket}/{filename}")
async def delete_file_admin(
    bucket: str,
    filename: str,
    current_user: User = Depends(get_current_user)
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")
    
    if bucket not in [settings.MINIO_BUCKET_IMAGES, settings.MINIO_BUCKET_PDFS]:
        raise HTTPException(status_code=400, detail="Invalid bucket")
    
    success = delete_file(filename, bucket)
    if not success:
        raise HTTPException(status_code=404, detail="File not found")
    
    return {"message": "File deleted successfully"}


@router.get("/system-info")
def get_system_info(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")

    import platform
    import psutil

    return {
        "system": {
            "platform": platform.platform(),
            "python_version": platform.python_version(),
            "cpu_count": psutil.cpu_count(),
            "memory_total": psutil.virtual_memory().total,
            "memory_available": psutil.virtual_memory().available,
        },
        "database": {
            "url": str(db.bind.url) if hasattr(db, "bind") and db.bind else "unknown",
            "tables": [
                "users",
                "recipes",
                "articles",
                "menu_plans",
                "orders",
                "order_items",
            ],
        },
        "uploads": {
            "images_count": (
                len(os.listdir(IMAGE_UPLOAD_DIR))
                if os.path.exists(IMAGE_UPLOAD_DIR)
                else 0
            ),
            "pdfs_count": (
                len(os.listdir(PDF_UPLOAD_DIR)) if os.path.exists(PDF_UPLOAD_DIR) else 0
            ),
            "total_size": (
                sum(
                    os.path.getsize(os.path.join(IMAGE_UPLOAD_DIR, f))
                    for f in os.listdir(IMAGE_UPLOAD_DIR)
                )
                if os.path.exists(IMAGE_UPLOAD_DIR)
                else 0
            ),
        },
    }


@router.post("/backup")
def create_backup(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    return {
        "message": "Backup created (demo)",
        "backup_id": f"backup_{timestamp}",
        "tables_backed_up": ["users", "recipes", "articles", "orders"],
        "download_url": f"/api/v1/admin/backup/download/{timestamp}",
    }


@router.get("/health-check")
def admin_health_check(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        db.execute("SELECT 1").scalar()
        db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"

    folders = {
        "uploads": os.path.exists(UPLOAD_DIR),
        "images": os.path.exists(IMAGE_UPLOAD_DIR),
        "pdfs": os.path.exists(PDF_UPLOAD_DIR),
    }

    return {
        "status": "admin_healthy",
        "database": db_status,
        "folders": folders,
        "admin_user": current_user.email,
        "timestamp": datetime.utcnow().isoformat(),
    }
