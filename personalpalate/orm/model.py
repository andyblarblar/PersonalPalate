from datetime import date
from typing import Optional
from sqlmodel import SQLModel, Field, create_engine, Session, select
from sqlalchemy import PrimaryKeyConstraint
from enum import Enum


class Category(Enum):
    beef = "beef"
    chicken = "chicken"
    pork = "pork"
    meat_other = "other meat"  # turkey, lamb, venison, etc.
    seafood = "seafood"
    pasta = "pasta"
    salad = "salad"


class AccountDTO(SQLModel):
    email: str = Field(primary_key=True)
    name: str
    followable: bool = Field(default=False)


class Account(AccountDTO, table=True):  # Subclass to avoid sending password to client
    password: str


class Follow(SQLModel, table=True):
    email: str = Field(foreign_key="account.email")
    followingEmail: str = Field(foreign_key="account.email")

    __table_args__ = (PrimaryKeyConstraint("email", "followingEmail"),)


class MealDTO(SQLModel):
    mealName: str
    category: Category
    dateMade: date


class Meal(MealDTO, table=True):
    mealID: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(foreign_key="account.email")


class MealPlanDayDTO(SQLModel):
    mealPlanDate: date
    mealName: str


class MealPlanDay(MealPlanDayDTO, table=True):
    email: str = Field(foreign_key="account.email")
    __table_args__ = (PrimaryKeyConstraint("email", "mealPlanDate"),)
