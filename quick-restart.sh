#!/bin/bash
echo "🔄 Перезапуск проекта..."

# Проверяем запущен ли backend
if pgrep -f "uvicorn\|run.py" > /dev/null; then
    echo "⚠️  Backend уже запущен. Остановите его (Ctrl+C) и запустите заново."
else
    echo "✅ Backend не запущен"
fi

# Проверяем запущен ли frontend
if pgrep -f "vite\|node.*dev" > /dev/null; then
    echo "⚠️  Frontend уже запущен. Остановите его (Ctrl+C) и запустите заново."
else
    echo "✅ Frontend не запущен"
fi

echo ""
echo "📋 Инструкции:"
echo "1. Запустите Backend: python run.py"
echo "2. Запустите Frontend: cd frontend && npm run dev"
echo "3. Откройте: http://localhost:3000/automation-lab/index.html"
echo ""
echo "💡 Для очистки кэша браузера: Cmd+Shift+R (Mac) или Ctrl+Shift+R (Windows)"
