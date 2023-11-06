from datetime import date
from typing import Optional

from sqlmodel import SQLModel, Field
from sqlalchemy import PrimaryKeyConstraint


class AccountDTO(SQLModel):
    password: str

class Account(AccountDTO, table=True):  # Subclass to avoid sending password to client
    email: str = Field(primary_key=True)
    followable: bool

class Follow(SQLModel, table=True):
    email: str = Field(default=None, foreign_key="account.email")
    followingEmail: str = Field(default=None, foreign_key="account.email")

    __table_args__ = (
        PrimaryKeyConstraint("email", "followingEmail"),
    )

class Meal(SQLModel, table=True):
    mealID: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(default=None, foreign_key="account.email")
    mealName: str
    category: str
    description: str
    mealFrequency: int
    dateMade: date

class Ingredients(SQLModel, table=True):
    ingredientID: Optional[int] = Field(default=None, primary_key=True)
    mealID: int = Field(default=None, foreign_key="meal.mealID")
    ingredient: str
    quantity: str

class MealPlan(SQLModel, table=True):
    mealPlanID: int = Field(default=None, primary_key=True)
    mealPlanDate: date
    email: str = Field(default=None, foreign_key="account.email")

class Day(SQLModel, table=True):
    dayID: Optional[int] = Field(default=None, primary_key=True)
    mealID: int = Field(default=None, foreign_key="meal.mealID")
    mealPlanID: int = Field(default=None, foreign_key="mealplan.mealPlanID")