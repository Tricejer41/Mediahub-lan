from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MEDIA_SERIES: str = "/mnt/wd/Anime"
    MEDIA_MOVIES: str = ""
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    # ⬇⬇⬇  ¡este campo faltaba!
    DATABASE_URL: str = "sqlite+aiosqlite:///./mediahub.db"

    class Config:
        # .env está en la RAÍZ del repo, dos niveles arriba de este archivo
        env_file = "../../.env"

settings = Settings()
