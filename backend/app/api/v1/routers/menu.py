from fastapi import APIRouter
from pydantic import BaseModel
from typing import Literal
from app.schemas.menu import CalcIn, MenuItem
router = APIRouter()



def activity_multiplier(a: str) -> float:
    return {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "high": 1.725
    }[a]

@router.post("/calculate")
def calculate(data: CalcIn):
    if data.sex == "male":
        bmr = 10 * data.weight_kg + 6.25 * data.height_cm - 5 * data.age + 5
    else:
        bmr = 10 * data.weight_kg + 6.25 * data.height_cm - 5 * data.age - 161
    tdee = bmr * activity_multiplier(data.activity)
    maintain = round(tdee)
    loss = round(tdee * 0.8)
    gain = round(tdee * 1.15)

    sample_menu = {
        "loss": c(id=1, title="Меню для похудения", calories=loss, items=["Овсянка 50g","Куриное филе 100g"]).dict(),
        "maintain": MenuItem(id=2, title="Меню для поддержания", calories=maintain, items=["Гречка 100g","Рыба 150g"]).dict(),
        "gain": MenuItem(id=3, title="Меню для набора", calories=gain, items=["Рис 200g","Говядина 200g"]).dict(),
    }
    chosen = sample_menu["loss"] if data.goal=="loss" else sample_menu["maintain"] if data.goal=="maintain" else sample_menu["gain"]

    return {"bmr": round(bmr), "maintain": maintain, "loss": loss, "gain": gain, "chosen_menu": chosen}
