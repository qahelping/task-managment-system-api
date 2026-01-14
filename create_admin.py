"""
Скрипт для создания администратора.
Использование: python create_admin.py
"""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal, init_db
from app.models.user import User
from app.core.security import get_password_hash

# Инициализация БД
print("Инициализация базы данных...")
init_db()
print("✓ База данных готова\n")

# Создание сессии
db = SessionLocal()

try:
    # Данные администратора
    admin_email = "admin@example.com"
    admin_username = "admin"
    admin_password = "admin123"
    
    # Проверка существования пользователя
    existing_user = db.query(User).filter(User.email == admin_email).first()
    
    if existing_user:
        print(f"⚠ Пользователь с email {admin_email} уже существует!")
        print(f"   Username: {existing_user.username}")
        print(f"   Роль: {existing_user.role}")
        print(f"\n   Вы можете войти с этими данными:")
        print(f"   Email: {admin_email}")
        print(f"   Password: {admin_password if existing_user.password_hash else 'установлен другой пароль'}")
    else:
        # Создание администратора
        admin_user = User(
            username=admin_username,
            email=admin_email,
            password_hash=get_password_hash(admin_password),
            role="admin"
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✓ Администратор успешно создан!")
        print(f"\n   Данные для входа:")
        print(f"   Email: {admin_email}")
        print(f"   Password: {admin_password}")
        print(f"   Username: {admin_username}")
        print(f"   Роль: admin")
        
except Exception as e:
    db.rollback()
    print(f"✗ Ошибка: {e}")
    raise
finally:
    db.close()












