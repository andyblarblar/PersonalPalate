from typing import Annotated

from fastapi import FastAPI, Depends, HTTPException, Response, Request, Form
from fastapi.templating import Jinja2Templates
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlmodel import SQLModel, Session, select
from starlette import status
from starlette.responses import RedirectResponse

from personalpalate.orm.connect import prepare_db
from personalpalate.deps import (
    db_session,
    get_current_user,
    ensure_user_not_logged_in,
)
from personalpalate.orm.model import Account, AccountDTO, Follow
from personalpalate.security import password as passlib
from personalpalate.security.token import Token, create_access_token

app = FastAPI()

templates = Jinja2Templates("personalpalate/templates")
app.mount("/static", StaticFiles(directory="personalpalate/static"), name="static")


@app.on_event("startup")
def on_startup():
    prepare_db()


@app.get("/")
async def root(
    request: Request, account: Annotated[AccountDTO, Depends(get_current_user)]
):
    """Home landing page for signed in users"""

    return templates.TemplateResponse("home.html.jinja", {"request": request})


class FollowData(BaseModel):
    email: str


@app.post("/account/follow", status_code=201, response_model=Follow)
async def follow(
    sess: Annotated[Session, Depends(db_session)],
    account: Annotated[AccountDTO, Depends(get_current_user)],
    email: FollowData,
):
    """Follows another user, if allowed"""

    other_acc = sess.exec(
        select(Account).where(Account.email == email).where(Account.followable)
    ).first()

    if not other_acc:
        raise HTTPException(
            400, "Other account is either not followable or does not exist"
        )

    if sess.exec(
        select(Follow)
        .where(Follow.followingEmail == account.email)
        .where(Follow.email == email)
    ).first():
        raise HTTPException(200, "Account is already following")

    f = Follow(followingEmail=account.email, email=email)
    sess.add(f)
    sess.commit()

    return f


@app.delete("/account/follow")
async def unfollow(
    sess: Annotated[Session, Depends(db_session)],
    account: Annotated[AccountDTO, Depends(get_current_user)],
    email: FollowData,
):
    """Unfollows another user"""

    f = sess.exec(
        select(Follow)
        .where(Follow.followingEmail == account.email)
        .where(Follow.email == email)
    ).first()

    if not f:
        raise HTTPException(400, "Follow relationship does not exist")

    sess.delete(f)


# Login stuff


@app.get("/login")
async def login(request: Request, not_login=Depends(ensure_user_not_logged_in)):
    """Login page. Will redirect to home if already logged in."""
    return templates.TemplateResponse("login.html.jinja", {"request": request})


@app.post("/signup", status_code=201, response_model=AccountDTO)
async def signup(
    email: Annotated[str, Form()],
    password: Annotated[str, Form()],
    sess: Annotated[Session, Depends(db_session)],
    not_login=Depends(ensure_user_not_logged_in),
):
    """Creates a new account"""
    if sess.get(Account, email):
        raise HTTPException(400, "user with email already exists")
    else:
        account = Account(email=email, password=passlib.password_context.hash(password))
        sess.add(account)
        sess.commit()

        return AccountDTO.from_orm(account)


@app.post("/token", response_model=Token)
async def create_token(
    form: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response
):
    """Creates an OAuth2 token"""
    if passlib.verify_password(form.password, form.username):
        access_token = create_access_token(form.username)
        # Set token in cookie and respond as JSON
        response.set_cookie("access_token", f"bearer {access_token}", httponly=True)
        return {"access_token": access_token, "token_type": "bearer"}
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )


@app.get("/logout")
async def logout():
    """Destroys the login token"""
    response = RedirectResponse(url="/login")
    response.delete_cookie("access_token")
    return response
