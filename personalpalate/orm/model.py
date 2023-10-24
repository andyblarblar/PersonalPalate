from typing import Optional

from sqlmodel import SQLModel, Field
from sqlalchemy import PrimaryKeyConstraint


# TODO add model
class AccountDTO(SQLModel):
    email: str = Field(primary_key=True)


class Account(AccountDTO, table=True):  # Subclass to avoid sending password to client
    password: str
