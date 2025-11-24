# Примеры использования API

Полное руководство с примерами использования Task Management System API.

## 🔐 Аутентификация

### Регистрация первого администратора

```bash
curl -X POST http://localhost:8000/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Ответ**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Вход в систему

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Ответ**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## 👥 Пользователи

**Важно**: Все запросы требуют JWT токен в заголовке `Authorization: Bearer <token>`

### Получить всех пользователей

```bash
curl -X GET http://localhost:8000/users/ \
  -H "Authorization: Bearer <your_token>"
```

**Ответ**:
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "created_at": "2025-11-21T10:30:00"
  }
]
```

### Получить пользователя по ID

```bash
curl -X GET http://localhost:8000/users/1 \
  -H "Authorization: Bearer <your_token>"
```

**Ответ**:
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin",
  "created_at": "2025-11-21T10:30:00"
}
```

---

## 📋 Доски

### Создать доску

```bash
curl -X POST http://localhost:8000/boards/ \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Project Board",
    "description": "Board for tracking project tasks"
  }'
```

**Ответ**:
```json
{
  "id": 1,
  "title": "My Project Board",
  "description": "Board for tracking project tasks",
  "created_by": 1,
  "created_at": "2025-11-21T10:35:00"
}
```

### Получить все доски

```bash
curl -X GET http://localhost:8000/boards/ \
  -H "Authorization: Bearer <your_token>"
```

**Ответ**:
```json
[
  {
    "id": 1,
    "title": "My Project Board",
    "description": "Board for tracking project tasks",
    "created_by": 1,
    "created_at": "2025-11-21T10:35:00"
  },
  {
    "id": 2,
    "title": "Personal Tasks",
    "description": null,
    "created_by": 1,
    "created_at": "2025-11-21T10:40:00"
  }
]
```

### Получить доску с задачами

```bash
curl -X GET http://localhost:8000/boards/1 \
  -H "Authorization: Bearer <your_token>"
```

**Ответ**:
```json
{
  "id": 1,
  "title": "My Project Board",
  "description": "Board for tracking project tasks",
  "created_by": 1,
  "created_at": "2025-11-21T10:35:00",
  "tasks": [
    {
      "id": 1,
      "title": "Setup project",
      "description": "Initialize project structure",
      "status": "done",
      "priority": "high",
      "board_id": 1,
      "created_by": 1,
      "created_at": "2025-11-21T10:36:00",
      "updated_at": "2025-11-21T11:00:00"
    }
  ]
}
```

### Обновить доску

```bash
curl -X PUT http://localhost:8000/boards/1 \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Board Title",
    "description": "Updated description"
  }'
```

**Ответ**:
```json
{
  "id": 1,
  "title": "Updated Board Title",
  "description": "Updated description",
  "created_by": 1,
  "created_at": "2025-11-21T10:35:00"
}
```

### Удалить доску

```bash
curl -X DELETE http://localhost:8000/boards/1 \
  -H "Authorization: Bearer <your_token>"
```

**Ответ**: HTTP 204 No Content

---

## ✅ Задачи

### Создать задачу

```bash
curl -X POST http://localhost:8000/boards/1/tasks \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement user authentication",
    "description": "Add JWT authentication to API",
    "status": "todo",
    "priority": "high"
  }'
```

**Ответ**:
```json
{
  "id": 1,
  "title": "Implement user authentication",
  "description": "Add JWT authentication to API",
  "status": "todo",
  "priority": "high",
  "board_id": 1,
  "created_by": 1,
  "created_at": "2025-11-21T10:45:00",
  "updated_at": "2025-11-21T10:45:00"
}
```

### Получить все задачи доски

```bash
curl -X GET http://localhost:8000/boards/1/tasks \
  -H "Authorization: Bearer <your_token>"
```

**Ответ**:
```json
[
  {
    "id": 1,
    "title": "Implement user authentication",
    "description": "Add JWT authentication to API",
    "status": "todo",
    "priority": "high",
    "board_id": 1,
    "created_by": 1,
    "created_at": "2025-11-21T10:45:00",
    "updated_at": "2025-11-21T10:45:00"
  },
  {
    "id": 2,
    "title": "Write unit tests",
    "description": "Add tests for all endpoints",
    "status": "in_progress",
    "priority": "medium",
    "board_id": 1,
    "created_by": 1,
    "created_at": "2025-11-21T10:50:00",
    "updated_at": "2025-11-21T11:00:00"
  }
]
```

### Фильтрация задач по статусу

```bash
curl -X GET "http://localhost:8000/boards/1/tasks?status=todo" \
  -H "Authorization: Bearer <your_token>"
```

**Ответ**:
```json
[
  {
    "id": 1,
    "title": "Implement user authentication",
    "description": "Add JWT authentication to API",
    "status": "todo",
    "priority": "high",
    "board_id": 1,
    "created_by": 1,
    "created_at": "2025-11-21T10:45:00",
    "updated_at": "2025-11-21T10:45:00"
  }
]
```

### Фильтрация задач по приоритету

```bash
curl -X GET "http://localhost:8000/boards/1/tasks?priority=high" \
  -H "Authorization: Bearer <your_token>"
```

### Комбинированная фильтрация

```bash
curl -X GET "http://localhost:8000/boards/1/tasks?status=todo&priority=high" \
  -H "Authorization: Bearer <your_token>"
```

### Получить задачу по ID

```bash
curl -X GET http://localhost:8000/boards/1/tasks/1 \
  -H "Authorization: Bearer <your_token>"
```

**Ответ**:
```json
{
  "id": 1,
  "title": "Implement user authentication",
  "description": "Add JWT authentication to API",
  "status": "todo",
  "priority": "high",
  "board_id": 1,
  "created_by": 1,
  "created_at": "2025-11-21T10:45:00",
  "updated_at": "2025-11-21T10:45:00"
}
```

### Обновить задачу

```bash
curl -X PUT http://localhost:8000/boards/1/tasks/1 \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "priority": "high"
  }'
```

**Ответ**:
```json
{
  "id": 1,
  "title": "Implement user authentication",
  "description": "Add JWT authentication to API",
  "status": "in_progress",
  "priority": "high",
  "board_id": 1,
  "created_by": 1,
  "created_at": "2025-11-21T10:45:00",
  "updated_at": "2025-11-21T11:30:00"
}
```

### Удалить задачу

```bash
curl -X DELETE http://localhost:8000/boards/1/tasks/1 \
  -H "Authorization: Bearer <your_token>"
```

**Ответ**: HTTP 204 No Content

---

## 📊 Полный сценарий использования

### 1. Регистрация и вход

```bash
# Регистрация первого админа
TOKEN=$(curl -X POST http://localhost:8000/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "email": "admin@example.com", "password": "admin123"}' \
  | jq -r '.access_token')

echo "Token: $TOKEN"
```

### 2. Создание доски

```bash
BOARD_ID=$(curl -X POST http://localhost:8000/boards/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Sprint 1", "description": "First sprint tasks"}' \
  | jq -r '.id')

echo "Board ID: $BOARD_ID"
```

### 3. Создание нескольких задач

```bash
# Задача 1
curl -X POST http://localhost:8000/boards/$BOARD_ID/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Setup database",
    "status": "done",
    "priority": "high"
  }'

# Задача 2
curl -X POST http://localhost:8000/boards/$BOARD_ID/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement API",
    "status": "in_progress",
    "priority": "high"
  }'

# Задача 3
curl -X POST http://localhost:8000/boards/$BOARD_ID/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Write documentation",
    "status": "todo",
    "priority": "medium"
  }'
```

### 4. Получение всех задач

```bash
curl -X GET http://localhost:8000/boards/$BOARD_ID/tasks \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 5. Фильтрация активных задач

```bash
# Только незавершённые
curl -X GET "http://localhost:8000/boards/$BOARD_ID/tasks?status=todo" \
  -H "Authorization: Bearer $TOKEN" | jq

# Только высокий приоритет
curl -X GET "http://localhost:8000/boards/$BOARD_ID/tasks?priority=high" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 🔍 Проверка здоровья

```bash
curl -X GET http://localhost:8000/health
```

**Ответ**:
```json
{
  "status": "ok"
}
```

---

## ❌ Обработка ошибок

### Ошибка 401 - Не авторизован

```bash
curl -X GET http://localhost:8000/boards/
```

**Ответ**:
```json
{
  "detail": "Not authenticated"
}
```

### Ошибка 404 - Не найдено

```bash
curl -X GET http://localhost:8000/boards/9999 \
  -H "Authorization: Bearer $TOKEN"
```

**Ответ**:
```json
{
  "detail": "Board not found"
}
```

### Ошибка 400 - Некорректный запрос

```bash
curl -X POST http://localhost:8000/boards/$BOARD_ID/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "",
    "status": "invalid_status"
  }'
```

**Ответ**:
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "ensure this value has at least 1 characters",
      "type": "value_error.any_str.min_length"
    },
    {
      "loc": ["body", "status"],
      "msg": "string does not match regex pattern",
      "type": "value_error.str.regex"
    }
  ]
}
```

---

## 💡 Советы

### Сохранение токена в переменную

**Bash/Linux/macOS**:
```bash
export TOKEN="your_token_here"
curl -X GET http://localhost:8000/boards/ -H "Authorization: Bearer $TOKEN"
```

**PowerShell (Windows)**:
```powershell
$TOKEN = "your_token_here"
curl -X GET http://localhost:8000/boards/ -H "Authorization: Bearer $TOKEN"
```

### Форматирование вывода с jq

```bash
curl -X GET http://localhost:8000/boards/ \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### Сохранение ответа в файл

```bash
curl -X GET http://localhost:8000/boards/ \
  -H "Authorization: Bearer $TOKEN" \
  -o boards.json
```

---

**Документация**: Полная интерактивная документация доступна по адресу http://localhost:8000/docs

