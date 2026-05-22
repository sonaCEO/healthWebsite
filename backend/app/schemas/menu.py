from pydantic import BaseModel
from typing import Literal, Optional

class CalcIn(BaseModel):
    sex: Literal["male","female"]
    height_cm: int
    weight_kg: float
    age: int
    activity: Literal["sedentary","light","moderate","high"]
    goal: Literal["loss","maintain","gain"]

class MenuItem(BaseModel):
    id: int
    title: str
    calories: int
    items: list[str]
    pdf_url: Optional[str] = None
    price: Optional[float] = 0.0

class MenuPlanCreate(BaseModel):
    title: str
    calories: int
    goal: str
    pdf_filename: Optional[str] = None
    price: Optional[float] = 0.0

class MenuPlanResponse(BaseModel):
    id: int
    title: str
    calories: int
    goal: str
    pdf_url: Optional[str]
    price: float
    
    class Config:
        from_attributes = True