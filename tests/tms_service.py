from app.models import Board
from tests.base_sevice import BaseService
from tests.models import BoardCreate

DOMAIN = "http://localhost:8000"


class TmsService(BaseService):

    def login(self, email, password):
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

    def create_board(self, board_create: BoardCreate):
        url = f"{DOMAIN}/boards/"
        body = {"title": board_create.title, "description": board_create.description, "public": board_create.public}
        # Токен берется из pytest.token автоматически

        response = self.post(url, token=None, body=body, code=201)
        return Board(**response)

    def create_task(self, board_id, title, description, status, priority):
        url = f"{DOMAIN}/boards/{board_id}/tasks"
        body = {"title": title, "description": description, "status": status, "priority": priority}
        # Токен берется из pytest.token автоматически
        response = self.post(url, token=None, body=body, code=201)
        return response

    def get_users(self, skip=0, limit=100, code=200):
        url = f"{DOMAIN}/users/?skip={skip}&limit={limit}"
        # Токен берется из pytest.token автоматически
        response = self.get(url, code=code)
        return response
