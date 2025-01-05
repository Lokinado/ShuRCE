import uvicorn
from decouple import config

host: str = config("host", default="127.0.0.1")
port: int = config("port", default="8081", cast=int)


def main():
    uvicorn.run("app.api:app", host=host, port=port, reload=True)


if __name__ == "__main__":
    main()
