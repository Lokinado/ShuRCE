import uvicorn
from decouple import config

from .app.api import app

host: str = config("host", default="127.0.0.1")
port: int = config("port", default="8081", cast=int)

if __name__ == "__main__":
    uvicorn.run(app, host=host, port=port)
