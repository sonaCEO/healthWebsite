import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.base import Base
from app.core.dependencies import get_db
from app.core.security import get_password_hash
from app.models.user import User
from app.models.recipe import Recipe
from app.models.article import Article
import os

# TEST_DATABASE_URL = "postgresql://sona@localhost/appdb_test"
TEST_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://sona@localhost/appdb_test")

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db):
    def override_get_db():
        yield db
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db):
    user = User(
        email="testuser@example.com",
        hashed_password=get_password_hash("testpass123"),
        full_name="Test User",
        is_active=True,
        is_admin=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_admin(db):
    admin = User(
        email="admin@example.com",
        hashed_password=get_password_hash("adminpass123"),
        full_name="Test Admin",
        is_active=True,
        is_admin=True
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin

@pytest.fixture
def user_token(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": test_user.email, "password": "testpass123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    return response.json()["access_token"]

@pytest.fixture
def admin_token(client, test_admin):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": test_admin.email, "password": "adminpass123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    return response.json()["access_token"]

@pytest.fixture
def test_recipe(db):
    import json
    recipe = Recipe(
        title="Тестовый рецепт",
        description="Описание тестового рецепта",
        ingredients=json.dumps([{"name": "Ингредиент", "amount": "100", "unit": "г"}]),
        instructions=json.dumps(["Шаг 1", "Шаг 2"]),
        cooking_time=30,
        calories=300,
        protein=20,
        carbs=40,
        fat=10,
        category="main",
        difficulty="easy",
        tags=json.dumps(["тест"]),
        is_active=1
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe

@pytest.fixture
def test_article(db):
    import json
    from datetime import datetime
    article = Article(
        title="Тестовая статья",
        content="Содержание тестовой статьи",
        author="Тестовый автор",
        category="nutrition",
        read_time=5,
        published_at=datetime.utcnow(),
        tags=json.dumps(["тест"]),
        is_active=1
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article