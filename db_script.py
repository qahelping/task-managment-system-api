"""
Простой скрипт для создания тестовых данных в БД.
Использование: python db_script.py
"""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal, init_db
from app.models.user import User
from app.models.board import Board
from app.models.task import Task
from app.core.security import get_password_hash


# Инициализация БД
print("Инициализация базы данных...")
init_db()
print("✓ База данных готова\n")

# Создание сессии
db = SessionLocal()

try:
    print("=" * 60)
    print("Создание тестовых данных...")
    print("=" * 60)
    
    # 1. Создание пользователей
    print("\n1. Пользователи:")
    
    users_data = [
        {"username": "admin_user", "email": "admin@test.com", "password": "admin123", "role": "admin"},
        {"username": "regular_user", "email": "user@test.com", "password": "user123", "role": "user"},
        {"username": "guest_user", "email": "guest@test.com", "password": "guest123", "role": "guest"}
    ]
    
    created_users = []
    for user_data in users_data:
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if existing_user:
            print(f"   ⚠ {user_data['email']} уже существует")
            created_users.append(existing_user)
        else:
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                password_hash=get_password_hash(user_data["password"]),
                role=user_data["role"]
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            created_users.append(user)
            print(f"   ✓ {user.username} (ID: {user.id}, роль: {user.role})")
    
    # 2. Создание досок
    print("\n2. Доски:")
    
    creator = created_users[0]
    
    boards_data = [
        {"title": "Моя первая доска", "description": "Описание первой доски", "public": True},
        {"title": "Рабочие задачи", "description": "Доска для рабочих задач", "public": False},
        {"title": "Личные проекты", "description": "Мои личные проекты", "public": True}
    ]
    
    created_boards = []
    for board_data in boards_data:
        existing_board = db.query(Board).filter(
            Board.title == board_data["title"],
            Board.created_by == creator.id
        ).first()
        
        if existing_board:
            print(f"   ⚠ Доска '{board_data['title']}' уже существует")
            created_boards.append(existing_board)
        else:
            board = Board(
                title=board_data["title"],
                description=board_data["description"],
                public=board_data["public"],
                archived=False,
                created_by=creator.id
            )
            db.add(board)
            db.commit()
            db.refresh(board)
            created_boards.append(board)
            print(f"   ✓ {board.title} (ID: {board.id}, публичная: {board.public})")
    
    # 3. Создание задач
    print("\n3. Задачи:")
    
    if created_boards:
        board = created_boards[0]
        
        tasks_data = [
            {"title": "Изучить Python", "description": "Изучить основы Python", "status": "in_progress", "priority": "high"},
            {"title": "Написать тесты", "description": "Написать unit-тесты", "status": "todo", "priority": "medium"},
            {"title": "Документация", "description": "Написать документацию", "status": "todo", "priority": "low"},
            {"title": "Завершить проект", "description": "Финальная проверка", "status": "done", "priority": "high"}
        ]
        
        for i, task_data in enumerate(tasks_data, start=1):
            existing_task = db.query(Task).filter(
                Task.title == task_data["title"],
                Task.board_id == board.id
            ).first()
            
            if existing_task:
                print(f"   ⚠ Задача '{task_data['title']}' уже существует")
            else:
                task = Task(
                    title=task_data["title"],
                    description=task_data["description"],
                    status=task_data["status"],
                    priority=task_data["priority"],
                    order=i,
                    board_id=board.id,
                    created_by=creator.id
                )
                db.add(task)
                db.commit()
                db.refresh(task)
                print(f"   ✓ {task.title} (ID: {task.id}, статус: {task.status})")
    
    # 4. Статистика
    print("\n" + "=" * 60)
    print("Статистика:")
    print("=" * 60)
    
    users_count = db.query(User).count()
    boards_count = db.query(Board).count()
    tasks_count = db.query(Task).count()
    
    print(f"Пользователей: {users_count}")
    print(f"Досок: {boards_count}")
    print(f"Задач: {tasks_count}")
    
    print("\n" + "=" * 60)
    print("✓ Готово!")
    print("=" * 60)
    
except Exception as e:
    print(f"\n❌ Ошибка: {e}")
    db.rollback()
    raise
finally:
    db.close()

