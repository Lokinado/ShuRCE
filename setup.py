from setuptools import find_packages, setup

setup(
    name="shurce",  # The name of your package
    version="0.1.0",  # Version number
    packages=find_packages(),  # Automatically find packages in your structure
    include_package_data=True,
    package_data={
        "shurce": ["static/**/*"],  # Include all files under `static`
    },
    install_requires=[
        "annotated-types==0.7.0",
        "anyio==4.6.2.post1",
        "bcrypt==4.0.1",
        "certifi==2024.8.30",
        "charset-normalizer==3.4.0",
        "click==8.1.7",
        "dnspython==2.7.0",
        "docker==7.1.0",
        "email_validator==2.2.0",
        "fastapi==0.115.5",
        "fastapi-cli==0.0.5",
        "fastapi-jwt-auth==0.5.0",
        "greenlet==3.1.1",
        "h11==0.14.0",
        "httpcore==1.0.6",
        "httptools==0.6.4",
        "httpx==0.27.2",
        "idna==3.10",
        "importlib_resources==6.5.2",
        "Jinja2==3.1.4",
        "markdown-it-py==3.0.0",
        "MarkupSafe==3.0.2",
        "mdurl==0.1.2",
        "passlib==1.7.4",
        "pydantic==2.9.2",
        "pydantic_core==2.23.4",
        "Pygments==2.18.0",
        "PyJWT==1.7.1",
        "python-decouple==3.8",
        "python-dotenv==1.0.1",
        "python-multipart==0.0.17",
        "PyYAML==6.0.2",
        "requests==2.32.3",
        "rich==13.9.4",
        "shellingham==1.5.4",
        "sniffio==1.3.1",
        "SQLAlchemy==2.0.36",
        "sqlmodel==0.0.22",
        "starlette==0.41.2",
        "typer==0.13.0",
        "typing_extensions==4.12.2",
        "urllib3==2.2.3",
        "uvicorn==0.32.0",
        "uvloop==0.21.0",
        "watchfiles==0.24.0",
        "websockets==14.1",
    ],  # Include all necessary dependencies
    entry_points={
        "console_scripts": [
            "shurce=shurce.main:main"  # Add a console entry point if needed
        ]
    },
    zip_safe=False,
)
