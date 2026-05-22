from app.db.session import SessionLocal
from app.models.user import User
from app.models.recipe import Recipe
from app.models.article import Article
from app.models.menu import MenuPlan
from app.core.security import get_password_hash

def init_db():
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == "admin@pp.health").first()
        if not admin_user:
            admin_user = User(
                email="admin@pp.health",
                hashed_password=get_password_hash("admin123"),
                full_name="Администратор",
                is_active=True
            )
            db.add(admin_user)
        
        if db.query(Recipe).count() == 0:
            recipes = [
                Recipe(
                    title="Гречневая каша с курицей",
                    description="Питательная гречневая каша с нежным куриным филе",
                    ingredients=[
                        {"name": "Гречка", "amount": "100", "unit": "г"},
                        {"name": "Куриное филе", "amount": "150", "unit": "г"},
                    ],
                    instructions=["Приготовьте по инструкции"],
                    cooking_time=30,
                    calories=350,
                    protein=25,
                    carbs=45,
                    fat=8,
                    category="main",
                    difficulty="easy",
                    tags=["гречка", "курица"]
                ),
                Recipe(
        title="Овощной суп-пюре",
        description="Лёгкий овощной суп с брокколи и цветной капустой",
        ingredients=[
            {"name": "Брокколи", "amount": "200", "unit": "г"},
            {"name": "Цветная капуста", "amount": "200", "unit": "г"},
            {"name": "Морковь", "amount": "1", "unit": "шт"},
        ],
        instructions=["Варите овощи 20 минут", "Взбейте блендером"],
        cooking_time=25,
        calories=180,
        protein=8,
        carbs=25,
        fat=4,
        category="soup",
        difficulty="easy",
        tags=["суп", "вегетарианский", "легкий", "обед", "брокколи"]
    ),
    Recipe(
        title="Куриные котлеты на пару",
        description="Диетические котлеты из куриного филе",
        ingredients=[
            {"name": "Куриное филе", "amount": "500", "unit": "г"},
            {"name": "Лук", "amount": "1", "unit": "шт"},
        ],
        instructions=["Измельчите филе", "Сформируйте котлеты", "Готовьте на пару 25 мин"],
        cooking_time=40,
        calories=220,
        protein=35,
        carbs=5,
        fat=8,
        category="main",
        difficulty="medium",
        tags=["курица", "котлеты", "белковое", "диетическое", "пароварка"]
    ),
            ]
            db.add_all(recipes)
        
        if db.query(Article).count() == 0:
            articles = [
                Article(
                    title="10 принципов здорового питания",
                    content="Здоровое питание - это не диета...",
                    author="Доктор Иванова",
                    category="nutrition",
                    read_time=5,
                    tags=["питание", "здоровье"]
                ),
            ]
            db.add_all(articles)
        
        db.commit()
        print("✅ Initial data created successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()