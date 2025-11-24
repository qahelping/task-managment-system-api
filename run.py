"""
Скрипт для запуска сервера.
Упрощённый способ запуска приложения.
"""
import uvicorn

if __name__ == "__main__":
    print("🚀 Запуск Task Management System API...")
    print("📖 Документация: http://localhost:8000/docs")
    print("🔍 ReDoc: http://localhost:8000/redoc")
    print("💚 Health Check: http://localhost:8000/health")
    print("\n⏸️  Для остановки нажмите Ctrl+C\n")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

