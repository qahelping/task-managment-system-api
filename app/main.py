"""
Главный файл приложения FastAPI.
Task Management System API.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import auth, users, boards, tasks, stats, search, logs, bank_cards

# Создание приложения FastAPI
app = FastAPI(
    title="Task Management System API",
    description="Учебный REST API сервис для управления досками и задачами (аналог Trello)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Настройка CORS (оптимизировано)
# В production установите CORS_ORIGINS в .env
import os
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if os.getenv("ENV") == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,  # Кэшировать preflight запросы на 1 час (экономия ресурсов)
)

# Middleware для логирования медленных запросов (оптимизация)
from fastapi import Request
import time

@app.middleware("http")
async def log_slow_requests(request: Request, call_next):
    """
    Логирует запросы, которые выполняются дольше 1 секунды.
    Помогает выявить проблемы производительности.
    """
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    if process_time > 1.0:  # Логировать запросы > 1 секунды
        print(f"⚠ Slow request: {request.method} {request.url.path} took {process_time:.2f}s")
    
    return response

# Подключение роутеров
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(boards.router)
app.include_router(tasks.router)
app.include_router(stats.router)
app.include_router(search.router)
app.include_router(logs.router)
app.include_router(bank_cards.router)


@app.on_event("startup")
def startup_event():
    """
    Событие запуска приложения.
    Инициализация базы данных и автоматическое заполнение тестовыми данными.
    """
    import os
    import sys
    import importlib.util
    from sqlalchemy.orm import Session
    from app.database import SessionLocal
    from app.models.user import User
    from app.services import user_service
    from app.core.security import get_password_hash
    from app.core.config import settings
    
    init_db()
    print("Database initialized successfully!")
    
    # Автоматическое заполнение базы данных тестовыми данными
    db: Session = SessionLocal()
    try:
        user_count = user_service.count_users(db)
        
        # Оптимизация: заполняем БД только если она пустая И явно указано AUTO_FILL_DB=true
        # По умолчанию не заполняем при каждом запуске (экономия времени)
        should_fill_db = os.getenv("AUTO_FILL_DB", "false").lower() == "true"
        db_exists = os.path.exists("app.db") and os.path.getsize("app.db") > 0
        
        # Заполняем только если БД пустая и явно указано AUTO_FILL_DB=true
        if should_fill_db and not db_exists:
            print("\n🔄 Автоматическое заполнение базы данных тестовыми данными...")
            try:
                # Получаем путь к fill_database.py
                fill_db_path = os.path.join(os.path.dirname(__file__), "..", "fill_database.py")
                fill_db_path = os.path.abspath(fill_db_path)
                
                if os.path.exists(fill_db_path):
                    # Импортируем модуль fill_database
                    spec = importlib.util.spec_from_file_location("fill_database", fill_db_path)
                    fill_db_module = importlib.util.module_from_spec(spec)
                    
                    # Добавляем необходимые импорты в модуль
                    sys.path.insert(0, os.path.dirname(fill_db_path))
                    
                    spec.loader.exec_module(fill_db_module)
                    
                    # Вызываем функции заполнения БД
                    # fill_database.py уже проверяет существующих пользователей, поэтому безопасно вызывать при каждом запуске
                    users = fill_db_module.create_users(db)
                    boards = fill_db_module.create_boards(db, users)
                    tasks = fill_db_module.create_tasks(db, boards, users)
                    fill_db_module.create_board_members(db, boards, users)
                    fill_db_module.create_comments(db, tasks, users)
                    fill_db_module.create_audit_logs(db, users, boards, tasks)
                    
                    # Статистика
                    from app.models.board import Board
                    from app.models.task import Task
                    from app.models.board_member import BoardMember
                    from app.models.comment import TaskComment
                    from app.models.audit_log import AuditLog
                    
                    print("\n" + "=" * 70)
                    print("📊 Статистика данных в базе:")
                    print("=" * 70)
                    print(f"   👤 Пользователей: {db.query(User).count()}")
                    print(f"   📋 Досок: {db.query(Board).count()}")
                    print(f"   ✅ Задач: {db.query(Task).count()}")
                    print(f"   👥 Участников досок: {db.query(BoardMember).count()}")
                    print(f"   💬 Комментариев: {db.query(TaskComment).count()}")
                    print(f"   📊 Логов аудита: {db.query(AuditLog).count()}")
                    print("=" * 70)
                    print("✅ База данных успешно заполнена тестовыми данными!")
                else:
                    print(f"⚠ Warning: fill_database.py not found at {fill_db_path}")
                    # Fallback: создаем только администратора по умолчанию
                    if user_count == 0:
                        existing_admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
                        if not existing_admin:
                            admin_user = User(
                                username="admin",
                                email=settings.ADMIN_EMAIL,
                                password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                                role="admin"
                            )
                            db.add(admin_user)
                            db.commit()
                            print(f"✓ Default admin user created: {settings.ADMIN_EMAIL}")
            except Exception as e:
                db.rollback()
                print(f"⚠ Warning: Could not fill database: {e}")
                import traceback
                traceback.print_exc()
                # Fallback: создаем только администратора
                user_count = user_service.count_users(db)
                if user_count == 0:
                    existing_admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
                    if not existing_admin:
                        admin_user = User(
                            username="admin",
                            email=settings.ADMIN_EMAIL,
                            password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                            role="admin"
                        )
                        db.add(admin_user)
                        db.commit()
                        print(f"✓ Default admin user created: {settings.ADMIN_EMAIL}")
        elif db_exists:
            # БД уже существует, пропускаем заполнение
            print(f"✓ Database already exists ({user_count} users), skipping auto-fill")
            if user_count == 0:
                # Если БД существует но пустая, создаем только админа
                existing_admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
                if not existing_admin:
                    admin_user = User(
                        username="admin",
                        email=settings.ADMIN_EMAIL,
                        password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                        role="admin"
                    )
                    db.add(admin_user)
                    db.commit()
                    print(f"✓ Default admin user created: {settings.ADMIN_EMAIL}")
        else:
            # AUTO_FILL_DB=false, создаем только администратора по умолчанию
            if user_count == 0:
                existing_admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
                if not existing_admin:
                    admin_user = User(
                        username="admin",
                        email=settings.ADMIN_EMAIL,
                        password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                        role="admin"
                    )
                    db.add(admin_user)
                    db.commit()
                    print(f"✓ Default admin user created: {settings.ADMIN_EMAIL}")
                else:
                    print(f"✓ Admin user already exists: {settings.ADMIN_EMAIL}")
            else:
                print(f"✓ Database contains {user_count} user(s)")
    except Exception as e:
        db.rollback()
        print(f"⚠ Warning: Could not initialize database: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


@app.get("/health", tags=["Health"])
def health_check():
    """
    Проверка здоровья API.
    Возвращает статус работы сервиса и метрики ресурсов.
    """
    try:
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        return {
            "status": "ok",
            "memory": {
                "used_mb": round(process.memory_info().rss / 1024 / 1024, 2),
                "percent": round(psutil.virtual_memory().percent, 2),
            },
            "cpu": {
                "percent": round(psutil.cpu_percent(interval=0.1), 2),
            },
        }
    except ImportError:
        # Если psutil не установлен, возвращаем базовый статус
        return {"status": "ok", "message": "Install psutil for detailed metrics"}


@app.get("/", tags=["Root"])
def root():
    """
    Корневой эндпоинт.
    Приветствие и ссылки на документацию.
    """
    return {
        "message": "Task Management System API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health"
    }

