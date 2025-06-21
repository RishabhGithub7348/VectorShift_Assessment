from src.app.application import app
from src.config.config import config

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.app.application:app", host="localhost", port=config.APP_PORT, reload=True)