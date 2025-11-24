"""
Главный файл приложения FastAPI.
Task Management System API.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import auth, users, boards, tasks, stats, search, logs

# Создание приложения FastAPI
app = FastAPI(
    title="Task Management System API",
    description="Учебный REST API сервис для управления досками и задачами (аналог Trello)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Настройка CORS (для разработки)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(boards.router)
app.include_router(tasks.router)
app.include_router(stats.router)
app.include_router(search.router)
app.include_router(logs.router)


@app.on_event("startup")
def startup_event():
    """
    Событие запуска приложения.
    Инициализация базы данных.
    """
    init_db()
    print("Database initialized successfully!")


@app.get("/health", tags=["Health"])
def health_check():
    """
    Проверка здоровья API.
    Возвращает статус работы сервиса.
    """
    return {"status": "ok"}


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

