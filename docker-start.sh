#!/bin/bash

# Скрипт для быстрого запуска приложения в Docker

set -e

echo "🐳 Запуск Task Management System в Docker..."

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Проверка наличия Docker Compose
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose не установлен. Установите Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Создание директории для данных, если её нет
mkdir -p data

# Выбор режима запуска
MODE=${1:-prod}

if [ "$MODE" = "dev" ]; then
    echo "🔧 Запуск в режиме разработки..."
    docker compose -f docker-compose.dev.yml up --build
elif [ "$MODE" = "prod" ]; then
    echo "🚀 Запуск в продакшн режиме..."
    docker compose up -d --build
    echo ""
    echo "✅ Приложение запущено!"
    echo ""
    echo "📍 Доступные адреса:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
    echo ""
    echo "📋 Полезные команды:"
    echo "   Просмотр логов: docker compose logs -f"
    echo "   Остановка: docker compose down"
    echo "   Перезапуск: docker compose restart"
else
    echo "❌ Неизвестный режим: $MODE"
    echo "Использование: ./docker-start.sh [prod|dev]"
    exit 1
fi






