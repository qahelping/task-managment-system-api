"""
Тесты для досок (создаются обычными пользователями).
"""
import requests
import allure
from tests.conftest import BASE_URL
from tests.helpers import get_user_token, get_auth_headers, create_board


@allure.feature("Доски")
@allure.story("Создание доски")
def test_create_board():
    """Тест создания доски обычным пользователем"""
    # Получаем токен ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
    token = get_user_token()
    assert token is not None, "Не удалось получить токен пользователя"
    
    # Создаём доску
    url = f"{BASE_URL}/boards/"
    headers = get_auth_headers(token)
    payload = {
        "title": "Test Board by User",
        "description": "Board created by regular user"
    }
    
    response = requests.post(url, json=payload, headers=headers)
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Board by User"
    assert data["description"] == "Board created by regular user"
    assert "id" in data
    assert "created_at" in data
    print(f"\n✓ Board created by user: ID={data['id']}, Title='{data['title']}'")


@allure.feature("Доски")
@allure.story("Получение списка досок")
def test_get_boards():
    """Тест получения списка досок обычным пользователем"""
    # Получаем токен ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
    token = get_user_token()
    assert token is not None, "Не удалось получить токен пользователя"
    headers = get_auth_headers(token)
    
    # Создаём несколько досок
    url = f"{BASE_URL}/boards/"
    
    payload_1 = {"title": "User Board 1", "description": "Description 1"}
    requests.post(url, json=payload_1, headers=headers)
    
    payload_2 = {"title": "User Board 2", "description": "Description 2"}
    requests.post(url, json=payload_2, headers=headers)
    
    # Получаем список досок
    response = requests.get(url, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    print(f"\n✓ User's boards count: {len(data)}")


@allure.feature("Доски")
@allure.story("Получение доски по ID")
def test_get_board_by_id():
    """Тест получения доски по ID обычным пользователем"""
    # Получаем токен ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
    token = get_user_token()
    assert token is not None, "Не удалось получить токен пользователя"
    headers = get_auth_headers(token)
    
    # Создаём доску
    create_url = f"{BASE_URL}/boards/"
    payload = {"title": "Test Board", "description": "Test description"}
    create_response = requests.post(create_url, json=payload, headers=headers)
    assert create_response.status_code == 201
    board_id = create_response.json()["id"]
    print(f"\n✓ Created board ID: {board_id}")
    
    # Получаем доску по ID
    url = f"{BASE_URL}/boards/{board_id}"
    response = requests.get(url, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == board_id
    assert data["title"] == "Test Board"
    assert "tasks" in data
    assert isinstance(data["tasks"], list)
    print(f"  Board details: {data['title']}, tasks count: {len(data['tasks'])}")


@allure.feature("Доски")
@allure.story("Обновление доски")
def test_update_board():
    """Тест обновления доски обычным пользователем"""
    # Получаем токен ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
    token = get_user_token()
    assert token is not None, "Не удалось получить токен пользователя"
    headers = get_auth_headers(token)
    
    # Создаём доску
    create_url = f"{BASE_URL}/boards/"
    payload = {"title": "Original Title", "description": "Original description"}
    create_response = requests.post(create_url, json=payload, headers=headers)
    assert create_response.status_code == 201
    board_id = create_response.json()["id"]
    
    # Обновляем доску
    update_url = f"{BASE_URL}/boards/{board_id}"
    update_payload = {"title": "Updated Title by User", "description": "Updated by regular user"}
    response = requests.put(update_url, json=update_payload, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title by User"
    assert data["description"] == "Updated by regular user"
    print(f"\n✓ Board updated by user: '{data['title']}'")


@allure.feature("Доски")
@allure.story("Удаление доски")
def test_delete_board():
    """Тест удаления доски обычным пользователем"""
    # Получаем токен ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
    token = get_user_token()
    assert token is not None, "Не удалось получить токен пользователя"
    headers = get_auth_headers(token)
    
    # Создаём доску
    create_url = f"{BASE_URL}/boards/"
    payload = {"title": "Board to Delete", "description": "Will be deleted by user"}
    create_response = requests.post(create_url, json=payload, headers=headers)
    assert create_response.status_code == 201
    board_id = create_response.json()["id"]
    print(f"\n✓ Created board to delete: {board_id}")
    
    # Удаляем доску
    delete_url = f"{BASE_URL}/boards/{board_id}"
    response = requests.delete(delete_url, headers=headers)
    
    assert response.status_code == 204
    print(f"  Board deleted successfully by user")
    
    # Проверяем, что доска удалена
    get_response = requests.get(delete_url, headers=headers)
    assert get_response.status_code == 404
    print(f"  Verified: board not found after deletion")


@allure.feature("Доски")
@allure.story("Доска не найдена")
def test_get_board_not_found():
    """Тест получения несуществующей доски"""
    # Получаем токен ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
    token = get_user_token()
    assert token is not None, "Не удалось получить токен пользователя"
    headers = get_auth_headers(token)
    
    url = f"{BASE_URL}/boards/9999"
    response = requests.get(url, headers=headers)
    
    assert response.status_code == 404
    print(f"\n✓ Board not found (expected): {response.json()}")


@allure.feature("Доски")
@allure.story("Обновление несуществующей доски")
def test_update_board_not_found():
    """Тест обновления несуществующей доски"""
    # Получаем токен ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
    token = get_user_token()
    assert token is not None, "Не удалось получить токен пользователя"
    headers = get_auth_headers(token)
    
    url = f"{BASE_URL}/boards/9999"
    payload = {"title": "New Title"}
    response = requests.put(url, json=payload, headers=headers)
    
    assert response.status_code == 404
    print(f"\n✓ Update non-existent board rejected: {response.json()}")


@allure.feature("Доски")
@allure.story("Удаление несуществующей доски")
def test_delete_board_not_found():
    """Тест удаления несуществующей доски"""
    # Получаем токен ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
    token = get_user_token()
    assert token is not None, "Не удалось получить токен пользователя"
    headers = get_auth_headers(token)
    
    url = f"{BASE_URL}/boards/9999"
    response = requests.delete(url, headers=headers)
    
    assert response.status_code == 404
    print(f"\n✓ Delete non-existent board rejected: {response.status_code}")
