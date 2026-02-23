#!/usr/bin/env python3
"""
Миграция для добавления колонки assignee_id в таблицу tasks.
"""
import sqlite3
import sys
import os

# Путь к базе данных
DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'app.db')

def migrate():
    """Добавить колонку assignee_id в таблицу tasks"""
    if not os.path.exists(DB_PATH):
        print(f"База данных не найдена: {DB_PATH}")
        print("База данных будет создана автоматически при следующем запуске приложения.")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Проверяем, существует ли колонка assignee_id
        cursor.execute("PRAGMA table_info(tasks)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'assignee_id' in columns:
            print("Колонка assignee_id уже существует в таблице tasks.")
            return
        
        # Добавляем колонку assignee_id
        print("Добавление колонки assignee_id в таблицу tasks...")
        cursor.execute("""
            ALTER TABLE tasks 
            ADD COLUMN assignee_id INTEGER 
            REFERENCES users(id)
        """)
        
        conn.commit()
        print("✓ Колонка assignee_id успешно добавлена в таблицу tasks.")
        
        # Обновляем существующие задачи: назначаем создателя доски как assignee
        print("Обновление существующих задач...")
        cursor.execute("""
            UPDATE tasks
            SET assignee_id = (
                SELECT boards.created_by
                FROM boards
                WHERE boards.id = tasks.board_id
            )
            WHERE assignee_id IS NULL
        """)
        
        conn.commit()
        print(f"✓ Обновлено {cursor.rowcount} задач.")
        
    except sqlite3.Error as e:
        conn.rollback()
        print(f"❌ Ошибка при выполнении миграции: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
