@echo off
REM Скрипт для очистки проекта от временных файлов (Windows)

echo 🧹 Начинаем очистку проекта...

REM Удаление __pycache__
echo 📦 Удаление __pycache__...
for /d /r . %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d"
del /s /q *.pyc 2>nul
del /s /q *.pyo 2>nul
echo ✅ Удалены __pycache__ и .pyc файлы

REM Удаление старых сборок
echo 📦 Удаление старых сборок...
if exist frontend\dist rmdir /s /q frontend\dist
if exist frontend\build rmdir /s /q frontend\build
echo ✅ Удалены старые сборки

REM Очистка логов
echo 📦 Удаление логов...
del /s /q *.log 2>nul
echo ✅ Удалены логи

REM Очистка кэша pytest
echo 📦 Очистка кэша тестов...
if exist .pytest_cache rmdir /s /q .pytest_cache
if exist htmlcov rmdir /s /q htmlcov
if exist .coverage del /q .coverage
echo ✅ Очищен кэш тестов

REM Очистка кэша Vite
echo 📦 Очистка кэша Vite...
if exist frontend\node_modules\.vite rmdir /s /q frontend\node_modules\.vite
echo ✅ Очищен кэш Vite

echo.
echo ✨ Очистка завершена!
echo.
echo 💡 Совет: Для полной очистки также можно удалить node_modules:
echo    rmdir /s /q frontend\node_modules
echo    Затем переустановите: cd frontend ^&^& npm install
pause

