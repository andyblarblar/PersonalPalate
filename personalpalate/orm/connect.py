from sqlmodel import create_engine, SQLModel, Session, select
from ..security.password import password_context
from .model import *  # Required to create tables

sqlite_file_name = "db.sqlite"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True, connect_args={"check_same_thread": False})


def prepare_db():
    # Create tables if not exists
    SQLModel.metadata.create_all(engine)

    with Session(engine) as sess:
        # Only generate once
        if not sess.exec(
            select(Account).where(Account.email == "avealov@umich.edu")
        ).first():
            a1 = Account(
                email="avealov@umich.edu",
                password=password_context.hash("123"),
                name="andrew ealovega",
            )
            a2 = Account(
                email="smileyjo@umich.edu",
                name="Joe smiley",
                password=password_context.hash("456"),
                followable=1,
            )
            a3 = Account(
                email="joeysmiley33@gmail.com",
                name="Joe smiley Jr.",
                password=password_context.hash("789"),
                followable=1,
            )
            a4 = Account(
                email="joey@gmail.com",
                name="Son of Joe smiley",
                password=password_context.hash("321"),
                followable=1,
            )
            sess.add(a1)
            sess.add(a2)
            sess.add(a3)
            sess.add(a4)
            f1 = Follow(
                email="smileyjo@umich.edu", followingEmail="joeysmiley33@gmail.com"
            )
            f2 = Follow(email="smileyjo@umich.edu", followingEmail="joey@gmail.com")
            sess.add(f1)
            sess.add(f2)
            m1 = Meal(
                email=a2.email,
                mealName="Chicken and Rice",
                category="chicken",
                dateMade=date(2023, 11, 1),
            )
            m2 = Meal(
                email=a3.email,
                mealName="Chicken and Brocolli",
                category="chicken",
                dateMade=date(2023, 11, 2),
            )
            m3 = Meal(
                email=a1.email,
                mealName="Macaroni and Cheese",
                category="pasta",
                dateMade=date(2023, 11, 4),
            )
            m4 = Meal(
                email=a4.email,
                mealName="Ceasar Salad",
                category="salad",
                dateMade=date(2023, 11, 6),
            )
            sess.add(m1)
            sess.add(m2)
            sess.add(m3)
            sess.add(m4)
            sess.commit()

            i1a = Ingredients(
                mealID=m1.mealID, 
                ingredient="chicken", 
                quantity=8, 
                unit="oz"
            )
            i1b = Ingredients(
                mealID=m1.mealID, 
                ingredient="rice", 
                quantity=1, 
                unit="cup"
            )
            i2a = Ingredients(
                mealID=m2.mealID, 
                ingredient="chicken", 
                quantity=8, 
                unit="oz"
            )
            i2b = Ingredients(
                mealID=m2.mealID, 
                ingredient="brocolli", 
                quantity=4, 
                unit="oz"
            )
            i3a = Ingredients(
                mealID=m3.mealID, 
                ingredient="macaroni", 
                quantity=4, 
                unit="oz"
            )
            i3b = Ingredients(
                mealID=m3.mealID, 
                ingredient="shredded cheese", 
                quantity=2, 
                unit="oz"
            )
            i4a = Ingredients(
                mealID=m4.mealID,
                ingredient="romaine lettuce",
                quantity=100,
                unit="grams",
            )
            i4b = Ingredients(
                mealID=m4.mealID, 
                ingredient="croutons", 
                quantity=30, 
                unit="grams"

            )
            i4c = Ingredients(
                mealID=m4.mealID,
                ingredient="salad dressing",
                quantity=2,
                unit="tablespoons",
            )
            sess.add(i1a)
            sess.add(i1b)
            sess.add(i2a)
            sess.add(i2b)
            sess.add(i3a)
            sess.add(i3b)
            sess.add(i4a)
            sess.add(i4b)
            sess.add(i4c)
            mp1 = MealPlan(mealPlanDate=date(2023, 11, 12), email=a2.email)
            mp2 = MealPlan(mealPlanDate=date(2023, 11, 19), email=a2.email)
            sess.add(mp1)
            sess.add(mp2)
            sess.commit()

            d1 = MealPlanDay(mealID=m1.mealID, 
                             mealPlanID=mp1.mealPlanID, 
                             mealName=m1.mealName,
                             weekday="monday")
            d2 = MealPlanDay(mealID=m2.mealID, 
                             mealPlanID=mp1.mealPlanID, 
                             mealName=m2.mealName,
                             weekday="wednesday")
            d3 = MealPlanDay(mealID=m1.mealID, 
                             mealPlanID=mp1.mealPlanID, 
                             mealName=m1.mealName,
                             weekday="tuesday")
            d4 = MealPlanDay(mealID=m1.mealID, 
                             mealPlanID=mp1.mealPlanID, 
                             mealName=m1.mealName,
                             weekday="thursday")
            d5 = MealPlanDay(mealID=m2.mealID, 
                             mealPlanID=mp1.mealPlanID, 
                             mealName=m2.mealName,
                             weekday="friday")
            d6 = MealPlanDay(mealID=m1.mealID, 
                             mealPlanID=mp1.mealPlanID, 
                             mealName=m1.mealName,
                             weekday="sunday")
            d7 = MealPlanDay(mealID=m2.mealID, 
                             mealPlanID=mp1.mealPlanID, 
                             mealName=m2.mealName,
                             weekday="saturday")
            d8 = MealPlanDay(mealID=m2.mealID, 
                             mealPlanID=mp2.mealPlanID, 
                             mealName=m2.mealName,
                             weekday="monday")
            d9 = MealPlanDay(mealID=m1.mealID, 
                             mealPlanID=mp2.mealPlanID, 
                             mealName=m1.mealName,
                             weekday="saturday")
            d10 = MealPlanDay(mealID=m4.mealID, 
                              mealPlanID=mp2.mealPlanID, 
                              mealName=m4.mealName,
                              weekday="sunday")
            d11 = MealPlanDay(mealID=m1.mealID, 
                              mealPlanID=mp2.mealPlanID, 
                              mealName=m1.mealName,
                              weekday="tuesday")
            d12 = MealPlanDay(mealID=m4.mealID, 
                              mealPlanID=mp2.mealPlanID, 
                              mealName=m4.mealName,
                              weekday="wednesday")
            d13 = MealPlanDay(mealID=m2.mealID, 
                              mealPlanID=mp2.mealPlanID,
                              mealName=m2.mealName, 
                              weekday="friday")
            d14 = MealPlanDay(mealID=m1.mealID, 
                              mealPlanID=mp2.mealPlanID, 
                              mealName=m1.mealName,
                              weekday="thursday")
            sess.add(d1)
            sess.add(d2)
            sess.add(d3)
            sess.add(d4)
            sess.add(d5)
            sess.add(d6)
            sess.add(d7)
            sess.add(d8)
            sess.add(d9)
            sess.add(d10)
            sess.add(d11)
            sess.add(d12)
            sess.add(d13)
            sess.add(d14)
            sess.commit()
