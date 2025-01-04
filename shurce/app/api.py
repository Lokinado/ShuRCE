import asyncio
import zlib
from contextlib import asynccontextmanager
from threading import Thread
from typing import Annotated, List
from uuid import UUID

from fastapi import Body, Depends, FastAPI, File, Form, Query, Response, UploadFile
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select

from .auth import (
    Has,
    authenticate_user,
    create_access_token,
    get_current_user,
    get_password_hash,
)
from .database import NewSession, create_db_and_tables
from .exceptions import (
    execution_template_does_not_exist,
    incorrect_username_or_password,
    insufficient_permissions,
    unauthorized_access_to_job_archive,
    unauthorized_access_to_job_log,
)
from .job_manager import JobManager
from .models import (
    ExecutionTemplate,
    ExecutionTemplateCreate,
    ExecutionTemplatePublic,
    Job,
    JobPublic,
    JobStatus,
    Permission,
    Role,
    RoleCreate,
    RolePublic,
    User,
    UserCreate,
    UserPublic,
)
from .seeder import register_seeders

job_manager: JobManager | None = None
job_event_loop: asyncio.AbstractEventLoop | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global job_manager, job_event_loop
    register_seeders()
    create_db_and_tables()
    job_manager = JobManager()
    job_event_loop = asyncio.new_event_loop()
    Thread(
        target=lambda: asyncio.run(job_event_loop.run_forever()), daemon=True
    ).start()
    yield
    job_event_loop.stop()


app = FastAPI(lifespan=lifespan)


@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Welcome to your blog!"}


# TODO: Only somebody with permission add users should be able to add roles
@app.post("/v1/users/register", response_model=UserPublic)
def register_user(session: NewSession, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    extra_data = {"hashed_password": hashed_password}
    db_user = User.model_validate(user, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


@app.post("/v1/users/all")
def get_all_users(
    session: NewSession,
    user: Annotated[User, Depends(Has(Permission.get_all_users))],
) -> List[UserPublic]:
    try:
        return session.exec(select(User)).all()
    except:
        return []


@app.get("/v1/users/me/", response_model=UserPublic)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return current_user


@app.post("/v1/token")
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
@app.post("/v1/roles/create", response_model=RolePublic)
def create_role(session: NewSession, role: RoleCreate):
    db_role = Role.model_validate(role)
    session.add(db_role)
    session.commit()
    session.refresh(db_role)
    return db_role


@app.post("/v1/roles/all")
def get_all_roles(
    session: NewSession,
    user: Annotated[User, Depends(Has(Permission.get_all_roles))],
) -> List[RolePublic]:
    try:
        return session.exec(select(Role)).all()
    except:
        return []


# It must be done like that due to multi-part form
@app.post("/v1/templates/create", response_model=ExecutionTemplatePublic)
async def create_execution_template(
    session: NewSession,
    user: Annotated[User, Depends(Has(Permission.create_templates))],
    name: Annotated[str, Form(min_length=4, max_length=15)],
    is_global: Annotated[bool, Form()],
    dockerfile: Annotated[UploadFile, File()],
):
    file_content = await dockerfile.read()

    if len(file_content) == 0:
        print("Empty")

    if is_global:
        if not user.has_permission(Permission.create_global_templates):
            raise insufficient_permissions

    template = {
        "name": name,
        "is_global": is_global if is_global else False,
        "compressed_dockerfile": zlib.compress(file_content),
        "owner_id": user.id,
    }

    db_template = ExecutionTemplate.model_validate(template)
    session.add(db_template)
    session.commit()
    session.refresh(db_template)
    return db_template


@app.get("/v1/templates/my")
def get_all_templates(
    session: NewSession,
    user: Annotated[User, Depends(Has(Permission.get_templates))],
) -> List[ExecutionTemplatePublic]:
    get_templates_query = None
    if user.has_permission(Permission.get_global_templates):
        get_templates_query = select(ExecutionTemplate).where(
            ExecutionTemplate.owner_id == user.id or ExecutionTemplate.is_global
        )
    else:
        get_templates_query = select(ExecutionTemplate).where(
            ExecutionTemplate.owner_id == user.id
        )

    try:
        return session.exec(get_templates_query).all()
    except:
        return []


@app.post("/v1/jobs/create", response_model=JobPublic)
async def create_job(
    session: NewSession,
    user: Annotated[User, Depends(Has(Permission.get_all_templates))],
    code_file: Annotated[UploadFile, File()],
    is_zipped: Annotated[bool, Body()],
    contains_dockerfile: Annotated[bool, Body()],
    template_id: Annotated[UUID, Body()],
):

    if not session.get(ExecutionTemplate, template_id):
        raise execution_template_does_not_exist

    job = {
        "status": JobStatus.compiling,
        "is_zipped": is_zipped,
        "contains_dockerfile": contains_dockerfile,
        "template_id": template_id,
        "owner_id": user.id,
    }

    db_job = Job.model_validate(job)
    session.add(db_job)
    session.commit()
    session.refresh(db_job)

    code_content = await code_file.read()
    code_filename = code_file.filename

    asyncio.run_coroutine_threadsafe(
        job_manager.create_job(db_job.id, code_filename, code_content),
        job_event_loop,
    )

    return db_job


@app.get("/v1/jobs/my")
async def get_my_jobs(
    session: NewSession,
    user: Annotated[User, Depends(Has(Permission.get_jobs))],
) -> List[JobPublic]:
    get_jobs_query = select(Job).where(Job.owner_id == user.id)
    # get_jobs_query = select(Job)
    try:
        return session.exec(get_jobs_query).all()
    except:
        return []


@app.get("/v1/jobs/logs")
def get_logs_from_job_id(
    session: NewSession,
    user: Annotated[User, Depends(Has(Permission.get_job_logs))],
    job_id: Annotated[UUID, Query()],
):
    job = session.get(Job, job_id)
    if job.owner_id == user.id:
        log_name = f"job_logs_{job.id}"
        return FileResponse(
            job.logs_path, media_type="application/octet-stream", filename=log_name
        )
    else:
        raise unauthorized_access_to_job_log


@app.get("/v1/jobs/archive")
def get_archive_from_job_id(
    session: NewSession,
    user: Annotated[User, Depends(Has(Permission.get_job_archive))],
    job_id: Annotated[UUID, Query()],
):
    job = session.get(Job, job_id)
    if job.owner_id == user.id:
        archive_name = f"job_archive_{job.id}.tar"
        return FileResponse(
            job.archive_path,
            media_type="application/octet-stream",
            filename=archive_name,
        )
    else:
        raise unauthorized_access_to_job_archive
