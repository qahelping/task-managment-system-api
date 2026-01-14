# Postman Collection для Task Management System API

## 📑 Содержание

- [Настройка переменных окружения](#-настройка-переменных-окружения-в-postman)
- [Создание коллекции](#-создание-коллекции)
- [Сценарий тестирования](#-сценарий-тестирования-runner)
- [Импорт коллекции](#-импорт-коллекции)

## Настройка переменных окружения в Postman

Создайте Environment в Postman со следующими переменными:

| Переменная | Начальное значение | Описание |
|------------|-------------------|----------|
| `base_url` | `http://localhost:8000` | Базовый URL API |
| `token` | *(пусто)* | JWT токен (заполнится автоматически) |

## Создание коллекции

### 1. Authentication

#### 1.1. Register Admin

```
POST {{base_url}}/auth/register-admin
Content-Type: application/json

Body (JSON):
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123"
}

Tests (автоматическое сохранение токена):
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has token", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('access_token');
    pm.environment.set("token", jsonData.access_token);
});
```

#### 1.2. Login

```
POST {{base_url}}/auth/login
Content-Type: application/json

Body (JSON):
{
  "email": "admin@example.com",
  "password": "admin123"
}

Tests (автоматическое сохранение токена):
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has token", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('access_token');
    pm.environment.set("token", jsonData.access_token);
});
```

---

### 2. Health Check

#### 2.1. Health Check

```
GET {{base_url}}/health

Tests:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Status is ok", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("ok");
});
```

---

### 3. Users

**Важно**: Все запросы требуют заголовок `Authorization: Bearer {{token}}`

#### 3.1. Get All Users

```
GET {{base_url}}/users/
Authorization: Bearer {{token}}

Tests:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});
```

#### 3.2. Get User by ID

```
GET {{base_url}}/users/1
Authorization: Bearer {{token}}

Tests:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

---

### 4. Boards

**Важно**: Все запросы требуют заголовок `Authorization: Bearer {{token}}`

#### 4.1. Create Board

```
POST {{base_url}}/boards/
Authorization: Bearer {{token}}
Content-Type: application/json

Body (JSON):
{
  "title": "My First Board",
  "description": "This is a test board"
}

Tests (автоматическое сохранение board_id):
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Board created", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.environment.set("board_id", jsonData.id);
});
```

#### 4.2. Get All Boards

```
GET {{base_url}}/boards/
Authorization: Bearer {{token}}

Tests:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});
```

#### 4.3. Get Board by ID

```
GET {{base_url}}/boards/{{board_id}}
Authorization: Bearer {{token}}

Tests:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Board has tasks array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('tasks');
    pm.expect(jsonData.tasks).to.be.an('array');
});
```

#### 4.4. Update Board

```
PUT {{base_url}}/boards/{{board_id}}
Authorization: Bearer {{token}}
Content-Type: application/json

Body (JSON):
{
  "title": "Updated Board Title",
  "description": "Updated description"
}

Tests:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

#### 4.5. Delete Board

```
DELETE {{base_url}}/boards/{{board_id}}
Authorization: Bearer {{token}}

Tests:
pm.test("Status code is 204", function () {
    pm.response.to.have.status(204);
});
```

---

### 5. Tasks

**Важно**: Все запросы требуют заголовок `Authorization: Bearer {{token}}`

#### 5.1. Create Task

```
POST {{base_url}}/boards/{{board_id}}/tasks
Authorization: Bearer {{token}}
Content-Type: application/json

Body (JSON):
{
  "title": "My First Task",
  "description": "Task description",
  "status": "todo",
  "priority": "high"
}

Tests (автоматическое сохранение task_id):
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Task created", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.environment.set("task_id", jsonData.id);
});
```

#### 5.2. Get All Tasks

```
GET {{base_url}}/boards/{{board_id}}/tasks
Authorization: Bearer {{token}}

Tests:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});
```

#### 5.3. Get Tasks with Status Filter

```
GET {{base_url}}/boards/{{board_id}}/tasks?status=todo
Authorization: Bearer {{token}}

Tests:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("All tasks have status 'todo'", function () {
    var jsonData = pm.response.json();
    jsonData.forEach(function(task) {
        pm.expect(task.status).to.eql("todo");
    });
});
```

#### 5.4. Get Tasks with Priority Filter

```
GET {{base_url}}/boards/{{board_id}}/tasks?priority=high
Authorization: Bearer {{token}}

Tests:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("All tasks have priority 'high'", function () {
    var jsonData = pm.response.json();
    jsonData.forEach(function(task) {
        pm.expect(task.priority).to.eql("high");
    });
});
```

#### 5.5. Get Task by ID

```
GET {{base_url}}/boards/{{board_id}}/tasks/{{task_id}}
Authorization: Bearer {{token}}

Tests:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

#### 5.6. Update Task

```
PUT {{base_url}}/boards/{{board_id}}/tasks/{{task_id}}
Authorization: Bearer {{token}}
Content-Type: application/json

Body (JSON):
{
  "title": "Updated Task Title",
  "status": "in_progress",
  "priority": "medium"
}

Tests:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Task updated", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("in_progress");
});
```

#### 5.7. Delete Task

```
DELETE {{base_url}}/boards/{{board_id}}/tasks/{{task_id}}
Authorization: Bearer {{token}}

Tests:
pm.test("Status code is 204", function () {
    pm.response.to.have.status(204);
});
```

---

## Сценарий тестирования (Runner)

Рекомендуемый порядок выполнения запросов в Collection Runner:

1. **Health Check** - проверка работы API
2. **Register Admin** - создание первого администратора
3. **Login** - вход в систему
4. **Get All Users** - получение списка пользователей
5. **Create Board** - создание доски
6. **Get All Boards** - получение списка досок
7. **Get Board by ID** - получение конкретной доски
8. **Create Task** - создание задачи
9. **Get All Tasks** - получение списка задач
10. **Get Task by ID** - получение конкретной задачи
11. **Update Task** - обновление задачи
12. **Get Tasks with Filter** - тест фильтрации
13. **Update Board** - обновление доски
14. **Delete Task** - удаление задачи
15. **Delete Board** - удаление доски

## Импорт коллекции

Вы можете создать JSON файл коллекции Postman для импорта. Структура будет включать все вышеперечисленные запросы с автоматическим управлением переменными `token`, `board_id` и `task_id`.

## Переменные коллекции

Добавьте следующие переменные в Environment:

- `base_url`: `http://localhost:8000`
- `token`: (будет заполнена автоматически после логина)
- `board_id`: (будет заполнена автоматически после создания доски)
- `task_id`: (будет заполнена автоматически после создания задачи)

## Pre-request Scripts (Глобальные)

Для автоматической установки токена во все запросы, добавьте в Collection Pre-request Script:

```javascript
// Получаем токен из переменной окружения
const token = pm.environment.get("token");

// Если токен есть, устанавливаем заголовок
if (token) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + token
    });
}
```

---

**Примечание**: После выполнения запроса "Register Admin" или "Login", токен автоматически сохранится в переменную окружения `token` и будет использоваться во всех последующих запросах.

