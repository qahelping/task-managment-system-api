#!/bin/bash

echo "=========================================="
echo "Автоматический запуск тестов"
echo "=========================================="
echo ""

# Останавливаем старый сервер
echo "1. Останавливаем старый сервер..."
pkill -f "uvicorn app.main:app" 2>/dev/null
sleep 1

# Очищаем БД
echo "2. Очищаем базу данных..."
rm -f test.db app.db task_management.db
echo "   ✓ БД очищена"

# Запускаем сервер
echo "3. Запускаем сервер..."
python run.py &
SERVER_PID=$!
echo "   Сервер запущен (PID: $SERVER_PID)"

# Ждём запуска сервера
echo "4. Ожидание запуска сервера (5 сек)..."
sleep 5

# Проверяем что сервер запустился
echo "5. Проверка сервера..."
if curl -s http://127.0.0.1:8000/health > /dev/null 2>&1; then
    echo "   ✓ Сервер работает"
else
    echo "   ✗ Сервер не отвечает!"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo ""
echo "=========================================="
echo "Запуск тестов..."
echo "=========================================="
echo ""

# Запускаем тесты
pytest tests/ -v -s

TEST_EXIT_CODE=$?

echo ""
echo "=========================================="
echo "Завершение..."
echo "=========================================="

# Останавливаем сервер
echo "Останавливаем сервер..."
kill $SERVER_PID 2>/dev/null
sleep 1
pkill -f "uvicorn app.main:app" 2>/dev/null

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✓ Все тесты прошли успешно!"
else
    echo "✗ Некоторые тесты упали"
fi

exit $TEST_EXIT_CODE

