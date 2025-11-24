"""
Конфигурация базы данных.
Подключение к SQLite через SQLAlchemy.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Создание движка базы данных
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}  # Необходимо для SQLite
)

# Создание сессии
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()


def get_db():
    """
    Dependency для получения сессии базы данных.
    Используется в FastAPI endpoints.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Инициализация базы данных.
    Создание всех таблиц.
    """
    # Импортируем все модели, чтобы SQLAlchemy знал о них
    from app.models import user, board, task, board_member, comment, audit_log
    
    # Создание всех таблиц
    Base.metadata.create_all(bind=engine)
