# 🔄 Инструкция по перезапуску проекта

## Для применения изменений в Web Automation Torture Lab

Запустите: ./dev-start.sh
Откройте: http://localhost:3000
Измените любой файл в frontend/src/ или app/

### Вариант 1: Локальный запуск (рекомендуется для разработки)

#### 1. Запустите Backend (FastAPI)

В корне проекта:

```bash
# Вариант A: Через run.py
python run.py

# Вариант B: Через uvicorn напрямую
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000



```

✅ Backend будет доступен на: http://localhost:8000

#### 2. Запустите Frontend (Vite dev server)

В папке `frontend/`:

```bash
cd frontend
npm run dev
```

✅ Frontend будет доступен на: http://localhost:3000

**Важно:** Файлы из `frontend/public/automation-lab/` автоматически доступны через Vite dev server по пути:
- http://localhost:3000/automation-lab/index.html
- http://localhost:3000/automation-lab/pages/clicks.html
- и т.д.

#### 3. Очистка кэша браузера (если изменения не видны)

Если изменения не отображаются:

1. **Жёсткая перезагрузка страницы:**
   - Mac: `Cmd + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`

2. **Очистить кэш браузера:**
   - Откройте DevTools (F12)
   - Правый клик на кнопке обновления → "Очистить кэш и жёсткая перезагрузка"

3. **Открыть в режиме инкогнито** для проверки без кэша

### Вариант 2: Docker Compose

Если используете Docker:

```bash
# Остановить контейнеры
docker-compose down

# Пересобрать и запустить
docker-compose up --build -d

# Просмотр логов
docker-compose logs -f frontend
```

✅ Frontend будет доступен на: http://localhost:3000

### Вариант 3: Production build (если нужно)

Если нужно собрать production версию:

```bash
cd frontend
npm run build
```

Затем файлы из `frontend/dist/` нужно обслуживать через веб-сервер (nginx, Apache и т.д.)

## 🔍 Проверка что всё работает

1. **Backend:** http://localhost:8000/health
2. **Frontend:** http://localhost:3000
3. **Automation Lab:** http://localhost:3000/automation-lab/index.html
4. **Страница регистрации:** http://localhost:3000/register (должна быть ссылка на лабораторию)

## ⚠️ Частые проблемы

### Изменения не видны
- Убедитесь что оба сервера запущены (backend + frontend)
- Очистите кэш браузера (Cmd+Shift+R)
- Проверьте консоль браузера на ошибки (F12)

### 404 ошибка при открытии automation-lab
- Убедитесь что файлы находятся в `frontend/public/automation-lab/`
- Проверьте что Vite dev server запущен
- Попробуйте открыть напрямую: http://localhost:3000/automation-lab/index.html

### Пути к assets не работают
- Убедитесь что в HTML файлах используются относительные пути: `../assets/styles.css`
- Проверьте структуру папок

## 📝 Быстрая команда для перезапуска всего

```bash
# Терминал 1: Backend
python run.py

# Терминал 2: Frontend  
cd frontend && npm run dev
```

Затем откройте: http://localhost:3000/automation-lab/index.html

