from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from datetime import datetime

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.menu import MenuPlan
from app.schemas.menu import CalcIn, MenuItem, MenuPlanCreate, MenuPlanResponse

router = APIRouter()

# Папка для хранения PDF файлов
PDF_UPLOAD_DIR = "uploads/menu_pdfs"
os.makedirs(PDF_UPLOAD_DIR, exist_ok=True)

def activity_multiplier(a: str) -> float:
    return {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "high": 1.725
    }[a]

@router.post("/calculate")
def calculate_calories(data: CalcIn, db: Session = Depends(get_db)):
    """Расчёт калорий и подбор меню с PDF"""
    # Расчёт калорий
    if data.sex == "male":
        bmr = 10 * data.weight_kg + 6.25 * data.height_cm - 5 * data.age + 5
    else:
        bmr = 10 * data.weight_kg + 6.25 * data.height_cm - 5 * data.age - 161
    
    tdee = bmr * activity_multiplier(data.activity)
    maintain = round(tdee)
    loss = round(tdee * 0.8)
    gain = round(tdee * 1.15)

    menu_plans = db.query(MenuPlan).filter(
        MenuPlan.is_active == 1,
        MenuPlan.goal == data.goal
    ).all()
    
    if menu_plans:
        chosen_plan = menu_plans[0]
        response = {
            "bmr": round(bmr),
            "maintain": maintain,
            "loss": loss,
            "gain": gain,
            "recommended_plan": MenuPlanResponse.from_orm(chosen_plan)
        }
    else:
        sample_menus = {
            "loss": {
                "id": 1,
                "title": "Меню для похудения",
                "calories": loss,
                "items": ["Овсянка 50g", "Куриное филе 100g", "Овощной салат"],
                "pdf_url": "/api/v1/menu/pdf/loss_sample.pdf",
                "price": 2990.0
            },
            "maintain": {
                "id": 2,
                "title": "Меню для поддержания веса",
                "calories": maintain,
                "items": ["Гречка 100g", "Рыба 150g", "Фрукты"],
                "pdf_url": "/api/v1/menu/pdf/maintain_sample.pdf",
                "price": 2490.0
            },
            "gain": {
                "id": 3,
                "title": "Меню для набора массы",
                "calories": gain,
                "items": ["Рис 200g", "Говядина 200g", "Творог 150g"],
                "pdf_url": "/api/v1/menu/pdf/gain_sample.pdf",
                "price": 3490.0
            }
        }
        
        chosen = sample_menus[data.goal]
        response = {
            "bmr": round(bmr),
            "maintain": maintain,
            "loss": loss,
            "gain": gain,
            "recommended_plan": chosen
        }
    
    return response

@router.get("/pdf/{filename}")
def get_menu_pdf(filename: str):
    """Скачивание PDF файла меню"""
    file_path = os.path.join(PDF_UPLOAD_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    return FileResponse(
        path=file_path,
        filename=f"menu_{filename}",
        media_type="application/pdf"
    )

@router.post("/upload-pdf")
async def upload_menu_pdf(
    file: UploadFile = File(...),
    menu_data: MenuPlanCreate = Depends(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Загрузка PDF файла для меню (админ)"""
    # Проверка, что файл PDF
    if not file.filename.endswith('.pdf'):
        raise HTTPException(400, detail="Only PDF files are allowed")
    
    # Генерируем уникальное имя файла
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"menu_{menu_data.goal}_{timestamp}.pdf"
    file_path = os.path.join(PDF_UPLOAD_DIR, filename)
    
    # Сохраняем файл
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Создаём/обновляем запись меню в БД
    menu_plan = db.query(MenuPlan).filter(
        MenuPlan.goal == menu_data.goal,
        MenuPlan.calories == menu_data.calories
    ).first()
    
    if menu_plan:
        menu_plan.pdf_filename = filename
        menu_plan.pdf_url = f"/api/v1/menu/pdf/{filename}"
    else:
        menu_plan = MenuPlan(
            title=menu_data.title,
            calories=menu_data.calories,
            goal=menu_data.goal,
            pdf_filename=filename,
            pdf_url=f"/api/v1/menu/pdf/{filename}",
            price=menu_data.price if hasattr(menu_data, 'price') else 0.0
        )
        db.add(menu_plan)
    
    db.commit()
    
    return {
        "message": "PDF uploaded successfully",
        "filename": filename,
        "pdf_url": f"/api/v1/menu/pdf/{filename}",
        "menu_id": menu_plan.id
    }

@router.get("/plans", response_model=List[MenuPlanResponse])
def get_menu_plans(
    goal: str = None,
    db: Session = Depends(get_db)
):
    """Получение всех доступных меню с PDF"""
    query = db.query(MenuPlan).filter(MenuPlan.is_active == 1)
    
    if goal:
        query = query.filter(MenuPlan.goal == goal)
    
    plans = query.all()
    return plans

@router.post("/purchase/{menu_id}")
def purchase_menu(
    menu_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Покупка меню (создание заказа и предоставление доступа к PDF)"""
    menu_plan = db.query(MenuPlan).filter(
        MenuPlan.id == menu_id,
        MenuPlan.is_active == 1
    ).first()
    
    if not menu_plan:
        raise HTTPException(status_code=404, detail="Menu plan not found")
    
    if not menu_plan.pdf_url:
        raise HTTPException(status_code=400, detail="PDF not available for this menu")
    
    # Здесь должна быть логика оплаты
    # Пока просто создаём заказ и возвращаем PDF
    
    # Создаём заказ (упрощённо)
    from app.models.order import Order, OrderItem
    order = Order(
        user_id=current_user.id,
        total_amount=menu_plan.price,
        status="pending",
        delivery_address="Digital product",
        phone=current_user.phone or "",
        delivery_date=datetime.utcnow()
    )
    db.add(order)
    db.flush()
    
    order_item = OrderItem(
        order_id=order.id,
        menu_plan_id=menu_plan.id,
        quantity=1,
        price=menu_plan.price,
        title=menu_plan.title
    )
    db.add(order_item)
    db.commit()
    
    return {
        "message": "Menu purchased successfully",
        "order_id": order.id,
        "menu_title": menu_plan.title,
        "pdf_url": menu_plan.pdf_url,
        "download_url": f"/api/v1/menu/download/{menu_id}?order_id={order.id}"
    }

@router.get("/download/{menu_id}")
def download_menu_pdf(
    menu_id: int,
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Скачивание PDF после оплаты (с проверкой доступа)"""
    # Проверяем, что заказ принадлежит пользователю
    from app.models.order import Order
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id,
        Order.status.in_(["confirmed", "delivered"])
    ).first()
    
    if not order:
        raise HTTPException(status_code=403, detail="Access denied or order not found")
    
    menu_plan = db.query(MenuPlan).filter(MenuPlan.id == menu_id).first()
    if not menu_plan or not menu_plan.pdf_filename:
        raise HTTPException(status_code=404, detail="PDF not found")
    
    file_path = os.path.join(PDF_UPLOAD_DIR, menu_plan.pdf_filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    return FileResponse(
        path=file_path,
        filename=f"{menu_plan.title.replace(' ', '_')}.pdf",
        media_type="application/pdf"
    )