import zlib
from contextlib import asynccontextmanager
from typing import Annotated, List

from fastapi import Depends, FastAPI, File, Form, Response, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select

from app.seeder import register_seeders

from .auth import (
    Has,
    authenticate_user,
    create_access_token,
    get_current_user,
    get_password_hash,
)
from .database import NewSession, create_db_and_tables
from .exceptions import incorrect_username_or_password
from .models import (
    ExecutionTemplate,
    ExecutionTemplateCreate,
    ExecutionTemplatePublic,
    Permission,
    Role,
    RoleCreate,
    RolePublic,
    User,
    UserCreate,
    UserPublic,
)


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
@app.post("/users/register", response_model=UserPublic)
def register_user(session: NewSession, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    extra_data = {"hashed_password": hashed_password}
    db_user = User.model_validate(user, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


@app.post("/users/all")
def get_all_users(
    session: NewSession,
    user: Annotated[User, Depends(Has(Permission.get_all_users))],
) -> List[UserPublic]:
    try:
        return session.exec(select(User)).all()
    except:
        return []


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
@app.post("/roles/create", response_model=RolePublic)
def register_role(session: NewSession, role: RoleCreate):
    db_role = Role.model_validate(role)
    session.add(db_role)
    session.commit()
    session.refresh(db_role)
    return db_role


@app.post("/roles/all")
def get_all_roles(
    session: NewSession,
    user: Annotated[User, Depends(Has(Permission.get_all_roles))],
) -> List[RolePublic]:
    try:
        return session.exec(select(Role)).all()
    except:
        return []


# It must be done like that due to multi-part form
@app.post("/templates/create", response_model=ExecutionTemplatePublic)
async def create_execution_template(
    session: NewSession,
    user: Annotated[User, Depends(Has(Permission.create_templates))],
    name: Annotated[str, Form(min_length=4, max_length=15)],
    dockerfile: UploadFile = File(),
):
    file_content = await dockerfile.read()

    if len(file_content) == 0:
        print("Empty")

    template = {
        "name": name,
        "compressed_dockerfile": zlib.compress(file_content),
    }

    db_template = ExecutionTemplate.model_validate(template)
    session.add(db_template)
    session.commit()
    session.refresh(db_template)
    return db_template


@app.get("/templates/all")
def get_all_roles(
    session: NewSession,
    user: Annotated[User, Depends(Has(Permission.get_all_templates))],
) -> List[ExecutionTemplatePublic]:
    try:
        return session.exec(select(ExecutionTemplate)).all()
    except:
        return []


@app.get("/docker-file-upload-tester")
async def main():
    content = """
<body>
<form action="/templates/create" enctype="multipart/form-data" method="post" name="template">
<input name="name" type="text">
<input name="dockerfile" type="file">
<input type="submit">
</form>
</body>
    """
    return HTMLResponse(content=content)
