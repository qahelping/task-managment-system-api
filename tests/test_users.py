"""
Тесты для пользователей.
"""
import requests
import allure
from tests.conftest import BASE_URL
from tests.helpers import get_admin_token, get_auth_headers


@allure.feature("Пользователи")
@allure.story("Получение списка пользователей")
def test_get_users():
    """Тест получения списка пользователей (админом)"""
    # Получаем токен АДМИНА
    token = get_admin_token()
    assert token is not None, "Не удалось получить токен админа"
    
    # Получаем список пользователей
    url = f"{BASE_URL}/users/"
    headers = get_auth_headers(token)
    
    response = requests.get(url, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1  # Минимум один пользователь (админ)
    print(f"\n✓ Users count: {len(data)}")
    print(f"  Users list: {[u['username'] for u in data]}")


@allure.feature("Пользователи")
@allure.story("Получение пользователя по ID")
def test_get_user_by_id():
    """Тест получения пользователя по ID (админом)"""
    # Получаем токен АДМИНА
    token = get_admin_token()
    assert token is not None, "Не удалось получить токен админа"
    headers = get_auth_headers(token)
    
    # Получаем список пользователей
    users_url = f"{BASE_URL}/users/"
    users_response = requests.get(users_url, headers=headers)
    assert users_response.status_code == 200
    users = users_response.json()
    assert len(users) > 0, "Нет пользователей в системе"
    
    user_id = users[0]["id"]
    print(f"\n✓ Testing user ID: {user_id}")
    
    # Получаем пользователя по ID
    url = f"{BASE_URL}/users/{user_id}"
    response = requests.get(url, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_id
    assert "username" in data
    assert "email" in data
    print(f"  User data: username={data['username']}, email={data['email']}, role={data['role']}")


@allure.feature("Пользователи")
@allure.story("Пользователь не найден")
def test_get_user_not_found():
    """Тест получения несуществующего пользователя"""
    # Получаем токен АДМИНА
    token = get_admin_token()
    assert token is not None, "Не удалось получить токен админа"
    headers = get_auth_headers(token)
    
    # Пытаемся получить несуществующего пользователя
    url = f"{BASE_URL}/users/9999"
    response = requests.get(url, headers=headers)
    
    assert response.status_code == 404
    assert "User not found" in response.json()["detail"]
    print(f"\n✓ User not found (expected): {response.json()}")


@allure.feature("Пользователи")
@allure.story("Доступ без авторизации")
def test_get_users_without_auth():
    """Тест получения пользователей без аутентификации"""
    url = f"{BASE_URL}/users/"
    
    response = requests.get(url)
    
    assert response.status_code == 403
    print(f"\n✓ Unauthorized access denied: {response.status_code}")
