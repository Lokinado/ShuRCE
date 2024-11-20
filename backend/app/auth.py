from datetime import datetime, timedelta, timezone
from typing import Annotated
from uuid import UUID

import jwt
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from sqlmodel import Session, select

from .database import NewSession
from .exceptions import credentials_exception, insufficient_permissions
from .models import Permission, User

SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def authenticate_user(session: Session, email: str, password: str):
    try:
        user = session.exec(select(User).where(User.email == email)).one()
        if not user:
            return False
        if not verify_password(password, user.hashed_password):
            return False
        return user
    except:
        return False


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    session: NewSession,
    token: Annotated[str, Depends(oauth2_scheme)],
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = UUID(payload.get("sub"))
        if user_id is None:
            raise credentials_exception
        user = session.get(User, user_id)
        if user is None:
            raise credentials_exception
        return user
    except InvalidTokenError:
        raise credentials_exception


class PermissionChecker:
    def __init__(self, permission: Permission):
        self.permission = permission

    def __call__(self, user: Annotated[User, Depends(get_current_user)]):
        if user.role:
            if self.permission in user.role.permissions:
                return user
        # TODO: CREATE SENSIBLE EXCEPTIONS
        raise insufficient_permissions


has_permission_admin = PermissionChecker(Permission.admin)
