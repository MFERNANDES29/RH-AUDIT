from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "RH Audit"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str = "CHANGE_THIS_IN_PRODUCTION"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8h
    ALGORITHM: str = "HS256"

    DATABASE_URL: str = "postgresql://rhaudit:rhaudit@db:5432/rhaudit"
    REDIS_URL: str = "redis://redis:6379/0"

    FIRST_ADMIN_EMAIL: str = "mfernandes@zeentech.com.br"
    FIRST_ADMIN_PASSWORD: str = "Zeen@2026!"

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@rhaudit.zeentech.com.br"

    UPLOAD_DIR: str = "/app/uploads"
    EXPORT_DIR: str = "/app/exports"

    class Config:
        env_file = ".env"

settings = Settings()
