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
