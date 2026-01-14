"""
МАКСИМАЛЬНО ПРОСТОЙ СКРИПТ ДЛЯ ДЕМОНСТРАЦИИ РАБОТЫ С БД

Показывает базовые операции:
1. Подключение к БД
2. Создание данных (CREATE)
3. Поиск данных (READ)
4. Обновление данных (UPDATE)
5. Удаление данных (DELETE)

Запуск: python db_demo.py
"""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal, init_db
from app.models.user import User
from app.models.board import Board
from app.models.task import Task
from app.core.security import get_password_hash


# ============================================
# ШАГ 1: ИНИЦИАЛИЗАЦИЯ БД
# ============================================
print("1. Инициализация базы данных...")
init_db()
print("   ✓ База данных готова\n")

# ============================================
# ШАГ 2: ПОДКЛЮЧЕНИЕ К БД
# ============================================
print("2. Подключение к базе данных...")
db = SessionLocal()
print("   ✓ Подключено\n")

try:
    # ============================================
    # ШАГ 3: СОЗДАНИЕ ДАННЫХ (CREATE)
    # ============================================
    print("3. СОЗДАНИЕ ДАННЫХ")
    print("   " + "-" * 40)
    
    # Создаём пользователя
    print("   Создаём пользователя...")
    user = User(
        username="demo_user",
        email="demo@example.com",
        password_hash=get_password_hash("password123"),
        role="user"
    )
    db.add(user)           # Добавляем в сессию
    db.commit()            # Сохраняем в БД
    db.refresh(user)       # Получаем ID из БД
    print(f"   ✓ Пользователь создан: {user.username} (ID: {user.id})")
    
    # Создаём доску
    print("   Создаём доску...")
    board = Board(
        title="Демо доска",
        description="Это демонстрационная доска",
        public=True,
        created_by=user.id
    )
    db.add(board)
    db.commit()
    db.refresh(board)
    print(f"   ✓ Доска создана: {board.title} (ID: {board.id})")
    
    # Создаём задачу
    print("   Создаём задачу...")
    task = Task(
        title="Демо задача",
        description="Это демонстрационная задача",
        status="todo",
        priority="high",
        board_id=board.id,
        created_by=user.id
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    print(f"   ✓ Задача создана: {task.title} (ID: {task.id})\n")
    
    # ============================================
    # ШАГ 4: ПОИСК ДАННЫХ (READ)
    # ============================================
    print("4. ПОИСК ДАННЫХ")
    print("   " + "-" * 40)
    
    # Поиск пользователя по ID
    print("   Ищем пользователя по ID...")
    found_user = db.query(User).filter(User.id == user.id).first()
    print(f"   ✓ Найден: {found_user.username} ({found_user.email})")
    
    # Поиск по email
    print("   Ищем пользователя по email...")
    user_by_email = db.query(User).filter(User.email == "demo@example.com").first()
    print(f"   ✓ Найден: {user_by_email.username}")
    
    # Поиск всех досок пользователя
    print("   Ищем все доски пользователя...")
    user_boards = db.query(Board).filter(Board.created_by == user.id).all()
    print(f"   ✓ Найдено досок: {len(user_boards)}")
    
    # Поиск всех задач на доске
    print("   Ищем все задачи на доске...")
    board_tasks = db.query(Task).filter(Task.board_id == board.id).all()
    print(f"   ✓ Найдено задач: {len(board_tasks)}\n")
    
    # ============================================
    # ШАГ 5: ОБНОВЛЕНИЕ ДАННЫХ (UPDATE)
    # ============================================
    print("5. ОБНОВЛЕНИЕ ДАННЫХ")
    print("   " + "-" * 40)
    
    print("   Обновляем задачу...")
    print(f"   Было: статус={task.status}, приоритет={task.priority}")
    
    task.status = "in_progress"    # Меняем статус
    task.priority = "medium"       # Меняем приоритет
    db.commit()                     # Сохраняем изменения
    db.refresh(task)                # Обновляем объект из БД
    
    print(f"   Стало: статус={task.status}, приоритет={task.priority}")
    print("   ✓ Задача обновлена\n")
    
    # ============================================
    # ШАГ 6: УДАЛЕНИЕ ДАННЫХ (DELETE)
    # ============================================
    print("6. УДАЛЕНИЕ ДАННЫХ")
    print("   " + "-" * 40)
    
    print("   Удаляем задачу...")
    task_id = task.id
    db.delete(task)                 # Удаляем из сессии
    db.commit()                     # Сохраняем изменения
    
    # Проверяем что задача удалена
    deleted_task = db.query(Task).filter(Task.id == task_id).first()
    if deleted_task is None:
        print(f"   ✓ Задача удалена (ID: {task_id})\n")
    
    # ============================================
    # ШАГ 7: СТАТИСТИКА
    # ============================================
    print("7. СТАТИСТИКА")
    print("   " + "-" * 40)
    
    users_count = db.query(User).count()
    boards_count = db.query(Board).count()
    tasks_count = db.query(Task).count()
    
    print(f"   Пользователей в БД: {users_count}")
    print(f"   Досок в БД: {boards_count}")
    print(f"   Задач в БД: {tasks_count}")
    
    print("\n" + "=" * 50)
    print("✓ ВСЕ ОПЕРАЦИИ ВЫПОЛНЕНЫ УСПЕШНО!")
    print("=" * 50)
    
except Exception as e:
    print(f"\n❌ ОШИБКА: {e}")
    db.rollback()  # Откатываем изменения при ошибке
    raise
    
finally:
    db.close()  # Закрываем подключение
    print("\n✓ Подключение к БД закрыто")













