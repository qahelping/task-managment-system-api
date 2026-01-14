"""
КАК ИЗБЕЖАТЬ ОШИБКИ UNIQUE constraint failed

Показывает как проверить существование записи перед созданием
и как обработать ошибку IntegrityError.
"""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models.user import User
from app.models.board import Board
from app.models.task import Task
from app.core.security import get_password_hash
from sqlalchemy.exc import IntegrityError


db = SessionLocal()

try:
    print("=" * 70)
    print("КАК ИЗБЕЖАТЬ ОШИБКИ UNIQUE constraint failed")
    print("=" * 70)
    
    # ============================================
    # СПОСОБ 1: ПРОВЕРКА ПЕРЕД СОЗДАНИЕМ (РЕКОМЕНДУЕТСЯ)
    # ============================================
    print("\n1. СПОСОБ 1: ПРОВЕРКА ПЕРЕД СОЗДАНИЕМ")
    print("   " + "-" * 60)
    
    email = "test_db@example.com"
    
    # Проверяем существует ли пользователь
    existing_user = db.query(User).filter_by(email=email).first()
    
    if existing_user:
        print(f"   ⚠ Пользователь с email '{email}' уже существует!")
        print(f"   ID: {existing_user.id}, Username: {existing_user.username}")
        print("   Пропускаем создание")
    else:
        print(f"   ✓ Пользователя с email '{email}' нет, создаём...")
        new_user = User(
            username="test_user_db",
            email=email,
            password_hash=get_password_hash("password123"),
            role="user"
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"   ✓ Пользователь создан: ID={new_user.id}")
    
    # ============================================
    # СПОСОБ 2: ОБРАБОТКА ОШИБКИ IntegrityError
    # ============================================
    print("\n2. СПОСОБ 2: ОБРАБОТКА ОШИБКИ IntegrityError")
    print("   " + "-" * 60)
    
    try:
        # Пытаемся создать пользователя
        user = User(
            username="test_user_db_2",
            email="test_db@example.com",  # Этот email уже существует
            password_hash=get_password_hash("password123"),
            role="user"
        )
        db.add(user)
        db.commit()
        print("   ✓ Пользователь создан")
    except IntegrityError as e:
        db.rollback()  # Важно откатить транзакцию!
        print(f"   ⚠ Ошибка: {e.orig}")
        print("   Пользователь с таким email уже существует")
        print("   Изменения откачены (rollback)")
    
    # ============================================
    # СПОСОБ 3: ФУНКЦИЯ get_or_create
    # ============================================
    print("\n3. СПОСОБ 3: ФУНКЦИЯ get_or_create (ПАТТЕРН)")
    print("   " + "-" * 60)
    
    def get_or_create_user(email, username, password, role="user"):
        """Получить пользователя или создать если его нет"""
        user = db.query(User).filter_by(email=email).first()
        
        if user:
            print(f"   ✓ Пользователь найден: {user.username}")
            return user, False  # False = не создан, уже существовал
        
        # Создаём нового пользователя
        user = User(
            username=username,
            email=email,
            password_hash=get_password_hash(password),
            role=role
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"   ✓ Пользователь создан: {user.username}")
        return user, True  # True = создан новый
    
    # Используем функцию
    user1, created1 = get_or_create_user(
        email="existing@example.com",
        username="existing_user",
        password="pass123"
    )
    
    # Пытаемся создать того же пользователя снова
    user2, created2 = get_or_create_user(
        email="existing@example.com",
        username="existing_user",
        password="pass123"
    )
    
    print(f"\n   Первый вызов: создан={created1}")
    print(f"   Второй вызов: создан={created2}")
    
    # ============================================
    # СПОСОБ 4: ПРОВЕРКА ПО РАЗНЫМ ПОЛЯМ
    # ============================================
    print("\n4. СПОСОБ 4: ПРОВЕРКА ПО РАЗНЫМ ПОЛЯМ")
    print("   " + "-" * 60)
    
    def check_user_exists(email=None, username=None):
        """Проверить существует ли пользователь"""
        query = db.query(User)
        
        if email:
            query = query.filter_by(email=email)
        if username:
            query = query.filter_by(username=username)
        
        return query.first() is not None
    
    # Проверка по email
    email_exists = check_user_exists(email="test_db@example.com")
    print(f"   Пользователь с email 'test_db@example.com' существует: {email_exists}")
    
    # Проверка по username
    username_exists = check_user_exists(username="test_user_db")
    print(f"   Пользователь с username 'test_user_db' существует: {username_exists}")
    
    # ============================================
    # ПРАКТИЧЕСКИЕ ПРИМЕРЫ
    # ============================================
    print("\n" + "=" * 70)
    print("ПРАКТИЧЕСКИЕ ПРИМЕРЫ")
    print("=" * 70)
    
    # Пример 1: Создание пользователя с проверкой
    print("\nПример 1: Создание пользователя с проверкой")
    new_email = "new_user@example.com"
    new_username = "new_user"
    
    if not db.query(User).filter_by(email=new_email).first():
        user = User(
            username=new_username,
            email=new_email,
            password_hash=get_password_hash("pass123"),
            role="user"
        )
        db.add(user)
        db.commit()
        print(f"   ✓ Пользователь '{new_username}' создан")
    else:
        print(f"   ⚠ Пользователь с email '{new_email}' уже существует")
    
    # Пример 2: Обновление или создание (upsert)
    print("\nПример 2: Обновление или создание (upsert)")
    upsert_email = "upsert@example.com"
    upsert_username = "upsert_user"
    
    user = db.query(User).filter_by(email=upsert_email).first()
    
    if user:
        # Обновляем существующего
        user.username = upsert_username
        db.commit()
        print(f"   ✓ Пользователь обновлён: {user.username}")
    else:
        # Создаём нового
        user = User(
            username=upsert_username,
            email=upsert_email,
            password_hash=get_password_hash("pass123"),
            role="user"
        )
        db.add(user)
        db.commit()
        print(f"   ✓ Пользователь создан: {user.username}")
    
    # Пример 3: Массовое создание с проверкой
    print("\nПример 3: Массовое создание с проверкой")
    users_to_create = [
        {"email": "user1@test.com", "username": "user1"},
        {"email": "user2@test.com", "username": "user2"},
        {"email": "user1@test.com", "username": "user1_duplicate"},  # Дубликат email
    ]
    
    created_count = 0
    skipped_count = 0
    
    for user_data in users_to_create:
        if not db.query(User).filter_by(email=user_data["email"]).first():
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                password_hash=get_password_hash("pass123"),
                role="user"
            )
            db.add(user)
            created_count += 1
        else:
            skipped_count += 1
    
    db.commit()
    print(f"   ✓ Создано: {created_count}, пропущено: {skipped_count}")
    
    # ============================================
    # РЕЗЮМЕ
    # ============================================
    print("\n" + "=" * 70)
    print("РЕЗЮМЕ")
    print("=" * 70)
    
    print("\n✅ РЕКОМЕНДУЕТСЯ:")
    print("   1. Проверять существование перед созданием:")
    print("      user = db.query(User).filter_by(email=email).first()")
    print("      if not user:")
    print("          # создаём")
    
    print("\n✅ АЛЬТЕРНАТИВА:")
    print("   2. Обрабатывать IntegrityError:")
    print("      try:")
    print("          db.add(user)")
    print("          db.commit()")
    print("      except IntegrityError:")
    print("          db.rollback()")
    
    print("\n✅ ПАТТЕРН:")
    print("   3. Использовать функцию get_or_create")
    
    print("\n⚠️ ВАЖНО:")
    print("   - Всегда вызывайте db.rollback() при ошибке")
    print("   - Проверяйте уникальные поля (email, username)")
    print("   - Используйте .first() для проверки существования")
    
except Exception as e:
    print(f"\n❌ Ошибка: {e}")
    db.rollback()
    import traceback
    traceback.print_exc()
finally:
    db.close()













