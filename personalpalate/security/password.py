from passlib.context import CryptContext
from sqlmodel import Session, select

import personalpalate.orm.connect
from personalpalate.orm.model import Account

password_context = CryptContext(schemes=["bcrypt"])
"""Primary password hashing context"""


def verify_password(password: str, email: str) -> bool:
    """Verifies user password is valid"""
    with Session(personalpalate.orm.connect.engine) as sess:
        acc = sess.get(Account, email)

        return acc and password_context.verify(password, acc.password)


def hash_password(plaintext: str) -> str:
    return password_context.hash(plaintext)
