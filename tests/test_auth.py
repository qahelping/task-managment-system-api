"""
Тесты для аутентификации.
"""
import requests
import allure
from tests.conftest import BASE_URL, TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD


@allure.feature("Аутентификация")
@allure.story("Health check")
def test_health_check():
    """Тест проверки здоровья API"""
    url = f"{BASE_URL}/health"
    
    try:
        response = requests.get(url, timeout=5)
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
        print(f"\n✓ Health check OK: {response.json()}")
    except requests.exceptions.RequestException as e:
        print(f"\n✗ ОШИБКА: Сервер недоступен!")
        print(f"  Убедитесь что сервер запущен: python run.py")
        print(f"  Error: {e}")
        raise


@allure.feature("Аутентификация")
@allure.story("Регистрация администратора")
def test_register_admin_success():
    """Тест успешной регистрации первого администратора"""
    url = f"{BASE_URL}/auth/register-admin"
    
    payload = {
        "username": "admin",
        "email": TEST_ADMIN_EMAIL,
        "password": TEST_ADMIN_PASSWORD
    }
    
    response = requests.post(url, json=payload, timeout=10)
    
    # Может быть 201 (новый админ) или 403 (админ уже есть)
    assert response.status_code in [201, 403], f"Unexpected status: {response.status_code}"
    
    if response.status_code == 201:
        assert "access_token" in response.json()
        assert response.json()["token_type"] == "bearer"
        print(f"\n✓ Admin registered successfully")
        print(f"  Token: {response.json()['access_token'][:20]}...")
    else:
        print(f"\n✓ Admin already exists (expected if DB not cleaned)")


@allure.feature("Аутентификация")
@allure.story("Дубликат администратора")
def test_register_admin_duplicate():
    """Тест попытки регистрации второго администратора"""
    url = f"{BASE_URL}/auth/register-admin"
    
    # Первая регистрация (может уже существовать)
    payload_1 = {
        "username": "admin",
        "email": TEST_ADMIN_EMAIL,
        "password": TEST_ADMIN_PASSWORD
    }
    response_1 = requests.post(url, json=payload_1, timeout=10)
    print(f"\n✓ First registration: {response_1.status_code}")
    
    # Попытка второй регистрации - должна вернуть 403
    payload_2 = {
        "username": "admin2",
        "email": "admin2@example.com",
        "password": "admin123"
    }
    response_2 = requests.post(url, json=payload_2, timeout=10)
    
    assert response_2.status_code == 403
    assert "Admin already exists" in response_2.json()["detail"]
    print(f"✓ Second admin blocked: {response_2.json()['detail']}")


@allure.feature("Аутентификация")
@allure.story("Успешный вход")
def test_login_success():
    """Тест успешного входа"""
    # Сначала регистрируем (или используем существующего)
    register_url = f"{BASE_URL}/auth/register-admin"
    register_payload = {
        "username": "admin",
        "email": TEST_ADMIN_EMAIL,
        "password": TEST_ADMIN_PASSWORD
    }
    register_response = requests.post(register_url, json=register_payload, timeout=10)
    print(f"\n[Register] Status: {register_response.status_code}")
    
    # Если регистрация вернула 403, админ уже существует - это нормально
    # Если 201 - админ был создан - тоже нормально
    
    # Теперь логинимся
    login_url = f"{BASE_URL}/auth/login"
    login_payload = {
        "email": TEST_ADMIN_EMAIL,
        "password": TEST_ADMIN_PASSWORD
    }
    
    response = requests.post(login_url, json=login_payload, timeout=10)
    
    # Логин должен работать в любом случае
    if response.status_code != 200:
        print(f"[Login] ERROR: Status {response.status_code}")
        print(f"[Login] Response: {response.text}")
        print(f"[Login] Email: {TEST_ADMIN_EMAIL}, Password: {TEST_ADMIN_PASSWORD}")
        # Если логин не работает, возможно пароль не совпадает
        if register_response.status_code == 403:
            print(f"[Login] Admin exists but login failed - password might be different")
            print(f"[Login] РЕШЕНИЕ: Остановите сервер, удалите БД (rm *.db) и запустите заново")
            print(f"[Login] Это нормально если админ был создан ранее с другим паролем")
        # Пробуем еще раз с небольшим ожиданием
        import time
        time.sleep(0.5)
        retry_response = requests.post(login_url, json=login_payload, timeout=10)
        if retry_response.status_code == 200:
            print(f"[Login] Retry successful!")
            response = retry_response
    
    assert response.status_code == 200, f"Login failed with status {response.status_code}, response: {response.text}. " \
                                         f"Email: {TEST_ADMIN_EMAIL}, Password: {TEST_ADMIN_PASSWORD}. " \
                                         f"РЕШЕНИЕ: Остановите сервер, удалите БД (rm *.db) и запустите заново."
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"
    print(f"\n✓ Login successful")
    print(f"  Token: {response.json()['access_token'][:20]}...")


@allure.feature("Аутентификация")
@allure.story("Неправильный email")
def test_login_wrong_email():
    """Тест входа с неправильным email"""
    login_url = f"{BASE_URL}/auth/login"
    login_payload = {
        "email": "nonexistent@example.com",
        "password": "admin123"
    }
    
    response = requests.post(login_url, json=login_payload, timeout=10)
    
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]
    print(f"\n✓ Wrong email rejected: {response.json()['detail']}")


@allure.feature("Аутентификация")
@allure.story("Неправильный пароль")
def test_login_wrong_password():
    """Тест входа с неправильным паролем"""
    # Регистрируем админа (или используем существующего)
    register_url = f"{BASE_URL}/auth/register-admin"
    register_payload = {
        "username": "admin",
        "email": TEST_ADMIN_EMAIL,
        "password": TEST_ADMIN_PASSWORD
    }
    requests.post(register_url, json=register_payload, timeout=10)
    
    # Логин с неправильным паролем
    login_url = f"{BASE_URL}/auth/login"
    login_payload = {
        "email": TEST_ADMIN_EMAIL,
        "password": "wrongpassword"
    }
    
    response = requests.post(login_url, json=login_payload, timeout=10)
    
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]
    print(f"\n✓ Wrong password rejected: {response.json()['detail']}")


@allure.feature("Аутентификация")
@allure.story("Доступ без токена")
def test_access_without_token():
    """Тест доступа к защищённой ручке без токена"""
    url = f"{BASE_URL}/users/"
    
    response = requests.get(url, timeout=10)
    
    assert response.status_code == 403
    print(f"\n✓ Access without token blocked: {response.status_code}")


@allure.feature("Аутентификация")
@allure.story("Невалидный токен")
def test_access_with_invalid_token():
    """Тест доступа с невалидным токеном"""
    url = f"{BASE_URL}/users/"
    headers = {"Authorization": "Bearer invalid_token_here"}
    
    response = requests.get(url, headers=headers, timeout=10)
    
    assert response.status_code == 401
    print(f"\n✓ Invalid token rejected: {response.json()['detail']}")
