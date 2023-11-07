from datetime import date
from typing import Optional
from sqlmodel import SQLModel, Field, create_engine, Session, select
from sqlalchemy import PrimaryKeyConstraint
from enum import Enum

class Category(Enum):
    beef = "beef"
    chicken = "chicken"
    pork = "pork"
    meat_other = "other meat" # turkey, lamb, venison, etc.
    seafood = "seafood"
    pasta = "pasta"
    salad = "salad"

class AccountDTO(SQLModel):
    email: str = Field(primary_key=True)
    followable: bool = Field(default=False)

class Account(AccountDTO, table=True):  # Subclass to avoid sending password to client
    password: str

class Follow(SQLModel, table=True):
    email: str = Field(foreign_key="account.email")
    followingEmail: str = Field(foreign_key="account.email")

    __table_args__ = (
        PrimaryKeyConstraint("email", "followingEmail"),
    )

class Meal(SQLModel, table=True):
    mealID: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(foreign_key="account.email")
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
    email: str = Field(foreign_key="account.email")

class MealPlanDay(SQLModel, table=True):
    dayID: Optional[int] = Field(default=None, primary_key=True)
    mealID: int = Field(foreign_key="meal.mealID")
    mealPlanID: int = Field(foreign_key="mealplan.mealPlanID")


sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True)

SQLModel.metadata.create_all(engine)

with Session(engine) as sess:
    a1 = Account(email="smileyjo@umich.edu", password="123", followable=1)
    a2 = Account(email="joeysmiley33@gmail.com", password="321", followable=1)
    a3 = Account(email="joey@gmail.com", password="456", followable=1)
    sess.add(a1)
    sess.add(a2)
    sess.add(a3)
    f1 = Follow(email="smileyjo@umich.edu", followingEmail="joeysmiley33@gmail.com")
    f2 = Follow(email="smileyjo@umich.edu", followingEmail="joey@gmail.com")
    sess.add(f1)
    sess.add(f2)
    m1 = Meal(email="smileyjo@umich.edu", mealName="Chicken and Rice", category="chicken", dateMade=date(2023, 11, 1))
    m2 = Meal(email="joeysmiley33@umich.edu", mealName="Chicken and Brocolli", category="chicken", dateMade=date(2023, 11, 2))
    sess.add(m1)
    sess.add(m2)

    sess.commit()  
    
    i1a = Ingredients(mealID = m1.mealID, ingredient="chicken", quantity=8, unit="oz")
    i1b = Ingredients(mealID = m1.mealID, ingredient="rice", quantity=1, unit="cup")
    i2a = Ingredients(mealID = m2.mealID, ingredient="chicken", quantity=8, unit="oz")
    i2b = Ingredients(mealID = m2.mealID, ingredient="brocolli", quantity=4, unit="oz")
    sess.add(i1a)
    sess.add(i1b)
    sess.add(i2a)
    sess.add(i2b)
    mp = MealPlan(mealPlanDate=date(2023, 11, 12), email=a1.email)
    sess.add(mp)

    sess.commit()

    d1 = MealPlanDay(mealID = m1.mealID, mealPlanID = mp.mealPlanID)
    d2 = MealPlanDay(mealID = m2.mealID, mealPlanID = mp.mealPlanID)
    d3 = MealPlanDay(mealID = m1.mealID, mealPlanID = mp.mealPlanID)
    d4 = MealPlanDay(mealID = m1.mealID, mealPlanID = mp.mealPlanID)
    d5 = MealPlanDay(mealID = m2.mealID, mealPlanID = mp.mealPlanID)
    d6 = MealPlanDay(mealID = m1.mealID, mealPlanID = mp.mealPlanID)
    d7 = MealPlanDay(mealID = m2.mealID, mealPlanID = mp.mealPlanID)
    sess.add(d1)
    sess.add(d2)
    sess.add(d3)
    sess.add(d4)
    sess.add(d5)
    sess.add(d6)
    sess.add(d7)


    sess.commit()
