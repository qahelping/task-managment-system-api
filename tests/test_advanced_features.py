"""
Тесты для расширенных функций API.
Покрывает все новые эндпоинты.
"""
import requests
import allure
from tests.conftest import BASE_URL
from tests.helpers import get_user_token, get_admin_token, get_auth_headers, create_board, create_task, register_user


# ==================== УПРАВЛЕНИЕ УЧАСТНИКАМИ ДОСОК ====================

@allure.feature("Управление участниками досок")
@allure.story("Добавление участника на доску")
def test_add_board_member():
    """Тест добавления участника на доску"""
    # Создаём доску пользователем
    user1_token = get_user_token()
    assert user1_token is not None
    user1_headers = get_auth_headers(user1_token)
    
    board_response = create_board(title="Board with Members", token=user1_token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    creator_id = board_response.json()["created_by"]
    print(f"\n✓ Created board: ID={board_id}, creator_id={creator_id}")
    
    # Создаём второго пользователя и получаем его ID из ответа регистрации
    user2_response = register_user()
    assert user2_response.status_code == 201
    user2_token = user2_response.json()["access_token"]
    
    # Получаем ID второго пользователя через создание доски вторым пользователем
    # Создаём доску вторым пользователем чтобы получить его ID
    user2_board_response = create_board(title="User2 Board", token=user2_token)
    assert user2_board_response.status_code == 201
    user2_id = user2_board_response.json()["created_by"]
    
    assert user2_id is not None, "Не удалось получить ID второго пользователя"
    assert user2_id != creator_id, f"ID второго пользователя ({user2_id}) совпадает с создателем доски ({creator_id})"
    
    # Добавляем участника
    url = f"{BASE_URL}/boards/{board_id}/members/{user2_id}"
    response = requests.post(url, headers=user1_headers)
    
    assert response.status_code == 201
    assert "User added to board" in response.json()["message"]
    print(f"✓ User {user2_id} added to board")


@allure.feature("Управление участниками досок")
@allure.story("Получение списка участников")
def test_get_board_members():
    """Тест получения списка участников доски"""
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    board_response = create_board(title="Board for Members", token=user_token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    # Получаем список участников
    url = f"{BASE_URL}/boards/{board_id}/members"
    response = requests.get(url, headers=headers)
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    print(f"✓ Board members: {len(response.json())} members")


@allure.feature("Управление участниками досок")
@allure.story("Удаление участника с доски")
def test_remove_board_member():
    """Тест удаления участника с доски"""
    user1_token = get_user_token()
    assert user1_token is not None
    user1_headers = get_auth_headers(user1_token)
    
    board_response = create_board(title="Board to Remove Member", token=user1_token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    creator_id = board_response.json()["created_by"]
    
    # Создаём второго пользователя
    user2_response = register_user()
    assert user2_response.status_code == 201
    user2_token = user2_response.json()["access_token"]
    
    # Получаем ID второго пользователя через создание доски
    user2_board_response = create_board(title="User2 Board", token=user2_token)
    assert user2_board_response.status_code == 201
    user2_id = user2_board_response.json()["created_by"]
    
    assert user2_id is not None
    assert user2_id != creator_id
    
    # Добавляем участника
    add_response = requests.post(f"{BASE_URL}/boards/{board_id}/members/{user2_id}", headers=user1_headers)
    assert add_response.status_code == 201
    
    # Удаляем участника
    url = f"{BASE_URL}/boards/{board_id}/members/{user2_id}"
    response = requests.delete(url, headers=user1_headers)
    
    assert response.status_code == 204
    print(f"✓ Member {user2_id} removed from board")


# ==================== АРХИВАЦИЯ ДОСОК ====================

@allure.feature("Архивация досок")
@allure.story("Архивация доски")
def test_archive_board():
    """Тест архивации доски"""
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    board_response = create_board(title="Board to Archive", token=user_token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    # Архивируем доску
    url = f"{BASE_URL}/boards/{board_id}/archive"
    response = requests.put(url, headers=headers)
    
    assert response.status_code == 200
    assert response.json()["archived"] == True
    print(f"✓ Board {board_id} archived")


@allure.feature("Архивация досок")
@allure.story("Получение архивированных досок")
def test_get_archived_boards():
    """Тест получения архивированных досок"""
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    # Создаём и архивируем доску
    board_response = create_board(title="Archived Board", token=user_token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    archive_response = requests.put(f"{BASE_URL}/boards/{board_id}/archive", headers=headers)
    assert archive_response.status_code == 200
    
    # Получаем архивированные доски
    url = f"{BASE_URL}/boards/?archived=true"
    response = requests.get(url, headers=headers)
    
    assert response.status_code == 200
    archived_boards = [b for b in response.json() if b.get("archived") == True]
    assert len(archived_boards) > 0
    print(f"✓ Found {len(archived_boards)} archived boards")


# ==================== ОПЕРАЦИИ С ЗАДАЧАМИ ====================

@allure.feature("Операции с задачами")
@allure.story("Перенос задачи на другую доску")
def test_move_task_to_another_board():
    """Тест переноса задачи на другую доску"""
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    # Создаём две доски
    board1_response = create_board(title="Source Board", token=user_token)
    assert board1_response.status_code == 201
    board1_id = board1_response.json()["id"]
    
    board2_response = create_board(title="Target Board", token=user_token)
    assert board2_response.status_code == 201
    board2_id = board2_response.json()["id"]
    
    # Создаём задачу на первой доске
    task_response = create_task(board1_id, title="Task to Move", token=user_token)
    assert task_response.status_code == 201
    task_id = task_response.json()["id"]
    
    # Переносим задачу
    url = f"{BASE_URL}/boards/{board1_id}/tasks/{task_id}/move-to/{board2_id}"
    response = requests.put(url, headers=headers)
    
    assert response.status_code == 200
    assert response.json()["board_id"] == board2_id
    print(f"✓ Task {task_id} moved from board {board1_id} to {board2_id}")


@allure.feature("Операции с задачами")
@allure.story("Изменение статуса задачи")
def test_update_task_status():
    """Тест изменения статуса задачи"""
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    board_response = create_board(title="Board for Status", token=user_token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    task_response = create_task(board_id, title="Task", status="todo", token=user_token)
    assert task_response.status_code == 201
    task_id = task_response.json()["id"]
    
    # Изменяем статус
    url = f"{BASE_URL}/tasks/{task_id}/status/done"
    response = requests.put(url, headers=headers)
    
    assert response.status_code == 200
    assert response.json()["status"] == "done"
    print(f"✓ Task status changed to 'done'")


@allure.feature("Операции с задачами")
@allure.story("Изменение статуса на следующий")
def test_update_task_to_next_status():
    """Тест изменения статуса на следующий"""
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    board_response = create_board(title="Board for Next Status", token=user_token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    task_response = create_task(board_id, title="Task", status="todo", token=user_token)
    assert task_response.status_code == 201
    task_id = task_response.json()["id"]
    
    # Изменяем на следующий статус
    url = f"{BASE_URL}/tasks/{task_id}/next-status"
    response = requests.put(url, headers=headers)
    
    assert response.status_code == 200
    assert response.json()["status"] == "in_progress"
    print(f"✓ Task status changed from 'todo' to 'in_progress'")


@allure.feature("Операции с задачами")
@allure.story("Изменение приоритета задачи")
def test_update_task_priority():
    """Тест изменения приоритета задачи"""
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    board_response = create_board(title="Board for Priority", token=user_token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    task_response = create_task(board_id, title="Task", priority="low", token=user_token)
    assert task_response.status_code == 201
    task_id = task_response.json()["id"]
    
    # Изменяем приоритет
    url = f"{BASE_URL}/tasks/{task_id}/priority/high"
    response = requests.put(url, headers=headers)
    
    assert response.status_code == 200
    assert response.json()["priority"] == "high"
    print(f"✓ Task priority changed to 'high'")


@allure.feature("Операции с задачами")
@allure.story("Поиск задач")
def test_search_tasks():
    """Тест поиска задач по тексту"""
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    board_response = create_board(title="Board for Search", token=user_token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    # Создаём задачу с уникальным названием
    create_task(board_id, title="Login Feature Implementation", description="Implement user login", token=user_token)
    
    # Ищем задачи
    url = f"{BASE_URL}/tasks/search?q=login"
    response = requests.get(url, headers=headers)
    
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) > 0
    assert any("login" in task["title"].lower() or "login" in (task.get("description") or "").lower() 
               for task in tasks)
    print(f"✓ Found {len(tasks)} tasks matching 'login'")


@allure.feature("Операции с задачами")
@allure.story("Массовое изменение статуса")
def test_bulk_update_task_status():
    """Тест массового изменения статуса задач"""
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    board_response = create_board(title="Board for Bulk Update", token=user_token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    # Создаём несколько задач
    task1 = create_task(board_id, title="Task 1", status="todo", token=user_token)
    assert task1.status_code == 201
    task2 = create_task(board_id, title="Task 2", status="todo", token=user_token)
    assert task2.status_code == 201
    task3 = create_task(board_id, title="Task 3", status="todo", token=user_token)
    assert task3.status_code == 201
    
    task_ids = [task1.json()["id"], task2.json()["id"], task3.json()["id"]]
    
    # Массовое изменение статуса
    url = f"{BASE_URL}/boards/{board_id}/tasks/bulk/status"
    payload = {"task_ids": task_ids, "new_status": "done"}
    response = requests.put(url, json=payload, headers=headers)
    
    assert response.status_code == 200
    assert response.json()["updated"] == 3
    print(f"✓ Updated {response.json()['updated']} tasks to 'done'")


@allure.feature("Операции с задачами")
@allure.story("Массовое удаление задач")
def test_bulk_delete_tasks():
    """Тест массового удаления задач"""
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    board_response = create_board(title="Board for Bulk Delete", token=user_token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    # Создаём несколько задач
    task1 = create_task(board_id, title="Task 1", token=user_token)
    assert task1.status_code == 201
    task2 = create_task(board_id, title="Task 2", token=user_token)
    assert task2.status_code == 201
    
    task_ids = [task1.json()["id"], task2.json()["id"]]
    
    # Массовое удаление - используем POST эндпоинт
    url = f"{BASE_URL}/boards/{board_id}/tasks/bulk/delete"
    payload = {"task_ids": task_ids}
    response = requests.post(url, json=payload, headers=headers)
    
    assert response.status_code == 200
    assert response.json()["deleted"] >= len(task_ids)  # Может быть больше если были другие задачи
    print(f"✓ Deleted {response.json()['deleted']} tasks")


@allure.feature("Операции с задачами")
@allure.story("Изменение порядка задач")
def test_reorder_tasks():
    """Тест изменения порядка задач"""
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    board_response = create_board(title="Board for Reorder", token=user_token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    # Создаём несколько задач
    task1 = create_task(board_id, title="Task 1", token=user_token)
    assert task1.status_code == 201
    task1_id = task1.json()["id"]
    
    task2 = create_task(board_id, title="Task 2", token=user_token)
    assert task2.status_code == 201
    task2_id = task2.json()["id"]
    
    task3 = create_task(board_id, title="Task 3", token=user_token)
    assert task3.status_code == 201
    task3_id = task3.json()["id"]
    
    # Убеждаемся что все ID - целые числа
    task_ids = [int(task3_id), int(task1_id), int(task2_id)]  # Новый порядок
    
    # Проверяем что все задачи существуют на доске
    tasks_url = f"{BASE_URL}/boards/{board_id}/tasks"
    tasks_response = requests.get(tasks_url, headers=headers)
    assert tasks_response.status_code == 200
    all_tasks = tasks_response.json()
    all_task_ids = [t['id'] for t in all_tasks]
    print(f"  All tasks on board: {all_task_ids}")
    print(f"  Requested IDs: {task_ids}")
    
    # Проверяем что все запрошенные задачи существуют
    for task_id in task_ids:
        assert task_id in all_task_ids, f"Task {task_id} not found on board"
    
    # Изменяем порядок
    url = f"{BASE_URL}/boards/{board_id}/tasks/reorder"
    payload = {"ordered_ids": task_ids}
    response = requests.put(url, json=payload, headers=headers)
    
    if response.status_code == 422:
        print(f"⚠ Validation error: {response.text}")
        print(f"  Payload: {payload}")
        print(f"  Task IDs type: {[type(tid) for tid in task_ids]}")
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    assert "reordered" in response.json()["message"].lower()
    print(f"✓ Tasks reordered")


# ==================== СТАТИСТИКА ====================

@allure.feature("Статистика")
@allure.story("Статистика по доске")
def test_get_board_stats():
    """Тест получения статистики по доске"""
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    board_response = create_board(title="Board for Stats", token=user_token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    # Создаём задачи с разными статусами
    create_task(board_id, title="Task 1", status="todo", token=user_token)
    create_task(board_id, title="Task 2", status="todo", token=user_token)
    create_task(board_id, title="Task 3", status="in_progress", token=user_token)
    create_task(board_id, title="Task 4", status="done", token=user_token)
    
    # Получаем статистику
    url = f"{BASE_URL}/boards/{board_id}/stats"
    response = requests.get(url, headers=headers)
    
    assert response.status_code == 200
    stats = response.json()
    assert stats["total"] == 4
    assert stats["todo"] == 2
    assert stats["in_progress"] == 1
    assert stats["done"] == 1
    print(f"✓ Board stats: {stats}")


@allure.feature("Статистика")
@allure.story("Глобальная статистика")
def test_get_global_task_stats():
    """Тест получения глобальной статистики"""
    # Используем обычного пользователя, не админа
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    url = f"{BASE_URL}/stats/tasks"
    response = requests.get(url, headers=headers)
    
    assert response.status_code == 200
    stats = response.json()
    assert "boards" in stats
    assert "tasks_total" in stats
    assert "done" in stats
    print(f"✓ Global stats: {stats}")


@allure.feature("Статистика")
@allure.story("Активность пользователя")
def test_get_user_activity():
    """Тест получения активности пользователя"""
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    # Создаём доски и задачи
    board_response = create_board(title="My Board", token=user_token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    create_task(board_id, title="My Task", token=user_token)
    
    # Получаем ID пользователя из created_by доски
    user_id = board_response.json()["created_by"]
    assert user_id is not None
    
    # Получаем активность
    url = f"{BASE_URL}/stats/users/{user_id}/activity"
    response = requests.get(url, headers=headers)
    
    assert response.status_code == 200
    activity = response.json()
    assert "created_tasks" in activity
    assert "updated_tasks" in activity
    assert "boards_created" in activity
    print(f"✓ User activity: {activity}")


# ==================== ПОИСК ====================

@allure.feature("Поиск")
@allure.story("Глобальный поиск")
def test_global_search():
    """Тест глобального поиска"""
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    # Создаём доску и задачу с уникальными названиями
    board_response = create_board(title="Backend Development Board", token=user_token)
    assert board_response.status_code == 201
    create_task(board_response.json()["id"], title="Backend API Task", token=user_token)
    
    # Глобальный поиск
    url = f"{BASE_URL}/search?q=backend"
    response = requests.get(url, headers=headers)
    
    assert response.status_code == 200
    results = response.json()
    assert "boards" in results
    assert "tasks" in results
    assert "users" in results
    print(f"✓ Search results: boards={len(results['boards'])}, tasks={len(results['tasks'])}")


# ==================== ПОЛЬЗОВАТЕЛИ ====================

@allure.feature("Пользователи")
@allure.story("Обновление пароля")
def test_update_user_password():
    """Тест обновления пароля пользователя"""
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    # Получаем ID пользователя из токена или из списка
    # Создаём доску чтобы получить created_by
    board_response = create_board(title="My Board", token=user_token)
    assert board_response.status_code == 201
    user_id = board_response.json()["created_by"]
    
    # Обновляем пароль
    url = f"{BASE_URL}/users/{user_id}/password"
    payload = {"new_password": "newpassword123"}
    response = requests.put(url, json=payload, headers=headers)
    
    assert response.status_code == 200
    assert "Password updated" in response.json()["message"]
    print(f"✓ Password updated for user {user_id}")


@allure.feature("Пользователи")
@allure.story("Получение своих задач")
def test_get_my_tasks():
    """Тест получения своих задач"""
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    # Создаём доску и задачи
    board_response = create_board(title="My Board", token=user_token)
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    create_task(board_id, title="My Task 1", token=user_token)
    create_task(board_id, title="My Task 2", token=user_token)
    
    # Получаем свои задачи
    url = f"{BASE_URL}/users/me/tasks"
    response = requests.get(url, headers=headers)
    
    assert response.status_code == 200
    assert len(response.json()) >= 2
    print(f"✓ Found {len(response.json())} my tasks")


@allure.feature("Пользователи")
@allure.story("Обновление аватара")
def test_update_user_avatar():
    """Тест обновления аватара пользователя"""
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    # Получаем ID пользователя
    board_response = create_board(title="My Board", token=user_token)
    assert board_response.status_code == 201
    user_id = board_response.json()["created_by"]
    
    # Обновляем аватар
    url = f"{BASE_URL}/users/{user_id}/avatar"
    payload = {"avatar_url": "https://example.com/avatar.jpg"}
    response = requests.put(url, json=payload, headers=headers)
    
    assert response.status_code == 200
    assert "Avatar updated" in response.json()["message"]
    print(f"✓ Avatar updated for user {user_id}")


@allure.feature("Пользователи")
@allure.story("Получение аватара")
def test_get_user_avatar():
    """Тест получения аватара пользователя"""
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    # Получаем ID пользователя
    board_response = create_board(title="My Board", token=user_token)
    assert board_response.status_code == 201
    user_id = board_response.json()["created_by"]
    
    # Устанавливаем аватар
    set_response = requests.put(f"{BASE_URL}/users/{user_id}/avatar", 
                 json={"avatar_url": "https://example.com/avatar.jpg"}, 
                 headers=headers)
    assert set_response.status_code == 200
    
    # Получаем аватар
    url = f"{BASE_URL}/users/{user_id}/avatar"
    response = requests.get(url, headers=headers)
    
    assert response.status_code == 200
    assert "avatar_url" in response.json()
    print(f"✓ Got avatar for user {user_id}: {response.json()['avatar_url']}")


# ==================== ЛОГИ АУДИТА ====================

@allure.feature("Логи аудита")
@allure.story("Получение логов")
def test_get_audit_logs():
    """Тест получения логов аудита"""
    # Используем обычного пользователя
    user_token = get_user_token()
    assert user_token is not None
    headers = get_auth_headers(user_token)
    
    # Получаем логи
    url = f"{BASE_URL}/logs"
    response = requests.get(url, headers=headers)
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    print(f"✓ Got {len(response.json())} audit logs")
