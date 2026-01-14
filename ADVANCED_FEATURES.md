# Расширенные функции API

Документация по всем новым эндпоинтам и функциям.

## 📑 Содержание

- [Управление участниками досок](#1-управление-участниками-досок)
- [Архивация досок](#2-архивация-досок)
- [Операции с задачами](#3-операции-с-задачами)
- [Поиск](#4-поиск)
- [Статистика и аналитика](#5-статистика-и-аналитика)
- [Пользователи](#6-пользователи)
- [Логи аудита](#7-логи-аудита)
- [Аватары](#8-аватары)

---

## 1. Управление участниками досок

### 1.1. Добавление участника на доску

```bash
POST /boards/{board_id}/members/{user_id}
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "message": "User added to board"
}
```

### 1.2. Удаление участника с доски

```bash
DELETE /boards/{board_id}/members/{user_id}
Authorization: Bearer <token>
```

**Ответ:** `204 No Content`

### 1.3. Получение списка участников доски

```bash
GET /boards/{board_id}/members
Authorization: Bearer <token>
```

**Ответ:**
```json
[
  {"id": 1, "username": "john", "email": "john@ex.com"},
  {"id": 2, "username": "kate", "email": "kate@ex.com"}
]
```

---

## 2. Архивация досок

### 2.1. Архивировать доску

```bash
PUT /boards/{board_id}/archive
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "id": 1,
  "title": "Archived Board",
  "archived": true,
  ...
}
```

### 2.2. Получить архив досок

```bash
GET /boards?archived=true
Authorization: Bearer <token>
```

**Ответ:** Список архивированных досок

---

## 3. Операции с задачами

### 3.1. Перенос задачи на другую доску

```bash
PUT /boards/{board_id}/tasks/{task_id}/move-to/{target_board_id}
Authorization: Bearer <token>
```

**Ответ:** Обновлённая задача с новым `board_id`

### 3.2. Изменение статуса задачи

```bash
PUT /tasks/{task_id}/status/{new_status}
Authorization: Bearer <token>
```

**Параметры:** `new_status` может быть: `todo`, `in_progress`, `done`

### 3.3. Следующий статус (автоматический переход)

```bash
PUT /tasks/{task_id}/next-status
Authorization: Bearer <token>
```

**Логика:**
- `todo` → `in_progress`
- `in_progress` → `done`
- `done` → `done` (остаётся)

### 3.4. Изменение приоритета

```bash
PUT /tasks/{task_id}/priority/{new_priority}
Authorization: Bearer <token>
```

**Параметры:** `new_priority` может быть: `low`, `medium`, `high`

### 3.5. Поиск задач по тексту

```bash
GET /tasks/search?q=login
Authorization: Bearer <token>
```

**Поиск:** По полям `title` и `description`

### 3.6. Массовое изменение статуса

```bash
PUT /boards/{board_id}/tasks/bulk/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "task_ids": [1, 2, 3],
  "new_status": "done"
}
```

**Ответ:**
```json
{
  "updated": 3,
  "message": "Updated 3 tasks to status 'done'"
}
```

### 3.7. Массовое удаление задач

```bash
POST /boards/{board_id}/tasks/bulk/delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "task_ids": [1, 2, 3]
}
```

**Ответ:**
```json
{
  "deleted": 3,
  "message": "Deleted 3 tasks"
}
```

**Примечание:** Используется POST вместо DELETE, так как FastAPI не поддерживает body в DELETE запросах по умолчанию.

### 3.8. Изменение порядка задач

```bash
PUT /boards/{board_id}/tasks/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "ordered_ids": [5, 2, 3, 1, 4]
}
```

**Ответ:**
```json
{
  "message": "Tasks reordered successfully"
}
```

---

## 4. Поиск

### 4.1. Глобальный поиск

```bash
GET /search?q=backend
Authorization: Bearer <token>
```

**Ищет:**
- Доски (по `title` и `description`)
- Задачи (по `title` и `description`)
- Пользователей (по `username`)

**Ответ:**
```json
{
  "boards": [
    {"id": 1, "title": "Backend Board", "description": "..."}
  ],
  "tasks": [
    {"id": 1, "title": "Backend Task", "board_id": 1}
  ],
  "users": [
    {"id": 1, "username": "backend_dev", "email": "..."}
  ]
}
```

---

## 5. Статистика и аналитика

### 5.1. Статистика по доске

```bash
GET /boards/{board_id}/stats
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "total": 15,
  "todo": 7,
  "in_progress": 4,
  "done": 4
}
```

### 5.2. Глобальная статистика по задачам

```bash
GET /stats/tasks
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "boards": 3,
  "tasks_total": 62,
  "done": 20
}
```

### 5.3. Активность пользователя

```bash
GET /stats/users/{user_id}/activity
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "created_tasks": 10,
  "updated_tasks": 22,
  "boards_created": 2
}
```

---

## 6. Пользователи

### 6.1. Обновить пароль

```bash
PUT /users/{user_id}/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "new_password": "newpassword123"
}
```

**Ответ:**
```json
{
  "message": "Password updated successfully"
}
```

**Примечание:** Пользователь может обновить только свой пароль.

### 6.2. Получить свои задачи

```bash
GET /users/me/tasks
Authorization: Bearer <token>
```

**Ответ:** Список всех задач, созданных текущим пользователем

---

## 7. Логи аудита

### 7.1. Получить логи

```bash
GET /logs?user_id=1&action=create&entity=task
Authorization: Bearer <token>
```

**Параметры:**
- `user_id` (опционально) - фильтр по пользователю
- `action` (опционально) - фильтр по действию (`create`, `update`, `delete`, `login`)
- `entity` (опционально) - фильтр по типу сущности (`board`, `task`, `user`)

**Ответ:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "action": "create",
    "entity_type": "task",
    "entity_id": 5,
    "details": null,
    "created_at": "2025-11-21T10:00:00"
  }
]
```

---

## 8. Аватары

### 8.1. Обновить аватар

```bash
PUT /users/{user_id}/avatar
Authorization: Bearer <token>
Content-Type: application/json

{
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Ответ:**
```json
{
  "message": "Avatar updated successfully",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

### 8.2. Получить аватар пользователя

```bash
GET /users/{user_id}/avatar
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "user_id": 1,
  "avatar_url": "https://example.com/avatar.jpg"
}
```

---

## 🧪 Тестирование

Все новые функции покрыты тестами в файле `tests/test_advanced_features.py`.

Запуск тестов:
```bash
pytest tests/test_advanced_features.py -v -s
```

---

## 📝 Примечания

1. **Авторизация:** Все эндпоинты требуют JWT токен в заголовке `Authorization: Bearer <token>`

2. **Права доступа:**
   - Только владелец доски или администратор может добавлять/удалять участников
   - Только владелец доски или администратор может архивировать доску
   - Пользователь может обновлять только свой пароль и аватар

3. **Миграция БД:** Перед использованием новых функций выполните:
   ```bash
   python migrate_advanced_features.py
   ```

4. **Логирование:** Действия пользователей автоматически логируются в таблицу `audit_logs`

---

## 🔗 Связанные документы

- [README.md](README.md) - Основная документация
- [GUEST_ACCESS.md](GUEST_ACCESS.md) - Гостевой доступ
- [EXAMPLES.md](EXAMPLES.md) - Примеры использования

