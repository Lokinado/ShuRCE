from datetime import date, datetime
from enum import Enum
from typing import Annotated, List, Optional
from uuid import UUID, uuid4

from fastapi import WebSocket
from pydantic import BaseModel
from sqlalchemy import JSON, TIMESTAMP, text
from sqlmodel import Column, Field, LargeBinary, Relationship, SQLModel

from .validators import Email, Password


class Permission(str, Enum):
    get_all_users = "get_all_users"
    get_all_roles = "get_all_roles"
    create_templates = "create_templates"
    get_templates = "get_templates"
    get_global_templates = "get_global_templates"
    get_all_templates = "get_templates"
    create_global_templates = "create_global_templates"
    get_job_logs = "get_job_logs"
    get_job_archive = "get_job_archive"


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
    created_templates: List["ExecutionTemplate"] = Relationship(back_populates="owner")
    created_jobs: List["Job"] = Relationship(back_populates="owner")
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

    def has_permission(self, permission: Permission):
        if self.role:
            return permission in self.role.permissions
        else:
            return False


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


class ExecutionTemplateBase(SQLModel):
    name: str = Field(index=True, nullable=False, min_length=3, max_length=15)
    is_global: bool = Field(nullable=False)


class ExecutionTemplate(ExecutionTemplateBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    compressed_dockerfile: bytes = Field(sa_column=Column(LargeBinary))
    jobs: list["Job"] = Relationship(back_populates="template")
    owner_id: UUID | None = Field(default=None, foreign_key="user.id")
    owner: User | None = Relationship(back_populates="created_templates")
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


class ExecutionTemplateCreate(ExecutionTemplateBase):
    pass


class ExecutionTemplatePublic(ExecutionTemplateBase):
    id: UUID
    date_created: datetime


class JobStatus(str, Enum):
    compiling = "Compiling"
    building = "Building"
    build_failed = "Build failed"
    running = "Running"
    finished = "Finished"
    run_failed = "Run Failed"


class JobBase(SQLModel):
    status: JobStatus = Field(sa_column=Column(JSON, default=JobStatus.compiling))
    is_zipped: bool = Field(nullable=False)
    contains_dockerfile: bool = Field(nullable=False)
    is_build: bool = Field(default=False, nullable=False)
    is_finished: bool = Field(default=False, nullable=False)
    job_folder_path: str | None = Field(default=None)
    error_message: str = Field(default="")
    container_id: str | None = Field(default=None)
    logs_path: str | None = Field(default=None)
    archive_path: str | None = Field(default=None)


class Job(JobBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    template_id: UUID | None = Field(default=None, foreign_key="executiontemplate.id")
    template: ExecutionTemplate | None = Relationship(back_populates="jobs")
    owner_id: UUID | None = Field(default=None, foreign_key="user.id")
    owner: User | None = Relationship(back_populates="created_jobs")
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


class JobPublic(JobBase):
    id: UUID
    owner_id: UUID
    template: ExecutionTemplate
    date_created: datetime


class WebSocketConnection:
    user: User
    websocket: WebSocket

    def __init__(self, user: User, websocket, WebSocket):
        self.user = user
        self.websocket = websocket
        pass


class WebsocketMessage(str, Enum):
    update = "Update"
