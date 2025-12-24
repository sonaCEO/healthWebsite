from pydantic import BaseModel
from typing import List, Optional


class Ingredient(BaseModel):
    name: str
    amount: str
    unit: str


class RecipeResponse(BaseModel):
    id: int
    title: str
    description: str
    ingredients: List[Ingredient]
    instructions: List[str]
    cooking_time: int  # в минутах
    calories: int
    protein: int
    carbs: int
    fat: int
    category: str
    difficulty: str
    image_url: Optional[str] = None
    tags: List[str]

    class Config:
        from_attributes = True


class RecipeSearch(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    max_cooking_time: Optional[int] = None
    max_calories: Optional[int] = None
    tags: Optional[List[str]] = None