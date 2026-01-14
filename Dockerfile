# Dockerfile для бэкенда (FastAPI)
FROM python:3.11-alpine

# Установка рабочей директории
WORKDIR /app

# Установка системных зависимостей для Alpine
RUN apk add --no-cache \
    gcc \
    musl-dev \
    libffi-dev \
    curl \
    postgresql-dev \
    && rm -rf /var/cache/apk/*

# Копирование файла зависимостей
COPY requirements.txt .

# Установка Python зависимостей
RUN pip install --no-cache-dir -r requirements.txt

# Копирование всего кода приложения
COPY . .

# Скрипт fill_database.py уже включен в COPY . .

# Создание директории для базы данных (если используется SQLite)
RUN mkdir -p /app/data

# Открытие порта
EXPOSE 8000

# Команда запуска
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

