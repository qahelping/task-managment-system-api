"""
Скрипт миграции для добавления поля public в таблицу boards.
Запустите этот скрипт после обновления моделей.
"""
import sqlite3

def migrate():
    # Подключение к БД
    conn = sqlite3.connect('task_management.db')
    cursor = conn.cursor()
    
    try:
        # Проверяем существует ли уже поле
        cursor.execute("PRAGMA table_info(boards)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'public' not in columns:
            print("Добавляем поле 'public' в таблицу boards...")
            cursor.execute("""
                ALTER TABLE boards 
                ADD COLUMN public BOOLEAN DEFAULT 0 NOT NULL
            """)
            conn.commit()
            print("✓ Поле 'public' успешно добавлено")
        else:
            print("✓ Поле 'public' уже существует")
            
    except sqlite3.Error as e:
        print(f"✗ Ошибка миграции: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("="*50)
    print("Миграция базы данных")
    print("="*50)
    migrate()
    print("="*50)
    print("Миграция завершена")

