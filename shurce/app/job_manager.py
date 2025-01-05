import asyncio
import os
import zlib
from threading import Thread
from typing import Annotated
from uuid import UUID

import docker
import docker.errors
import docker.types
from fastapi import File, UploadFile
from sqlmodel import Session, select

from .database import engine
from .exceptions import job_folder_already_exists, job_folder_does_not_exist
from .models import Job, JobStatus
from .websocket_connection_manager import WebsocketConnectionManager


class JobManager:
    jobs_path = "jobs"

    def __init__(self):
        if not os.path.exists(self.jobs_path):
            os.makedirs(self.jobs_path)

        self.docker_client = docker.DockerClient(base_url="unix://var/run/docker.sock")
        self.connection_manager = WebsocketConnectionManager()
        self.job_status_polling_thread = Thread(
            target=lambda: asyncio.run(self.__run_loop_polling()), daemon=True
        ).start()

        with Session(engine) as session:
            jobs = session.exec(select(Job)).all()
            for job in jobs:
                if job.is_finished:
                    continue

                # if job.is_build:
                #     self.run_built_job(session, job)
                #     continue

                # if self.is_job_folder_valid(session, job):
                #     self.build_job(session, job)
                #     self.run_built_job(session, job)
                # else:
                #     self.compile_job_folder(session, job)
                #     self.build_job(session, job)
                #     self.run_built_job(session, job)

    def __poll_job_status(self):
        with Session(engine) as session:
            jobs = session.exec(
                select(Job).where(Job.status == JobStatus.running)
            ).all()
            for job in jobs:
                print(job.id)
                container = self.docker_client.containers.get(job.container_id)
                print(container.status)
                logs_path = os.path.join(job.job_folder_path, "logs")
                archive_path = os.path.join(job.job_folder_path, "filesystem.tar")
                if container.status == "exited":
                    with open(logs_path, "w") as logs:
                        logs.write(container.logs(stream=False).decode("utf-8"))

                    stream = container.export()
                    with open(archive_path, "wb") as tar_file:
                        for chunk in stream:
                            tar_file.write(chunk)

                    job.status = JobStatus.finished
                    job.is_finished = True
                    job.logs_path = logs_path
                    job.archive_path = archive_path
                    session.add(job)
            session.commit()

    async def __run_loop_polling(self):
        while True:
            await asyncio.sleep(1)
            self.__poll_job_status()

    def __get_job_image(self, job: Job):
        image_name = f"shurce_{str(job.id)}"
        try:
            return self.docker_client.images.get(name=image_name)
        except:
            return None

    def __run_built_job(self, session: Session, job: Job):
        image = self.__get_job_image(job)
        if not image:
            job.status = JobStatus.run_failed
            job.error_message = "Cannot get job image"
            session.add(job)
            session.commit()
            return False

        try:
            container = self.docker_client.containers.run(image.id, detach=True)
            job.container_id = container.id
            job.status = JobStatus.running
            session.add(job)
            session.commit()
        except docker.errors.ImageNotFound as err:
            job.status = JobStatus.run_failed
            job.error_message = err.msg
            session.add(job)
            session.commit()
            return False
        return True

    def __build_job(self, session: Session, job: Job):
        if not job.job_folder_path:
            raise job_folder_does_not_exist

        try:
            self.docker_client.images.build(
                path=str(job.job_folder_path), rm=True, tag=f"shurce_{str(job.id)}"
            )
            job.is_build = True
            session.add(job)
            session.commit()

            return True
        except docker.errors.BuildError as err:
            job.status = JobStatus.build_failed
            job.error_message = err.msg
            session.add(job)
            session.commit()
            return False

    def is_job_folder_valid(self, session: Session, job: Job):
        pass

    def compile_job_folder(self, session: Session, job: Job):
        pass

    async def create_job(self, job_id: UUID, code_filename: str, code_content: bytes):
        with Session(engine) as session:
            job = session.get(Job, job_id)
            job_folder_path = os.path.join(self.jobs_path, str(job_id))

            if not os.path.exists(job_folder_path):
                os.makedirs(job_folder_path)
            else:
                raise job_folder_already_exists

            job.job_folder_path = job_folder_path

            try:
                session.add(job)
                session.commit()
            except Exception as e:
                print(type(e))
                print(e)
                return

            # TODO: Move these with statements to other functions
            try:
                code_path = os.path.join(job_folder_path, code_filename)
                with open(code_path, "w") as code_destination:
                    code_destination.write(code_content.decode("utf-8"))
            except Exception as e:
                print(type(e))
                print(e)
                return

            try:
                dockerfile_path = os.path.join(job_folder_path, "Dockerfile")
                with open(dockerfile_path, "w") as dockerfile:
                    dockerfile_content = zlib.decompress(
                        job.template.compressed_dockerfile
                    )
                    dockerfile.write(dockerfile_content.decode("utf-8"))
            except Exception as e:
                print(type(e))
                print(e)
                return

            # This sleep assures that fast api sends request before build
            # This sleep returns control to main thread and then fast api
            # can send request with successful job creation
            # may mess up with many async jobs
            # await asyncio.sleep(0.01)
            if not self.__build_job(session, job):
                return
            if not self.__run_built_job(session, job):
                return
