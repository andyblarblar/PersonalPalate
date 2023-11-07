from datetime import date
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import PrimaryKeyConstraint
from enum import Enum

class Category(Enum):
    dinner = "dinner"
    lunch = "lunch"
    breakfast = "breakfast"

class AccountDTO(SQLModel, table=True):
    email: str = Field(primary_key=True)
    followable: bool = Field(default=False)

class Account(AccountDTO):  # Subclass to avoid sending password to client
    password: str

class Follow(SQLModel, table=True):
    email: str = Field(foreign_key="accountdto.email")
    followingEmail: str = Field(foreign_key="accountdto.email")

    __table_args__ = (
        PrimaryKeyConstraint("email", "followingEmail"),
    )

class Meal(SQLModel, table=True):
    mealID: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(foreign_key="accountdto.email")
    mealName: str
    category: Category
    dateMade: date

class Ingredients(SQLModel, table=True):
    ingredientID: Optional[int] = Field(default=None, primary_key=True)
    mealID: int = Field(foreign_key="meal.mealID")
    ingredient: str
    quantity: float
    unit: str

class MealPlan(SQLModel, table=True):
    mealPlanID: Optional[int] = Field(default=None, primary_key=True)
    mealPlanDate: date
    email: str = Field(foreign_key="accountdto.email")

class MealPlanDay(SQLModel, table=True):
    dayID: Optional[int] = Field(default=None, primary_key=True)
    mealID: int = Field(foreign_key="meal.mealID")
    mealPlanID: int = Field(foreign_key="mealplan.mealPlanID")