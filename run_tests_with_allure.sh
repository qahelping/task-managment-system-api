#!/bin/bash

echo "=========================================="
echo "Запуск тестов с Allure отчетностью"
echo "=========================================="
echo ""

# Очищаем старые результаты
echo "1. Очистка старых результатов Allure..."
rm -rf allure-results allure-report
mkdir -p allure-results

# Запускаем тесты
echo "2. Запуск тестов..."
pytest tests/ -v -s --alluredir=allure-results

TEST_EXIT_CODE=$?

echo ""
echo "=========================================="
echo "Генерация Allure отчета..."
echo "=========================================="

# Генерируем отчет
if command -v allure &> /dev/null; then
    allure generate allure-results -o allure-report --clean
    echo ""
    echo "✓ Отчет сгенерирован в allure-report/"
    echo ""
    echo "Откройте отчет:"
    echo "  allure open allure-report"
    echo ""
    echo "Или используйте интерактивный режим:"
    echo "  allure serve allure-results"
else
    echo "⚠ Allure CLI не установлен"
    echo "Установите: brew install allure (macOS) или скачайте с https://github.com/allure-framework/allure2/releases"
    echo ""
    echo "Результаты сохранены в allure-results/"
fi

exit $TEST_EXIT_CODE

