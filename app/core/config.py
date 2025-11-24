"""
Конфигурация приложения.
Загрузка настроек из .env файла.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Настройки приложения"""
    
    DATABASE_URL: str = "sqlite:///./app.db"
    JWT_SECRET: str
    JWT_EXPIRE_MINUTES: int = 1440
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "admin123"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
