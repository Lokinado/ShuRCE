from sqlalchemy import event
from sqlmodel import Session, select

from app.auth import get_password_hash
from app.models import Permission, Role, RoleCreate, User, UserCreate

from .database import engine

INITIAL_DATA = {
    "user": [UserCreate(email="Admin", password="root", role_id=None)],
    "role": [RoleCreate(name="Admin", permissions=[Permission.admin])],
}


def initialize_table_user(target, connection, **kw):
    tablename = str(target)
    with Session(engine) as session:
        role = session.exec(select(Role).where(Role.name == "Admin")).one()
        if tablename in INITIAL_DATA:
            for record in INITIAL_DATA[tablename]:
                extra_data = {
                    "role_id": role.id,
                    "hashed_password": get_password_hash(record.password),
                }
                db_user = User.model_validate(record, update=extra_data)
                session.add(db_user)
            session.commit()
            session.refresh(db_user)


def initialize_table_role(target, connection, **kw):
    tablename = str(target)
    with Session(engine) as session:
        if tablename in INITIAL_DATA:
            for record in INITIAL_DATA[tablename]:
                db_role = Role.model_validate(record)
                session.add(db_role)
            session.commit()
            session.refresh(db_role)


def register_seeders():
    event.listen(User.__table__, "after_create", initialize_table_user)
    event.listen(Role.__table__, "after_create", initialize_table_role)
