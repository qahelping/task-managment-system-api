#!/bin/bash
# Скрипт для очистки проекта от временных файлов

echo "🧹 Начинаем очистку проекта..."

# Удаление __pycache__
echo "📦 Удаление __pycache__..."
find . -type d -name "__pycache__" -exec rm -r {} + 2>/dev/null
find . -name "*.pyc" -delete 2>/dev/null
find . -name "*.pyo" -delete 2>/dev/null
echo "✅ Удалены __pycache__ и .pyc файлы"

# Удаление старых сборок
echo "📦 Удаление старых сборок..."
rm -rf frontend/dist 2>/dev/null
rm -rf frontend/build 2>/dev/null
echo "✅ Удалены старые сборки"

# Очистка логов
echo "📦 Удаление логов..."
find . -name "*.log" -not -path "./node_modules/*" -delete 2>/dev/null
echo "✅ Удалены логи"

# Очистка кэша pytest
echo "📦 Очистка кэша тестов..."
rm -rf .pytest_cache 2>/dev/null
rm -rf htmlcov 2>/dev/null
rm -rf .coverage 2>/dev/null
echo "✅ Очищен кэш тестов"

# Очистка кэша Vite
echo "📦 Очистка кэша Vite..."
rm -rf frontend/node_modules/.vite 2>/dev/null
echo "✅ Очищен кэш Vite"

echo ""
echo "✨ Очистка завершена!"
echo ""
echo "💡 Совет: Для полной очистки также можно удалить node_modules:"
echo "   rm -rf frontend/node_modules"
echo "   Затем переустановите: cd frontend && npm install"

