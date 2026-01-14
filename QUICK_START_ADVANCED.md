# Быстрый старт - Расширенные функции

## 📑 Содержание

- [Установка и миграция](#-установка-и-миграция)
- [Примеры использования](#-примеры-использования)
- [Полная документация](#-полная-документация)

## 🚀 Установка и миграция

### 1. Выполните миграцию БД

```bash
python migrate_advanced_features.py
```

Это добавит:
- Поле `archived` в таблицу `boards`
- Поле `avatar_url` в таблицу `users`
- Поля `order` и `parent_task_id` в таблицу `tasks`
- Таблицы `task_comments` и `audit_logs`

### 2. Запустите сервер

```bash
python run.py
```

### 3. Запустите тесты

```bash
# Все тесты расширенных функций
pytest tests/test_advanced_features.py -v -s

# Все тесты
pytest tests/ -v -s
```

## 📋 Примеры использования

### Добавить участника на доску

```bash
curl -X POST http://localhost:8000/boards/1/members/2 \
  -H "Authorization: Bearer <token>"
```

### Архивировать доску

```bash
curl -X PUT http://localhost:8000/boards/1/archive \
  -H "Authorization: Bearer <token>"
```

### Перенести задачу

```bash
curl -X PUT http://localhost:8000/boards/1/tasks/5/move-to/2 \
  -H "Authorization: Bearer <token>"
```

### Изменить статус на следующий

```bash
curl -X PUT http://localhost:8000/tasks/5/next-status \
  -H "Authorization: Bearer <token>"
```

### Массовое изменение статуса

```bash
curl -X PUT http://localhost:8000/boards/1/tasks/bulk/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"task_ids": [1, 2, 3], "new_status": "done"}'
```

### Поиск задач

```bash
curl http://localhost:8000/tasks/search?q=login \
  -H "Authorization: Bearer <token>"
```

### Глобальный поиск

```bash
curl http://localhost:8000/search?q=backend \
  -H "Authorization: Bearer <token>"
```

### Статистика по доске

```bash
curl http://localhost:8000/boards/1/stats \
  -H "Authorization: Bearer <token>"
```

### Обновить пароль

```bash
curl -X PUT http://localhost:8000/users/1/password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"new_password": "newpassword123"}'
```

### Обновить аватар

```bash
curl -X PUT http://localhost:8000/users/1/avatar \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"avatar_url": "https://example.com/avatar.jpg"}'
```

## 📚 Полная документация

См. [ADVANCED_FEATURES.md](ADVANCED_FEATURES.md) для полного списка всех эндпоинтов.

