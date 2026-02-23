# Task Management System API

Учебный REST API сервис для управления досками и задачами (аналог Trello).

## 📑 Содержание

- [Описание проекта](#-описание-проекта)
- [Технологический стек](#-технологический-стек)
- [Быстрый старт](#-быстрый-старт)
- [Установка и запуск](#-установка-и-запуск)
- [Запуск с Docker](#-запуск-с-docker)
- [Модель данных](#-модель-данных)
- [Аутентификация](#-аутентификация)
- [API Endpoints](#-api-endpoints)
- [Тестирование](#-тестирование)
- [Troubleshooting](#-troubleshooting)

## 📋 Описание проекта

Это полнофункциональный учебный проект для управления досками и задачами (аналог Trello), состоящий из REST API (FastAPI) и веб-интерфейса (React). Проект реализует:

- Работы с REST API
- Работы с реляционной БД (SQLite)
- Использования ORM (SQLAlchemy 2.0)
- Аутентификации и авторизации (JWT)
- Создания HTTP эндпоинтов
- Написания API-тестов (pytest)
- Работы с Pydantic-схемами и валидацией
- Лаборатория для работы с элементами (automation-lab)
## 🛠 Технологический стек

### Backend
- **Python** 3.10+
- **FastAPI** - основной фреймворк
- **SQLAlchemy 2.0** - ORM
- **Pydantic v2** - валидация и схемы
- **Passlib (bcrypt)** - хэширование паролей
- **PyJWT** - работа с JWT токенами

### Frontend
- **React** - UI библиотека
- **TypeScript** - типизация
- **Vite** - сборщик
- **Zustand** - управление состоянием

### База данных
- **SQLite** - локальная база данных (файл `app.db`)

## 🚀 Быстрый старт

```bash
# 1. Установить зависимости
pip install -r requirements.txt

# 2. Создать .env файл (см. раздел ниже)
# 3. Запустить сервер
uvicorn app.main:app --reload
```

Откройте http://localhost:8000/docs для интерактивной документации.

## 🚀 Установка и запуск

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd task-managment-system-api
```

### 2. Создание виртуального окружения

```bash
python -m venv venv

# Активация на macOS/Linux:
source venv/bin/activate

# Активация на Windows:
venv\Scripts\activate
```

### 3. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 4. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
DATABASE_URL=sqlite:///./app.db
JWT_SECRET=your-secret-key-change-in-production-min-32-chars
JWT_EXPIRE_MINUTES=1440
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
AUTO_FILL_DB=true
```

⚠️ **Важно**: Измените `JWT_SECRET` на свой уникальный ключ длиной минимум 32 символа.

### 5. Запуск сервера

```bash
uvicorn app.main:app --reload
```

Сервер будет доступен по адресу: `http://localhost:8000`

### 6. Доступ к документации

После запуска сервера документация будет доступна по следующим адресам:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 🐳 Запуск с Docker

Для быстрого запуска всего приложения (бэкенд + фронтенд) используйте Docker Compose.

### Быстрый старт

```bash
# Запуск в продакшн режиме
docker-compose up -d --build

# Или через скрипт
./docker-start.sh prod
```

После запуска:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Режим разработки

```bash
# Запуск с hot-reload
./docker-start.sh dev

# Или вручную
docker-compose -f docker-compose.dev.yml up --build
```

### Управление контейнерами

```bash
# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Выполнение команды в контейнере
docker-compose exec backend python fill_database.py
```

## 📊 Модель данных

### Таблицы

#### 1. users (Пользователи)
| Поле | Тип | Описание |
|------|-----|----------|
| id | Integer | Primary Key |
| username | String | Уникальное имя пользователя |
| email | String | Уникальный email |
| password_hash | String | Хэш пароля |
| role | String | Роль (admin, user, guest) |
| created_at | DateTime | Дата создания |

#### 2. boards (Доски)
| Поле | Тип | Описание |
|------|-----|----------|
| id | Integer | Primary Key |
| title | String | Название доски |
| description | Text | Описание (опционально) |
| public | Boolean | Публичная доска |
| archived | Boolean | Архивная доска |
| created_by | Integer | FK → users.id |
| created_at | DateTime | Дата создания |

#### 3. tasks (Задачи)
| Поле | Тип | Описание |
|------|-----|----------|
| id | Integer | Primary Key |
| title | String | Название задачи |
| description | Text | Описание (опционально) |
| status | String | Статус: todo, in_progress, done |
| priority | String | Приоритет: low, medium, high |
| order | Integer | Порядок сортировки |
| board_id | Integer | FK → boards.id |
| created_by | Integer | FK → users.id |
| created_at | DateTime | Дата создания |
| updated_at | DateTime | Дата обновления |

#### 4. board_members (Участники досок)
| Поле | Тип | Описание |
|------|-----|----------|
| id | Integer | Primary Key |
| board_id | Integer | FK → boards.id |
| user_id | Integer | FK → users.id |

## 🔐 Аутентификация

Система использует JWT токены для аутентификации.

### Регистрация первого администратора

```bash
POST /auth/register-admin
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Важно**: Регистрация доступна только если в системе нет ни одного пользователя.

### Вход в систему

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Ответ:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Использование токена

Для доступа к защищённым эндпоинтам добавьте заголовок:

```
Authorization: Bearer <ваш_токен>
```

## 📚 API Endpoints

### Health Check

#### `GET /health`
Проверка работоспособности API.

**Ответ**: `{"status": "ok"}`

---

### Аутентификация

#### `POST /auth/register-admin`
Регистрация первого администратора (только если нет пользователей).

#### `POST /auth/login`
Вход в систему, получение JWT токена.

---

### Пользователи

Все эндпоинты требуют аутентификации.

#### `GET /users/`
Получить список всех пользователей.

**Query параметры**:
- `skip` (int, default=0) - количество пропущенных записей
- `limit` (int, default=100) - максимальное количество записей

#### `GET /users/{user_id}`
Получить пользователя по ID.

---

### Доски

Все эндпоинты требуют аутентификации.

#### `GET /boards/`
Получить список всех досок.

**Query параметры**:
- `skip` (int, default=0)
- `limit` (int, default=100)
- `public` (bool) - фильтр по публичным доскам

#### `POST /boards/`
Создать новую доску.

**Body**:
```json
{
  "title": "Название доски",
  "description": "Описание доски (опционально)",
  "public": false
}
```

#### `GET /boards/{board_id}`
Получить доску по ID (включая задачи).

#### `PUT /boards/{board_id}`
Обновить доску.

**Body**:
```json
{
  "title": "Новое название",
  "description": "Новое описание",
  "public": true
}
```

#### `DELETE /boards/{board_id}`
Удалить доску (также удаляются все задачи).

---

### Задачи

Все эндпоинты требуют аутентификации.

#### `GET /boards/{board_id}/tasks`
Получить список задач на доске.

**Query параметры**:
- `status` (string) - фильтр по статусу (todo, in_progress, done)
- `priority` (string) - фильтр по приоритету (low, medium, high)
- `skip` (int, default=0)
- `limit` (int, default=100)

#### `POST /boards/{board_id}/tasks`
Создать новую задачу.

**Body**:
```json
{
  "title": "Название задачи",
  "description": "Описание (опционально)",
  "status": "todo",
  "priority": "medium"
}
```

#### `GET /boards/{board_id}/tasks/{task_id}`
Получить задачу по ID.

#### `PUT /boards/{board_id}/tasks/{task_id}`
Обновить задачу.

**Body**:
```json
{
  "title": "Новое название",
  "status": "in_progress",
  "priority": "high"
}
```

#### `DELETE /boards/{board_id}/tasks/{task_id}`
Удалить задачу.

---

## 🧪 Тестирование

### Запуск всех тестов

```bash
pytest
```

### Запуск с подробным выводом

```bash
pytest -v
```

### Запуск конкретного файла тестов

```bash
pytest tests/test_auth.py
pytest tests/test_boards.py
pytest tests/test_tasks.py
```

### Запуск с покрытием кода

```bash
pytest --cov=app --cov-report=html
```

## 📝 Заполнение базы данных тестовыми данными

Для быстрого заполнения базы данных валидными тестовыми данными используйте скрипт:

```bash
# Локально
python fill_database.py

# Или в Docker
docker-compose exec backend python fill_database.py
```

Скрипт создаст:
- 8 пользователей (администраторы, пользователи, гости)
- 8 досок (публичные и приватные, архивные и активные)
- ~50-80 задач со всеми статусами и приоритетами
- Участников досок, комментарии и логи аудита

## 🔧 Переменные окружения

| Переменная | Описание | Значение по умолчанию |
|------------|----------|----------------------|
| `DATABASE_URL` | Путь к базе данных SQLite | `sqlite:///./app.db` |
| `JWT_SECRET` | Секретный ключ для JWT | *(обязательно)* |
| `JWT_EXPIRE_MINUTES` | Срок жизни токена (минуты) | `1440` (24 часа) |
| `ADMIN_EMAIL` | Email первого админа (опц.) | `admin@example.com` |
| `ADMIN_PASSWORD` | Пароль первого админа (опц.) | `admin123` |
| `AUTO_FILL_DB` | Автоматическое заполнение БД при запуске | `true` |

## 🐛 Troubleshooting

### Ошибка: "No module named 'app'"

Убедитесь, что вы запускаете сервер из корня проекта:
```bash
cd task-managment-system-api
uvicorn app.main:app --reload
```

### Ошибка: "JWT_SECRET is required"

Создайте файл `.env` с переменной `JWT_SECRET`.

### База данных не создаётся

База данных создаётся автоматически при первом запуске. Проверьте наличие файла `app.db` в корне проекта (или `data/app.db` при использовании Docker).

### Тесты не запускаются

Убедитесь, что pytest установлен:
```bash
pip install pytest pytest-asyncio httpx
```

### Проблемы с Docker на Windows

Если возникают проблемы при работе с Docker на Windows, см. файл `РЕШЕНИЕ_ПРОБЛЕМ_WINDOWS.md` (если существует) или проверьте:
- Кодировку файлов (должна быть UTF-8 без BOM)
- Окончания строк (LF вместо CRLF)
- Настройки Docker Desktop

## 📚 Дополнительная документация

- **[START.md](./START.md)** - Быстрый старт и основные команды
- **[ИНСТРУКЦИЯ_ДЛЯ_СТУДЕНТОВ.md](./ИНСТРУКЦИЯ_ДЛЯ_СТУДЕНТОВ.md)** - Подробная инструкция по развертыванию
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Структура проекта
- **[ЗАДАЧИ_ФИЧИ.md](./ЗАДАЧИ_ФИЧИ.md)** - Задачи для бизнес-аналитиков
- **[GITHUB_PAGES_DEPLOY.md](./GITHUB_PAGES_DEPLOY.md)** - Инструкция по развертыванию frontend на GitHub Pages

## 📖 Дополнительные ресурсы

- [Документация FastAPI](https://fastapi.tiangolo.com/)
- [Документация SQLAlchemy](https://docs.sqlalchemy.org/)
- [Документация Pydantic](https://docs.pydantic.dev/)
- [Документация pytest](https://docs.pytest.org/)

## 📄 Лицензия

Этот проект создан в учебных целях и распространяется свободно.

---

**Примечание**: Это учебный проект. Не используйте его в продакшене без дополнительных мер безопасности и оптимизации.
