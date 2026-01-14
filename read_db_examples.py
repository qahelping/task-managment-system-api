"""
ПРИМЕРЫ ПРАВИЛЬНОГО ИСПОЛЬЗОВАНИЯ filter() И filter_by()

Показывает разницу между методами и правильный синтаксис.
"""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models.user import User
from app.models.board import Board
from app.models.task import Task


db = SessionLocal()

try:
    print("=" * 70)
    print("ПРАВИЛЬНОЕ ИСПОЛЬЗОВАНИЕ filter() И filter_by()")
    print("=" * 70)
    
    # ============================================
    # МЕТОД 1: filter() - принимает выражения сравнения
    # ============================================
    print("\n1. ИСПОЛЬЗОВАНИЕ filter()")
    print("   " + "-" * 60)
    print("   Синтаксис: db.query(Model).filter(Model.field == value)")
    print("\n   Примеры:")
    
    # Правильно - используем filter() с выражением
    tasks_filter = db.query(Task).filter(Task.board_id == 1).all()
    print(f"   ✓ db.query(Task).filter(Task.board_id == 1)")
    print(f"     Найдено задач: {len(tasks_filter)}")
    
    # Можно использовать несколько условий
    tasks_multi = db.query(Task).filter(
        Task.board_id == 1,
        Task.status == "todo"
    ).all()
    print(f"   ✓ db.query(Task).filter(Task.board_id == 1, Task.status == 'todo')")
    print(f"     Найдено задач: {len(tasks_multi)}")
    
    # Можно использовать and_, or_
    from sqlalchemy import and_, or_
    tasks_and = db.query(Task).filter(
        and_(Task.board_id == 1, Task.status == "todo")
    ).all()
    print(f"   ✓ db.query(Task).filter(and_(Task.board_id == 1, Task.status == 'todo'))")
    print(f"     Найдено задач: {len(tasks_and)}")
    
    # ============================================
    # МЕТОД 2: filter_by() - принимает именованные аргументы
    # ============================================
    print("\n2. ИСПОЛЬЗОВАНИЕ filter_by()")
    print("   " + "-" * 60)
    print("   Синтаксис: db.query(Model).filter_by(field=value)")
    print("   ВАЖНО: БЕЗ Model. перед именем поля!")
    print("\n   Примеры:")
    
    # Правильно - используем filter_by() с именованными аргументами
    tasks_filter_by = db.query(Task).filter_by(board_id=1).all()
    print(f"   ✓ db.query(Task).filter_by(board_id=1)")
    print(f"     Найдено задач: {len(tasks_filter_by)}")
    
    # Можно использовать несколько условий
    tasks_multi_by = db.query(Task).filter_by(
        board_id=1,
        status="todo"
    ).all()
    print(f"   ✓ db.query(Task).filter_by(board_id=1, status='todo')")
    print(f"     Найдено задач: {len(tasks_multi_by)}")
    
    # ============================================
    # ОШИБКИ - ЧТО НЕЛЬЗЯ ДЕЛАТЬ
    # ============================================
    print("\n3. ЧАСТЫЕ ОШИБКИ")
    print("   " + "-" * 60)
    
    print("\n   ❌ НЕПРАВИЛЬНО:")
    print("      db.query(Task).filter_by(Task.board_id == 1)")
    print("      Ошибка: filter_by() не принимает выражения сравнения!")
    
    print("\n   ✅ ПРАВИЛЬНО:")
    print("      db.query(Task).filter_by(board_id=1)")
    print("      или")
    print("      db.query(Task).filter(Task.board_id == 1)")
    
    # ============================================
    # КОГДА ЧТО ИСПОЛЬЗОВАТЬ
    # ============================================
    print("\n4. КОГДА ЧТО ИСПОЛЬЗОВАТЬ")
    print("   " + "-" * 60)
    
    print("\n   filter() - используйте когда:")
    print("   - Нужны сложные условия (and_, or_, >, <, !=)")
    print("   - Работаете с несколькими таблицами (JOIN)")
    print("   - Нужны выражения сравнения")
    
    print("\n   Примеры:")
    print("   - filter(Task.board_id == 1)")
    print("   - filter(Task.status.in_(['todo', 'in_progress']))")
    print("   - filter(Task.created_at > some_date)")
    
    print("\n   filter_by() - используйте когда:")
    print("   - Простые условия равенства")
    print("   - Работаете с одной таблицей")
    print("   - Хотите более читаемый код")
    
    print("\n   Примеры:")
    print("   - filter_by(board_id=1)")
    print("   - filter_by(status='todo', priority='high')")
    
    # ============================================
    # ПРАКТИЧЕСКИЕ ПРИМЕРЫ
    # ============================================
    print("\n5. ПРАКТИЧЕСКИЕ ПРИМЕРЫ")
    print("   " + "-" * 60)
    
    # Пример 1: Получить задачи для доски с ID=1
    print("\n   Пример 1: Задачи для доски с ID=1")
    tasks_board1_filter = db.query(Task).filter(Task.board_id == 1).all()
    tasks_board1_filter_by = db.query(Task).filter_by(board_id=1).all()
    print(f"   filter(): {len(tasks_board1_filter)} задач")
    print(f"   filter_by(): {len(tasks_board1_filter_by)} задач")
    
    # Пример 2: Получить пользователя по email
    print("\n   Пример 2: Пользователь по email")
    user_filter = db.query(User).filter(User.email == "admin@test.com").first()
    user_filter_by = db.query(User).filter_by(email="admin@test.com").first()
    print(f"   filter(): {user_filter.username if user_filter else 'не найден'}")
    print(f"   filter_by(): {user_filter_by.username if user_filter_by else 'не найден'}")
    
    # Пример 3: Сложное условие (только filter())
    print("\n   Пример 3: Сложное условие (только filter())")
    from sqlalchemy import or_
    tasks_complex = db.query(Task).filter(
        or_(
            Task.status == "todo",
            Task.status == "in_progress"
        )
    ).all()
    print(f"   Найдено задач со статусом 'todo' или 'in_progress': {len(tasks_complex)}")
    
    print("\n" + "=" * 70)
    print("✓ ВСЕ ПРИМЕРЫ ВЫПОЛНЕНЫ")
    print("=" * 70)
    
except Exception as e:
    print(f"\n❌ Ошибка: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()













