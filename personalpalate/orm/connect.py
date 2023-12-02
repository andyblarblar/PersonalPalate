from sqlmodel import create_engine, SQLModel, Session, select
from ..security.password import password_context
from .model import *  # Required to create tables

# Attempt to connect to school db, use sqlite otherwise
try:
    # Private file containing password
    url = open("connect_str.txt").readline()
    connect_args = {}
    engine = create_engine(url, echo=True, connect_args=connect_args, pool_recycle=3600)
    # Test
    engine.connect().close()
    print("using mysql")
except Exception as e:
    print(f"using sqlite, mysql failed with: {e}")
    sqlite_file_name = "db.sqlite"
    url = f"sqlite:///{sqlite_file_name}"
    connect_args = {"check_same_thread": False}
    engine = create_engine(url, echo=True, connect_args=connect_args)


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
                email="avealov@umich.edu", followingEmail="joeysmiley33@gmail.com"
            )
            f2 = Follow(
                email="avealov@umich.edu", followingEmail="joey@gmail.com"
            )
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
            m5 = Meal(
                email=a1.email,
                mealName="Pizza",
                category="salad",
                dateMade=date(2023, 11, 6),
            )
            m6 = Meal(
                email=a1.email,
                mealName="Pasta and Garlic Bread",
                category="pasta",
                dateMade=date(2023, 11, 7),
            )
            m7 = Meal(
                email=a1.email,
                mealName="Turkey Sandwich",
                category="other meat",
                dateMade=date(2023, 11, 8),
            )
            m8 = Meal(
                email=a1.email,
                mealName="Beef Potroast",
                category="beef",
                dateMade=date(2023, 11, 10),
            )
            m9 = Meal(
                email=a1.email,
                mealName="Lasagna",
                category="pasta",
                dateMade=date(2023, 11, 11),
            )
            m10 = Meal(
                email=a1.email,
                mealName="Fish and Chips",
                category="seafood",
                dateMade=date(2023, 11, 14),
            )
            m11 = Meal(
                email=a1.email,
                mealName="Cheeseburger",
                category="beef",
                dateMade=date(2023, 11, 18),
            )
            m12 = Meal(
                email=a1.email,
                mealName="Beef Tacos",
                category="beef",
                dateMade=date(2023, 11, 20),
            )
            m13 = Meal(
                email=a1.email,
                mealName="Steak and Salad",
                category="beef",
                dateMade=date(2023, 11, 23),
            )
            m14 = Meal(
                email=a1.email,
                mealName="Hotdogs and Fries",
                category="other meat",
                dateMade=date(2023, 11, 24),
            )
            m15 = Meal(
                email=a1.email,
                mealName="Meatloaf",
                category="beef",
                dateMade=date(2023, 11, 29),
            )

            sess.add(m1)
            sess.add(m2)
            sess.add(m3)
            sess.add(m4)
            sess.add(m5)
            sess.add(m6)
            sess.add(m7)
            sess.add(m8)
            sess.add(m9)
            sess.add(m10)
            sess.add(m11)
            sess.add(m12)
            sess.add(m13)
            sess.add(m14)
            sess.add(m15)
            sess.commit()
