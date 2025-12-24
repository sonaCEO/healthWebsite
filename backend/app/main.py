from fastapi import FastAPI
from app.api.v1.routers import menu
from app.db import base
from app.core.dependencies import engine

app = FastAPI()

base.Base.metadata.create_all(bind=engine)

@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}

app.include_router(menu.router, prefix="/api/v1/menu", tags=["menu"])