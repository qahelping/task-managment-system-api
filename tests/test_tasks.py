"""
Тесты для задач (создаются обычными пользователями).
"""
import requests
import allure
from tests.conftest import BASE_URL
from tests.helpers import get_user_token, get_auth_headers, create_board


@allure.feature("Задачи")
@allure.story("Создание задачи")
def test_create_task():
    """Тест создания задачи обычным пользователем"""
    # Получаем токен ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
    token = get_user_token()
    assert token is not None, "Не удалось получить токен пользователя"
    headers = get_auth_headers(token)
    
    # Создаём доску
    board_response = create_board(title="Board for Tasks", token=token)
    assert board_response.status_code == 201, "Не удалось создать доску"
    board_id = board_response.json()["id"]
    print(f"\n✓ Created board ID: {board_id}")
    
    # Создаём задачу
    url = f"{BASE_URL}/boards/{board_id}/tasks"
    payload = {
        "title": "Task by User",
        "description": "Task created by regular user",
        "status": "todo",
        "priority": "high"
    }
    
    response = requests.post(url, json=payload, headers=headers)
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Task by User"
    assert data["description"] == "Task created by regular user"
    assert data["status"] == "todo"
    assert data["priority"] == "high"
    assert data["board_id"] == board_id
    print(f"  Task created by user: ID={data['id']}, Title='{data['title']}'")


@allure.feature("Задачи")
@allure.story("Получение списка задач")
def test_get_tasks():
    """Тест получения списка задач обычным пользователем"""
    # Получаем токен ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
    token = get_user_token()
    assert token is not None, "Не удалось получить токен пользователя"
    headers = get_auth_headers(token)
    
    board_response = create_board(title="Board for Multiple Tasks", token=token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    # Создаём несколько задач
    task_url = f"{BASE_URL}/boards/{board_id}/tasks"
    
    payload_1 = {"title": "User Task 1", "status": "todo", "priority": "low"}
    requests.post(task_url, json=payload_1, headers=headers)
    
    payload_2 = {"title": "User Task 2", "status": "in_progress", "priority": "medium"}
    requests.post(task_url, json=payload_2, headers=headers)
    
    # Получаем список задач
    response = requests.get(task_url, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    print(f"\n✓ User's tasks count: {len(data)}")


@allure.feature("Задачи")
@allure.story("Фильтрация по статусу")
def test_get_tasks_with_status_filter():
    """Тест фильтрации задач по статусу"""
    # Получаем токен ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
    token = get_user_token()
    assert token is not None, "Не удалось получить токен пользователя"
    headers = get_auth_headers(token)
    
    board_response = create_board(title="Board for Status Filter", token=token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    # Создаём задачи с разными статусами
    task_url = f"{BASE_URL}/boards/{board_id}/tasks"
    
    payload_1 = {"title": "Task 1", "status": "todo", "priority": "low"}
    requests.post(task_url, json=payload_1, headers=headers)
    
    payload_2 = {"title": "Task 2", "status": "done", "priority": "medium"}
    requests.post(task_url, json=payload_2, headers=headers)
    
    payload_3 = {"title": "Task 3", "status": "done", "priority": "high"}
    requests.post(task_url, json=payload_3, headers=headers)
    
    # Фильтруем по статусу "done"
    filter_url = f"{BASE_URL}/boards/{board_id}/tasks?status=done"
    response = requests.get(filter_url, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(task["status"] == "done" for task in data)
    print(f"\n✓ Filtered tasks (status=done): {len(data)} tasks")


@allure.feature("Задачи")
@allure.story("Фильтрация по приоритету")
def test_get_tasks_with_priority_filter():
    """Тест фильтрации задач по приоритету"""
    # Получаем токен ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
    token = get_user_token()
    assert token is not None, "Не удалось получить токен пользователя"
    headers = get_auth_headers(token)
    
    board_response = create_board(title="Board for Priority Filter", token=token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    # Создаём задачи с разными приоритетами
    task_url = f"{BASE_URL}/boards/{board_id}/tasks"
    
    payload_1 = {"title": "Task 1", "status": "todo", "priority": "low"}
    requests.post(task_url, json=payload_1, headers=headers)
    
    payload_2 = {"title": "Task 2", "status": "todo", "priority": "high"}
    requests.post(task_url, json=payload_2, headers=headers)
    
    payload_3 = {"title": "Task 3", "status": "done", "priority": "high"}
    requests.post(task_url, json=payload_3, headers=headers)
    
    # Фильтруем по приоритету "high"
    filter_url = f"{BASE_URL}/boards/{board_id}/tasks?priority=high"
    response = requests.get(filter_url, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(task["priority"] == "high" for task in data)
    print(f"\n✓ Filtered tasks (priority=high): {len(data)} tasks")


@allure.feature("Задачи")
@allure.story("Получение задачи по ID")
def test_get_task_by_id():
    """Тест получения задачи по ID"""
    # Получаем токен ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
    token = get_user_token()
    assert token is not None, "Не удалось получить токен пользователя"
    headers = get_auth_headers(token)
    
    board_response = create_board(title="Board for Single Task", token=token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    # Создаём задачу
    create_url = f"{BASE_URL}/boards/{board_id}/tasks"
    payload = {"title": "Test Task", "status": "todo", "priority": "medium"}
    create_response = requests.post(create_url, json=payload, headers=headers)
    assert create_response.status_code == 201
    task_id = create_response.json()["id"]
    print(f"\n✓ Created task ID: {task_id}")
    
    # Получаем задачу по ID
    url = f"{BASE_URL}/boards/{board_id}/tasks/{task_id}"
    response = requests.get(url, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == "Test Task"
    print(f"  Task details: {data['title']}, status={data['status']}")


@allure.feature("Задачи")
@allure.story("Обновление задачи")
def test_update_task():
    """Тест обновления задачи обычным пользователем"""
    # Получаем токен ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
    token = get_user_token()
    assert token is not None, "Не удалось получить токен пользователя"
    headers = get_auth_headers(token)
    
    board_response = create_board(title="Board for Update", token=token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    # Создаём задачу
    create_url = f"{BASE_URL}/boards/{board_id}/tasks"
    payload = {"title": "Original Task", "status": "todo", "priority": "low"}
    create_response = requests.post(create_url, json=payload, headers=headers)
    assert create_response.status_code == 201
    task_id = create_response.json()["id"]
    
    # Обновляем задачу
    update_url = f"{BASE_URL}/boards/{board_id}/tasks/{task_id}"
    update_payload = {"title": "Updated Task by User", "status": "done", "priority": "high"}
    response = requests.put(update_url, json=update_payload, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Task by User"
    assert data["status"] == "done"
    assert data["priority"] == "high"
    print(f"\n✓ Task updated by user: '{data['title']}' (status={data['status']})")


@allure.feature("Задачи")
@allure.story("Удаление задачи")
def test_delete_task():
    """Тест удаления задачи обычным пользователем"""
    # Получаем токен ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
    token = get_user_token()
    assert token is not None, "Не удалось получить токен пользователя"
    headers = get_auth_headers(token)
    
    board_response = create_board(title="Board for Delete", token=token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    # Создаём задачу
    create_url = f"{BASE_URL}/boards/{board_id}/tasks"
    payload = {"title": "Task to Delete", "status": "todo", "priority": "medium"}
    create_response = requests.post(create_url, json=payload, headers=headers)
    assert create_response.status_code == 201
    task_id = create_response.json()["id"]
    print(f"\n✓ Created task to delete: {task_id}")
    
    # Удаляем задачу
    delete_url = f"{BASE_URL}/boards/{board_id}/tasks/{task_id}"
    response = requests.delete(delete_url, headers=headers)
    
    assert response.status_code == 204
    print(f"  Task deleted successfully by user")
    
    # Проверяем, что задача удалена
    get_response = requests.get(delete_url, headers=headers)
    assert get_response.status_code == 404
    print(f"  Verified: task not found after deletion")


@allure.feature("Задачи")
@allure.story("Создание задачи на несуществующей доске")
def test_create_task_on_nonexistent_board():
    """Тест создания задачи на несуществующей доске"""
    # Получаем токен ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
    token = get_user_token()
    assert token is not None, "Не удалось получить токен пользователя"
    headers = get_auth_headers(token)
    
    url = f"{BASE_URL}/boards/9999/tasks"
    payload = {"title": "Test Task", "status": "todo", "priority": "medium"}
    
    response = requests.post(url, json=payload, headers=headers)
    
    assert response.status_code == 404
    print(f"\n✓ Create task on non-existent board rejected: {response.json()}")


@allure.feature("Задачи")
@allure.story("Задача не найдена")
def test_get_task_not_found():
    """Тест получения несуществующей задачи"""
    # Получаем токен ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
    token = get_user_token()
    assert token is not None, "Не удалось получить токен пользователя"
    headers = get_auth_headers(token)
    
    board_response = create_board(title="Board for Not Found", token=token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    url = f"{BASE_URL}/boards/{board_id}/tasks/9999"
    response = requests.get(url, headers=headers)
    
    assert response.status_code == 404
    print(f"\n✓ Task not found (expected): {response.json()}")


@allure.feature("Задачи")
@allure.story("Обновление несуществующей задачи")
def test_update_task_not_found():
    """Тест обновления несуществующей задачи"""
    # Получаем токен ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
    token = get_user_token()
    assert token is not None, "Не удалось получить токен пользователя"
    headers = get_auth_headers(token)
    
    board_response = create_board(title="Board for Update Not Found", token=token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    url = f"{BASE_URL}/boards/{board_id}/tasks/9999"
    payload = {"title": "New Title"}
    response = requests.put(url, json=payload, headers=headers)
    
    assert response.status_code == 404
    print(f"\n✓ Update non-existent task rejected: {response.json()}")


@allure.feature("Задачи")
@allure.story("Удаление несуществующей задачи")
def test_delete_task_not_found():
    """Тест удаления несуществующей задачи"""
    # Получаем токен ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
    token = get_user_token()
    assert token is not None, "Не удалось получить токен пользователя"
    headers = get_auth_headers(token)
    
    board_response = create_board(title="Board for Delete Not Found", token=token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    url = f"{BASE_URL}/boards/{board_id}/tasks/9999"
    response = requests.delete(url, headers=headers)
    
    assert response.status_code == 404
    print(f"\n✓ Delete non-existent task rejected: {response.status_code}")
