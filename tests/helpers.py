"""
Вспомогательные функции для тестов.
"""
import requests
import time
from tests.conftest import BASE_URL, TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD


# Глобальная переменная для хранения токена админа
_admin_token = None
# Счётчик для создания уникальных пользователей
_user_counter = 0


def register_admin(email=TEST_ADMIN_EMAIL, password=TEST_ADMIN_PASSWORD):
    """Регистрация администратора"""
    username = email.split("@")[0]
    
    url = f"{BASE_URL}/auth/register-admin"
    payload = {
        "username": username,
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"\n[Register Admin] Status: {response.status_code}")
        if response.status_code not in [201, 403]:
            print(f"[Register Admin] Response: {response.text}")
        return response
    except requests.exceptions.RequestException as e:
        print(f"\n[Register Admin] ERROR: {e}")
        print(f"[Register Admin] Убедитесь что сервер запущен: python run.py")
        raise


def register_user(username=None, email=None, password="user123"):
    """Регистрация обычного пользователя"""
    global _user_counter
    _user_counter += 1
    
    if email is None:
        timestamp = str(time.time()).replace(".", "")
        email = f"user{_user_counter}_{timestamp}@example.com"
    if username is None:
        username = email.split("@")[0]
    
    url = f"{BASE_URL}/auth/register"
    payload = {
        "username": username,
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"\n[Register User] Status: {response.status_code}, Email: {email}")
        if response.status_code != 201:
            print(f"[Register User] Response: {response.text}")
        return response
    except requests.exceptions.RequestException as e:
        print(f"\n[Register User] ERROR: {e}")
        raise


def register_guest(username=None, email=None, password="guest123"):
    """Регистрация гостя (пользователя с ограниченными правами)"""
    global _user_counter
    _user_counter += 1
    
    if email is None:
        timestamp = str(time.time()).replace(".", "")
        email = f"guest{_user_counter}_{timestamp}@example.com"
    if username is None:
        username = email.split("@")[0]
    
    url = f"{BASE_URL}/auth/register-guest"
    payload = {
        "username": username,
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"\n[Register Guest] Status: {response.status_code}, Email: {email}")
        if response.status_code != 201:
            print(f"[Register Guest] Response: {response.text}")
        return response
    except requests.exceptions.RequestException as e:
        print(f"\n[Register Guest] ERROR: {e}")
        raise


def login_user(email, password):
    """Вход пользователя"""
    url = f"{BASE_URL}/auth/login"
    payload = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"\n[Login User] Status: {response.status_code}")
        if response.status_code != 200:
            print(f"[Login User] Response: {response.text}")
        return response
    except requests.exceptions.RequestException as e:
        print(f"\n[Login User] ERROR: {e}")
        raise


def get_admin_token():
    """
    Получение токена администратора.
    Использует кэшированный токен или создаёт нового админа.
    """
    global _admin_token
    
    # Если токен уже есть - возвращаем его
    if _admin_token:
        print(f"\n[Get Admin Token] Используем кэшированный токен")
        return _admin_token
    
    print(f"\n[Get Admin Token] Получаем новый токен...")
    
    try:
        # Проверяем что сервер доступен
        health_check = requests.get(f"{BASE_URL}/health", timeout=5)
        if health_check.status_code != 200:
            print(f"[Get Admin Token] WARNING: Health check failed")
            return None
    except requests.exceptions.RequestException as e:
        print(f"\n[Get Admin Token] ОШИБКА: Сервер недоступен!")
        print(f"[Get Admin Token] Убедитесь что сервер запущен: python run.py")
        return None
    
    # Пробуем зарегистрировать админа
    response = register_admin()
    
    if response.status_code == 201:
        token = response.json().get("access_token")
        if token:
            _admin_token = token
            print(f"[Get Admin Token] ✓ Админ зарегистрирован, токен получен")
            return token
    elif response.status_code == 403:
        # Админ уже существует, логинимся
        print(f"[Get Admin Token] Админ существует, логинимся...")
        print(f"[Get Admin Token] Email: {TEST_ADMIN_EMAIL}, Password: {TEST_ADMIN_PASSWORD}")
        login_response = login_user(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD)
        print(f"[Get Admin Token] Login status: {login_response.status_code}")
        if login_response.status_code == 200:
            token = login_response.json().get("access_token")
            if token:
                _admin_token = token
                print(f"[Get Admin Token] ✓ Залогинились, токен получен")
                return token
        else:
            print(f"[Get Admin Token] ERROR: Логин не удался: {login_response.status_code}")
            print(f"[Get Admin Token] Response: {login_response.text}")
            print(f"[Get Admin Token] Возможно админ был создан с другим паролем")
            print(f"[Get Admin Token] РЕШЕНИЕ: Остановите сервер, удалите БД (rm *.db) и запустите заново")
            # В этом случае возвращаем None - тест должен упасть с понятным сообщением
    
    print(f"[Get Admin Token] ERROR: Не удалось получить токен")
    print(f"[Get Admin Token] Register status: {response.status_code}")
    if response.status_code != 201:
        try:
            print(f"[Get Admin Token] Register response: {response.text}")
        except:
            pass
    return None


def get_user_token():
    """
    Получение токена обычного пользователя.
    Создаёт нового пользователя для каждого вызова.
    """
    print(f"\n[Get User Token] Регистрация нового пользователя...")
    
    try:
        # Проверяем что сервер доступен
        health_check = requests.get(f"{BASE_URL}/health", timeout=5)
        if health_check.status_code != 200:
            print(f"[Get User Token] WARNING: Health check failed")
            return None
    except requests.exceptions.RequestException as e:
        print(f"\n[Get User Token] ОШИБКА: Сервер недоступен!")
        return None
    
    # Регистрируем нового пользователя
    response = register_user()
    
    if response.status_code == 201:
        token = response.json().get("access_token")
        if token:
            print(f"[Get User Token] ✓ Пользователь зарегистрирован, токен получен")
            return token
    
    print(f"[Get User Token] ERROR: Не удалось получить токен")
    print(f"[Get User Token] Status: {response.status_code}")
    print(f"[Get User Token] Response: {response.text}")
    return None


def get_guest_token():
    """
    Получение токена гостя.
    Создаёт нового гостя для каждого вызова.
    """
    print(f"\n[Get Guest Token] Регистрация нового гостя...")
    
    try:
        # Проверяем что сервер доступен
        health_check = requests.get(f"{BASE_URL}/health", timeout=5)
        if health_check.status_code != 200:
            print(f"[Get Guest Token] WARNING: Health check failed")
            return None
    except requests.exceptions.RequestException as e:
        print(f"\n[Get Guest Token] ОШИБКА: Сервер недоступен!")
        return None
    
    # Регистрируем нового гостя
    response = register_guest()
    
    if response.status_code == 201:
        token = response.json().get("access_token")
        if token:
            print(f"[Get Guest Token] ✓ Гость зарегистрирован, токен получен")
            return token
    
    print(f"[Get Guest Token] ERROR: Не удалось получить токен")
    print(f"[Get Guest Token] Status: {response.status_code}")
    print(f"[Get Guest Token] Response: {response.text}")
    return None


def get_auth_headers(token):
    """Получение заголовков авторизации"""
    if token is None:
        print("[Get Auth Headers] WARNING: Token is None!")
        return {"Authorization": "Bearer invalid"}
    return {"Authorization": f"Bearer {token}"}


def create_board(title="Test Board", description="Test Description", token=None):
    """Создание доски"""
    url = f"{BASE_URL}/boards/"
    headers = get_auth_headers(token)
    payload = {
        "title": title,
        "description": description
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        print(f"\n[Create Board] Status: {response.status_code}, Title: '{title}'")
        if response.status_code != 201:
            print(f"[Create Board] Error: {response.text}")
        return response
    except requests.exceptions.RequestException as e:
        print(f"\n[Create Board] ERROR: {e}")
        raise


def create_task(board_id, title="Test Task", description=None, status="todo", priority="medium", token=None):
    """Создание задачи"""
    url = f"{BASE_URL}/boards/{board_id}/tasks"
    headers = get_auth_headers(token)
    payload = {
        "title": title,
        "status": status,
        "priority": priority
    }
    if description:
        payload["description"] = description
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        print(f"\n[Create Task] Status: {response.status_code}, Title: '{title}'")
        if response.status_code != 201:
            print(f"[Create Task] Error: {response.text}")
        return response
    except requests.exceptions.RequestException as e:
        print(f"\n[Create Task] ERROR: {e}")
        raise
