"""
Конфигурация pytest.
Простые фикстуры для тестирования.
"""
import os
import pytest

# URL тестового API
BASE_URL = "http://127.0.0.1:8000"

# Учётные данные для тестов
TEST_ADMIN_EMAIL = "admin@example.com"
TEST_ADMIN_PASSWORD = "admin123"


def pytest_sessionstart(session):
    """
    Вызывается перед запуском всех тестов.
    Удаляет БД чтобы начать с чистого состояния.
    """
    print("\n" + "="*60)
    print("ВАЖНО: Перед запуском тестов нужно:")
    print("1. Остановить сервер (Ctrl+C)")
    print("2. Удалить БД: rm *.db")
    print("3. Запустить сервер: python run.py")
    print("4. Запустить тесты: pytest tests/ -v -s")
    print("="*60 + "\n")
    
    # Пытаемся удалить файлы БД
    db_files = ["test.db", "app.db", "task_management.db"]
    for db_file in db_files:
        if os.path.exists(db_file):
            print(f"ВНИМАНИЕ: Найден файл БД: {db_file}")
            print(f"Остановите сервер и удалите его: rm {db_file}\n")
