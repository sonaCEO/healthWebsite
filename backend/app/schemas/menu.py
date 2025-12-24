from pydantic import BaseModel
from typing import Literal

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