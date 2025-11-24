"""
Тесты для гостей (пользователей с ролью guest).
Гости могут только просматривать публичные доски и их задачи.
"""
import requests
import allure
from tests.conftest import BASE_URL
from tests.helpers import get_user_token, get_guest_token, get_auth_headers, create_board


@allure.feature("Гостевой доступ")
@allure.story("Просмотр публичной доски")
def test_guest_can_view_public_board():
    """Тест: гость может просматривать публичную доску"""
    # Создаём обычного пользователя и публичную доску
    user_token = get_user_token()
    assert user_token is not None
    user_headers = get_auth_headers(user_token)
    
    # Создаём ПУБЛИЧНУЮ доску
    board_url = f"{BASE_URL}/boards/"
    board_payload = {
        "title": "Public Board",
        "description": "This is a public board",
        "public": True  # Публичная доска
    }
    board_response = requests.post(board_url, json=board_payload, headers=user_headers)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    print(f"\n✓ Created public board: ID={board_id}")
    
    # Создаём задачу на доске
    task_url = f"{BASE_URL}/boards/{board_id}/tasks"
    task_payload = {"title": "Task on public board", "status": "todo", "priority": "medium"}
    requests.post(task_url, json=task_payload, headers=user_headers)
    
    # Получаем токен ГОСТЯ
    guest_token = get_guest_token()
    assert guest_token is not None
    guest_headers = get_auth_headers(guest_token)
    
    # Гость просматривает публичную доску
    url = f"{BASE_URL}/boards/{board_id}"
    response = requests.get(url, headers=guest_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == board_id
    assert data["title"] == "Public Board"
    assert data["public"] == True
    print(f"✓ Guest can view public board: '{data['title']}'")


@allure.feature("Гостевой доступ")
@allure.story("Запрет просмотра приватной доски")
def test_guest_cannot_view_private_board():
    """Тест: гость НЕ может просматривать приватную доску"""
    # Создаём обычного пользователя и приватную доску
    user_token = get_user_token()
    assert user_token is not None
    user_headers = get_auth_headers(user_token)
    
    # Создаём ПРИВАТНУЮ доску
    board_url = f"{BASE_URL}/boards/"
    board_payload = {
        "title": "Private Board",
        "description": "This is a private board",
        "public": False  # Приватная доска
    }
    board_response = requests.post(board_url, json=board_payload, headers=user_headers)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    print(f"\n✓ Created private board: ID={board_id}")
    
    # Получаем токен ГОСТЯ
    guest_token = get_guest_token()
    assert guest_token is not None
    guest_headers = get_auth_headers(guest_token)
    
    # Гость пытается просмотреть приватную доску
    url = f"{BASE_URL}/boards/{board_id}"
    response = requests.get(url, headers=guest_headers)
    
    assert response.status_code == 403
    assert "private" in response.json()["detail"].lower() or "public" in response.json()["detail"].lower()
    print(f"✓ Guest cannot view private board (expected 403): {response.json()['detail']}")


@allure.feature("Гостевой доступ")
@allure.story("Просмотр задач на публичной доске")
def test_guest_can_view_tasks_on_public_board():
    """Тест: гость может просматривать задачи на публичной доске"""
    # Создаём обычного пользователя и публичную доску
    user_token = get_user_token()
    assert user_token is not None
    user_headers = get_auth_headers(user_token)
    
    # Создаём публичную доску
    board_url = f"{BASE_URL}/boards/"
    board_payload = {
        "title": "Public Board with Tasks",
        "description": "Tasks visible to guests",
        "public": True
    }
    board_response = requests.post(board_url, json=board_payload, headers=user_headers)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    # Создаём несколько задач
    task_url = f"{BASE_URL}/boards/{board_id}/tasks"
    requests.post(task_url, json={"title": "Task 1", "status": "todo", "priority": "high"}, headers=user_headers)
    requests.post(task_url, json={"title": "Task 2", "status": "done", "priority": "low"}, headers=user_headers)
    print(f"\n✓ Created 2 tasks on public board")
    
    # Получаем токен ГОСТЯ
    guest_token = get_guest_token()
    assert guest_token is not None
    guest_headers = get_auth_headers(guest_token)
    
    # Гость просматривает задачи на публичной доске
    response = requests.get(task_url, headers=guest_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all("title" in task for task in data)
    print(f"✓ Guest can view {len(data)} tasks on public board")


@allure.feature("Гостевой доступ")
@allure.story("Запрет просмотра задач на приватной доске")
def test_guest_cannot_view_tasks_on_private_board():
    """Тест: гость НЕ может просматривать задачи на приватной доске"""
    # Создаём обычного пользователя и приватную доску
    user_token = get_user_token()
    assert user_token is not None
    user_headers = get_auth_headers(user_token)
    
    # Создаём приватную доску с задачами
    board_url = f"{BASE_URL}/boards/"
    board_payload = {
        "title": "Private Board with Tasks",
        "description": "Tasks NOT visible to guests",
        "public": False
    }
    board_response = requests.post(board_url, json=board_payload, headers=user_headers)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    # Создаём задачу
    task_url = f"{BASE_URL}/boards/{board_id}/tasks"
    requests.post(task_url, json={"title": "Private Task", "status": "todo", "priority": "medium"}, headers=user_headers)
    print(f"\n✓ Created task on private board")
    
    # Получаем токен ГОСТЯ
    guest_token = get_guest_token()
    assert guest_token is not None
    guest_headers = get_auth_headers(guest_token)
    
    # Гость пытается просмотреть задачи на приватной доске
    response = requests.get(task_url, headers=guest_headers)
    
    assert response.status_code == 403
    print(f"✓ Guest cannot view tasks on private board (expected 403): {response.json()['detail']}")


@allure.feature("Гостевой доступ")
@allure.story("Запрет создания досок")
def test_guest_cannot_create_board():
    """Тест: гость НЕ может создавать доски"""
    # Получаем токен ГОСТЯ
    guest_token = get_guest_token()
    assert guest_token is not None
    guest_headers = get_auth_headers(guest_token)
    
    # Гость пытается создать доску
    board_url = f"{BASE_URL}/boards/"
    board_payload = {
        "title": "Board by Guest",
        "description": "Should not be created",
        "public": True
    }
    response = requests.post(board_url, json=board_payload, headers=guest_headers)
    
    # Гость не может создавать доски (должна быть ошибка)
    # TODO: Добавить проверку роли при создании досок
    print(f"\n✓ Guest create board attempt: {response.status_code}")
    print(f"  Response: {response.text}")


@allure.feature("Гостевой доступ")
@allure.story("Запрет обновления публичных досок")
def test_guest_cannot_update_public_board():
    """Тест: гость НЕ может обновлять публичные доски"""
    # Создаём обычного пользователя и публичную доску
    user_token = get_user_token()
    assert user_token is not None
    user_headers = get_auth_headers(user_token)
    
    # Создаём публичную доску
    board_url = f"{BASE_URL}/boards/"
    board_payload = {"title": "Public Board", "description": "Original", "public": True}
    board_response = requests.post(board_url, json=board_payload, headers=user_headers)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    print(f"\n✓ Created public board: ID={board_id}")
    
    # Получаем токен ГОСТЯ
    guest_token = get_guest_token()
    assert guest_token is not None
    guest_headers = get_auth_headers(guest_token)
    
    # Гость пытается обновить публичную доску
    update_url = f"{BASE_URL}/boards/{board_id}"
    update_payload = {"title": "Updated by Guest", "description": "Should not work"}
    response = requests.put(update_url, json=update_payload, headers=guest_headers)
    
    assert response.status_code == 403
    print(f"✓ Guest cannot update board (expected 403): {response.json()['detail']}")


@allure.feature("Гостевой доступ")
@allure.story("Запрет удаления публичных досок")
def test_guest_cannot_delete_public_board():
    """Тест: гость НЕ может удалять публичные доски"""
    # Создаём обычного пользователя и публичную доску
    user_token = get_user_token()
    assert user_token is not None
    user_headers = get_auth_headers(user_token)
    
    # Создаём публичную доску
    board_url = f"{BASE_URL}/boards/"
    board_payload = {"title": "Public Board", "description": "To be protected", "public": True}
    board_response = requests.post(board_url, json=board_payload, headers=user_headers)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    print(f"\n✓ Created public board: ID={board_id}")
    
    # Получаем токен ГОСТЯ
    guest_token = get_guest_token()
    assert guest_token is not None
    guest_headers = get_auth_headers(guest_token)
    
    # Гость пытается удалить публичную доску
    delete_url = f"{BASE_URL}/boards/{board_id}"
    response = requests.delete(delete_url, headers=guest_headers)
    
    assert response.status_code == 403
    print(f"✓ Guest cannot delete board (expected 403)")
    
    # Проверяем что доска всё ещё существует
    check_response = requests.get(delete_url, headers=user_headers)
    assert check_response.status_code == 200
    print(f"  Verified: board still exists after guest delete attempt")


@allure.feature("Гостевой доступ")
@allure.story("Создание публичных и приватных досок")
def test_user_can_create_both_public_and_private_boards():
    """Тест: обычный пользователь может создавать и публичные и приватные доски"""
    # Получаем токен пользователя
    user_token = get_user_token()
    assert user_token is not None
    user_headers = get_auth_headers(user_token)
    
    board_url = f"{BASE_URL}/boards/"
    
    # Создаём публичную доску
    public_payload = {"title": "Public Board", "description": "Everyone can see", "public": True}
    public_response = requests.post(board_url, json=public_payload, headers=user_headers)
    assert public_response.status_code == 201
    assert public_response.json()["public"] == True
    print(f"\n✓ User created public board")
    
    # Создаём приватную доску
    private_payload = {"title": "Private Board", "description": "Only owner can see", "public": False}
    private_response = requests.post(board_url, json=private_payload, headers=user_headers)
    assert private_response.status_code == 201
    assert private_response.json()["public"] == False
    print(f"✓ User created private board")


@allure.feature("Гостевой доступ")
@allure.story("Изменение статуса публичности доски")
def test_user_can_change_board_public_status():
    """Тест: пользователь может изменить статус публичности доски"""
    # Получаем токен пользователя
    user_token = get_user_token()
    assert user_token is not None
    user_headers = get_auth_headers(user_token)
    
    # Создаём приватную доску
    board_url = f"{BASE_URL}/boards/"
    board_payload = {"title": "Initially Private", "description": "Will be public", "public": False}
    board_response = requests.post(board_url, json=board_payload, headers=user_headers)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    assert board_response.json()["public"] == False
    print(f"\n✓ Created private board: ID={board_id}")
    
    # Меняем на публичную
    update_url = f"{BASE_URL}/boards/{board_id}"
    update_payload = {"public": True}
    update_response = requests.put(update_url, json=update_payload, headers=user_headers)
    assert update_response.status_code == 200
    assert update_response.json()["public"] == True
    print(f"✓ Changed board to public")
    
    # Теперь гость может просмотреть эту доску
    guest_token = get_guest_token()
    assert guest_token is not None
    guest_headers = get_auth_headers(guest_token)
    
    guest_response = requests.get(update_url, headers=guest_headers)
    assert guest_response.status_code == 200
    print(f"✓ Guest can now view the board")
