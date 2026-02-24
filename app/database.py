"""
Конфигурация базы данных.
Подключение к SQLite через SQLAlchemy.
"""
from sqlalchemy import create_engine, event
from sqlalchemy.pool import StaticPool, QueuePool
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Создание движка базы данных с оптимизацией connection pooling
if settings.DATABASE_URL.startswith("sqlite"):
    # Для SQLite используем StaticPool с оптимизациями
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={
            "check_same_thread": False,  # Необходимо для SQLite
            "timeout": 20,  # Таймаут для блокировок (20 секунд)
        },
        poolclass=StaticPool,
        pool_pre_ping=True,  # Проверка соединения перед использованием
        echo=False,  # Отключить логирование SQL (экономия ресурсов)
    )
    
    # Оптимизация SQLite для лучшей производительности
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")  # Write-Ahead Logging для лучшей производительности
        cursor.execute("PRAGMA synchronous=NORMAL")  # Баланс между производительностью и надежностью
        cursor.execute("PRAGMA cache_size=-64000")  # 64MB кэш (по умолчанию 2MB)
        cursor.execute("PRAGMA temp_store=MEMORY")  # Временные таблицы в памяти
        cursor.execute("PRAGMA mmap_size=268435456")  # 256MB memory-mapped I/O
        cursor.close()
else:
    # Для PostgreSQL/MySQL используем QueuePool
    engine = create_engine(
        settings.DATABASE_URL,
        poolclass=QueuePool,
        pool_size=10,  # Количество соединений в пуле
        max_overflow=20,  # Максимум дополнительных соединений
        pool_pre_ping=True,  # Проверка соединения перед использованием
        pool_recycle=3600,  # Переиспользовать соединения каждый час
        echo=False,  # Отключить логирование SQL
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
    # Применяем миграции для существующих БД (добавляем отсутствующие колонки)
    _run_schema_migrations()


def _run_schema_migrations():
    """Добавляет отсутствующие колонки в таблицы (миграции без сторонних инструментов)."""
    if not settings.DATABASE_URL.startswith("sqlite"):
        return
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            result = conn.execute(text("PRAGMA table_info(tasks)"))
            columns = [row[1] for row in result.fetchall()]
        except Exception:
            return
        conn.commit()
        if not columns:
            return  # таблица только что создана create_all(), все колонки уже есть
        if "assignee_id" not in columns:
            try:
                conn.execute(text("ALTER TABLE tasks ADD COLUMN assignee_id INTEGER REFERENCES users(id)"))
                conn.commit()
            except Exception:
                conn.rollback()
        if "order" not in columns:
            try:
                conn.execute(text("ALTER TABLE tasks ADD COLUMN \"order\" INTEGER DEFAULT 0 NOT NULL"))
                conn.commit()
            except Exception:
                conn.rollback()
