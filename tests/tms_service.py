from app.models import Board
from tests.base_sevice import BaseService
from tests.models import BoardCreate

DOMAIN = "http://localhost:8000"


class TmsService(BaseService):
    """
    API методы для работы с сервисом TMS.

    Доступные операции:
    - создание пользователя: POST /register/users/
    - создание задачи: POST /tasks/
    """

    def create_task(self, title, description, priority='medium', code=201):
        """
        Создает новую задачу в сервисе TMS.

        :param title: Название задачи.
        :param description: Описание задачи.
        :param priority: Приоритет задачи. По умолчанию 'medium'.
        :param code: Ожидаемый HTTP-статус ответа. По умолчанию 201 (Created).
        :return: Объект ответа, возвращаемый методом self.post().
        """

        url = f"{DOMAIN}/tasks"
        body = {
            "title": title,
            "description": description,
            "status": "Backlog",
            "priority": priority,
        }

        response = self.post(url, token=None, body=body, code=code)
        return response

    def create_user(self, first_name, last_name, code=201):
        """
        Создает нового пользователя в сервисе TMS.

        :param first_name: Имя пользователя.
        :type first_name: str
        :param last_name: Фамилия пользователя.
        :type last_name: str
        :param code: Ожидаемый HTTP-статус ответа.
                     По умолчанию 201 (Created).
        :type code: int
        :return: Объект ответа, возвращаемый методом self.post().
        """

        url = f"{DOMAIN}/register/users/"
        body = {"name": first_name, "last_name": last_name}

        response = self.post(url, token=None, body=body, code=code)
        return response

    def create_board(self, board_create: BoardCreate):
        url = f"{DOMAIN}/boards/"

        response = self.post(url, token=None, body=board_create, code=201)
        return Board(**response)

    def login(self, email):
        url = f"{DOMAIN}/auth/login"
        body = {"email": email, "password": password}
        response = self.post(url, token=None, body=body, code=200)
        print(response)
        return response

    def register_admin(self, username, email, password, code=None):
        url = f"{DOMAIN}/auth/register-admin"
        body = {"username": username, "email": email, "password": password}
        # Для register-admin не нужен токен
        response = self.post(url, token=None, body=body, code=code)
        return response

    def get_users(self, skip=0, limit=100, code=200):
        url = f"{DOMAIN}/users/?skip={skip}&limit={limit}"
        # Токен берется из pytest.token автоматически
        response = self.get(url, code=code)
        return response

    def create_user(self, first_name, last_name):
        url = f"{DOMAIN}/users/?skip={skip}&limit={limit}"
        # Токен берется из pytest.token автоматически
        response = self.get(url, code=code)
        return response
