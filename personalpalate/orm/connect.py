from sqlmodel import create_engine, SQLModel, Session, select
from ..security.password import password_context
from .model import *  # Required to create tables

sqlite_file_name = "db.sqlite"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True)


def prepare_db():
    # Create tables if not exists
    SQLModel.metadata.create_all(engine)

    with Session(engine) as sess:
        # Only generate once
        if not sess.exec(select(Account).where(Account.email == "avealov@umich.edu")).first():
            # TODO add premade model
            a1 = Account(email="avealov@umich.edu", password=password_context.hash("123"))
            sess.add(a1)
            sess.commit()
