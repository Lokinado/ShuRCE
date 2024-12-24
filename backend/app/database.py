from typing import Annotated

from decouple import config
from fastapi import Depends
from sqlmodel import Session, SQLModel, create_engine

db_url = config("db_url")

connect_args = {"check_same_thread": False, "timeout": 15}
engine = create_engine(db_url, echo=False, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


NewSession = Annotated[Session, Depends(get_session)]
