from datetime import date, datetime
from enum import Enum
from typing import Annotated, List, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel
from sqlalchemy import JSON, TIMESTAMP, Column, text
from sqlmodel import Field, Relationship, SQLModel

from .validators import Email, Password


class Permission(str, Enum):
    admin = "admin"


class RoleBase(SQLModel):
    name: str = Field(index=True, nullable=False, min_length=3, max_length=15)
    permissions: List[Permission] = Field(sa_column=Column(JSON))


class Role(RoleBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    users: list["User"] = Relationship(back_populates="role")
    date_created: Optional[datetime] = Field(
        default=None,
        sa_column=Column(
            TIMESTAMP(timezone=True),
            nullable=False,
            server_default=text("CURRENT_TIMESTAMP"),
        ),
    )
    date_updated: Optional[datetime] | None = Field(
        default=None,
        sa_column=Column(
            TIMESTAMP(timezone=True),
            nullable=False,
            server_default=text("CURRENT_TIMESTAMP"),
            server_onupdate=text("CURRENT_TIMESTAMP"),
        ),
    )


class RolePublic(RoleBase):
    id: UUID


class RoleCreate(RoleBase):
    name: str
    permissions: List[Permission]


class UserBase(SQLModel):
    email: Email = Field(
        index=True, nullable=False, unique=True, min_length=3, max_length=64
    )


class User(UserBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    role_id: UUID | None = Field(default=None, foreign_key="role.id")
    role: Role | None = Relationship(back_populates="users")
    hashed_password: str = Field()
    date_created: Optional[datetime] = Field(
        default=None,
        sa_column=Column(
            TIMESTAMP(timezone=True),
            nullable=False,
            server_default=text("CURRENT_TIMESTAMP"),
        ),
    )
    date_updated: Optional[datetime] | None = Field(
        default=None,
        sa_column=Column(
            TIMESTAMP(timezone=True),
            nullable=False,
            server_default=text("CURRENT_TIMESTAMP"),
            server_onupdate=text("CURRENT_TIMESTAMP"),
        ),
    )


class UserPublic(UserBase):
    id: UUID
    role: RolePublic | None


class UserCreate(UserBase):
    email: Email
    password: Password
    role_id: UUID | None


class UserLogin(UserBase):
    email: Email
    password: Password


class Token(BaseModel):
    access_token: str
    token_type: str
