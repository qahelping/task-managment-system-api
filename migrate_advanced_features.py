"""
Скрипт миграции для добавления новых полей и таблиц.
Запустите этот скрипт после обновления моделей.
"""
import sqlite3

def migrate():
    conn = sqlite3.connect('task_management.db')
    cursor = conn.cursor()
    
    try:
        print("Начинаем миграцию...")
        
        # Проверяем существующие колонки
        cursor.execute("PRAGMA table_info(boards)")
        board_columns = [col[1] for col in cursor.fetchall()]
        
        cursor.execute("PRAGMA table_info(users)")
        user_columns = [col[1] for col in cursor.fetchall()]
        
        cursor.execute("PRAGMA table_info(tasks)")
        task_columns = [col[1] for col in cursor.fetchall()]
        
        # Добавляем поле archived в boards
        if 'archived' not in board_columns:
            print("Добавляем поле 'archived' в таблицу boards...")
            cursor.execute("ALTER TABLE boards ADD COLUMN archived BOOLEAN DEFAULT 0 NOT NULL")
            print("✓ Поле 'archived' добавлено")
        else:
            print("✓ Поле 'archived' уже существует")
        
        # Добавляем поле avatar_url в users
        if 'avatar_url' not in user_columns:
            print("Добавляем поле 'avatar_url' в таблицу users...")
            cursor.execute("ALTER TABLE users ADD COLUMN avatar_url VARCHAR")
            print("✓ Поле 'avatar_url' добавлено")
        else:
            print("✓ Поле 'avatar_url' уже существует")
        
        # Добавляем поле order в tasks
        if 'order' not in task_columns:
            print("Добавляем поле 'order' в таблицу tasks...")
            cursor.execute("ALTER TABLE tasks ADD COLUMN order INTEGER DEFAULT 0 NOT NULL")
            print("✓ Поле 'order' добавлено")
        else:
            print("✓ Поле 'order' уже существует")
        
        # Добавляем поле parent_task_id в tasks
        if 'parent_task_id' not in task_columns:
            print("Добавляем поле 'parent_task_id' в таблицу tasks...")
            cursor.execute("ALTER TABLE tasks ADD COLUMN parent_task_id INTEGER")
            print("✓ Поле 'parent_task_id' добавлено")
        else:
            print("✓ Поле 'parent_task_id' уже существует")
        
        # Создаём таблицу task_comments
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='task_comments'
        """)
        if not cursor.fetchone():
            print("Создаём таблицу 'task_comments'...")
            cursor.execute("""
                CREATE TABLE task_comments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    content TEXT NOT NULL,
                    created_at DATETIME NOT NULL,
                    FOREIGN KEY (task_id) REFERENCES tasks(id),
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)
            print("✓ Таблица 'task_comments' создана")
        else:
            print("✓ Таблица 'task_comments' уже существует")
        
        # Создаём таблицу audit_logs
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='audit_logs'
        """)
        if not cursor.fetchone():
            print("Создаём таблицу 'audit_logs'...")
            cursor.execute("""
                CREATE TABLE audit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    action VARCHAR NOT NULL,
                    entity_type VARCHAR NOT NULL,
                    entity_id INTEGER,
                    details TEXT,
                    created_at DATETIME NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)
            cursor.execute("CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id)")
            cursor.execute("CREATE INDEX idx_audit_logs_action ON audit_logs(action)")
            cursor.execute("CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type)")
            cursor.execute("CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at)")
            print("✓ Таблица 'audit_logs' создана с индексами")
        else:
            print("✓ Таблица 'audit_logs' уже существует")
        
        conn.commit()
        print("\n✓ Миграция успешно завершена!")
        
    except sqlite3.Error as e:
        print(f"\n✗ Ошибка миграции: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("="*60)
    print("Миграция базы данных - Расширенные функции")
    print("="*60)
    migrate()
    print("="*60)

