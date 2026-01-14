"""
ПРОСТОЙ СКРИПТ ДЛЯ ЧТЕНИЯ ДАННЫХ ИЗ БД

Подключается к существующей БД и показывает все данные.
Запуск: python read_db.py
"""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models.user import User
from app.models.board import Board
from app.models.task import Task


# Подключение к БД
print("Подключение к базе данных...")
db = SessionLocal()

try:
    # Получаем всех пользователей
    print("\n" + "=" * 60)
    print("ПОЛЬЗОВАТЕЛИ")
    print("=" * 60)
    users = db.query(User).all()
    
    if users:
        for user in users:
            print(f"\nID: {user.id}")
            print(f"  Username: {user.username}")
            print(f"  Email: {user.email}")
            print(f"  Role: {user.role}")
    else:
        print("  Пользователей нет")
    
    # Получаем все доски
    print("\n" + "=" * 60)
    print("ДОСКИ")
    print("=" * 60)
    boards = db.query(Board).all()
    
    if boards:
        for board in boards:
            tasks_count = db.query(Task).filter(Task.board_id == board.id).count()
            print(f"\nID: {board.id}")
            print(f"  Title: {board.title}")
            print(f"  Description: {board.description or 'нет'}")
            print(f"  Public: {board.public}")
            print(f"  Archived: {board.archived}")
            print(f"  Created by: {board.created_by}")
            print(f"  Tasks: {tasks_count}")
    else:
        print("  Досок нет")
    
    # Получаем все задачи
    print("\n" + "=" * 60)
    print("ЗАДАЧИ")
    print("=" * 60)
    tasks = db.query(Task).all()
    
    if tasks:
        for task in tasks:
            print(f"\nID: {task.id}")
            print(f"  Title: {task.title}")
            print(f"  Description: {task.description or 'нет'}")
            print(f"  Status: {task.status}")
            print(f"  Priority: {task.priority}")
            print(f"  Board ID: {task.board_id}")
            print(f"  Created by: {task.created_by}")
    else:
        print("  Задач нет")
    
    # Статистика
    print("\n" + "=" * 60)
    print("СТАТИСТИКА")
    print("=" * 60)
    print(f"Всего пользователей: {db.query(User).count()}")
    print(f"Всего досок: {db.query(Board).count()}")
    print(f"Всего задач: {db.query(Task).count()}")
    
except Exception as e:
    print(f"\n❌ Ошибка: {e}")
finally:
    db.close()
    print("\n✓ Подключение закрыто")













