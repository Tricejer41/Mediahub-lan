from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MEDIA_SERIES: str = "/mnt/wd/Anime"
    MEDIA_MOVIES: str = ""
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    class Config:
        env_file = "../../.env"

settings = Settings()
