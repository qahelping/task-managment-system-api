"""
ПРОСТОЙ ПРИМЕР РАБОТЫ С БД

Показывает основные операции:
- Создание данных
- Поиск данных  
- Обновление данных
- Удаление данных

Запуск: python simple_db_example.py
"""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal, init_db
from app.models.user import User
from app.models.board import Board
from app.models.task import Task
from app.core.security import get_password_hash

# Подключение к БД
init_db()
db = SessionLocal()

try:
    # СОЗДАНИЕ
    print("1. Создание данных...")
    user = User(username="user1", email="user1@test.com", 
                password_hash=get_password_hash("pass123"), role="user")
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"   ✓ Пользователь: {user.username} (ID: {user.id})")
    
    board = Board(title="Доска 1", created_by=user.id)
    db.add(board)
    db.commit()
    db.refresh(board)
    print(f"   ✓ Доска: {board.title} (ID: {board.id})")
    
    task = Task(title="Задача 1", status="todo", board_id=board.id, created_by=user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    print(f"   ✓ Задача: {task.title} (ID: {task.id})\n")
    
    # ПОИСК
    print("2. Поиск данных...")
    found = db.query(User).filter(User.id == user.id).first()
    print(f"   ✓ Найден: {found.username}")
    
    all_boards = db.query(Board).filter(Board.created_by == user.id).all()
    print(f"   ✓ Досок у пользователя: {len(all_boards)}\n")
    
    # ОБНОВЛЕНИЕ
    print("3. Обновление данных...")
    task.status = "done"
    db.commit()
    print(f"   ✓ Задача обновлена: статус={task.status}\n")
    
    # УДАЛЕНИЕ
    print("4. Удаление данных...")
    task_id = task.id
    db.delete(task)
    db.commit()
    print(f"   ✓ Задача удалена (ID: {task_id})\n")
    
    # СТАТИСТИКА
    print("5. Статистика:")
    print(f"   Пользователей: {db.query(User).count()}")
    print(f"   Досок: {db.query(Board).count()}")
    print(f"   Задач: {db.query(Task).count()}")
    
except Exception as e:
    print(f"❌ Ошибка: {e}")
    db.rollback()
finally:
    db.close()

