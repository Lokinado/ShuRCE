from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, Response
from fastapi.security import OAuth2PasswordRequestForm

from app.seeder import register_seeders

from .auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_password_hash,
    has_permission_admin,
)
from .database import NewSession, create_db_and_tables
from .exceptions import incorrect_username_or_password
from .models import Role, RoleCreate, RolePublic, Token, User, UserCreate, UserPublic


@asynccontextmanager
async def lifespan(app: FastAPI):
    register_seeders()
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Welcome to your blog!"}


# TODO: Only somebody with permission add users should be able to add roles
@app.post("/users/", response_model=UserPublic)
def register_user(session: NewSession, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    extra_data = {"hashed_password": hashed_password}
    db_user = User.model_validate(user, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


@app.get("/users/me/", response_model=UserPublic)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return current_user


@app.post("/token")
async def login_for_access_token(
    response: Response,
    session: NewSession,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise incorrect_username_or_password
    access_token = create_access_token(data={"sub": str(user.id)}).decode("utf-8")
    response.set_cookie(
        key="access_token", value=f"Bearer {access_token}", httponly=True
    )
    return


# TODO: Only somebody with permission create roles should be able to add roles
@app.post("/roles/", response_model=RolePublic)
def register_role(session: NewSession, role: RoleCreate):
    db_role = Role.model_validate(role)
    session.add(db_role)
    session.commit()
    session.refresh(db_role)
    return db_role


@app.post("/role_test/")
def quick_test(user: Annotated[User, Depends(has_permission_admin)]):
    return {f"message": "Welcome to your blog! {user.id}"}
