import os

import pytest
from faker import Faker

faker = Faker()


def test_assign_a_task_to_yourself(tms_service, db_client, login_page, task_page):
    # API: создание задачи и пользователя
    task_id = tms_service.create_task(title=faker.text(),
                                      description=faker.text())
    user = tms_service.create_user(first_name=faker.first_name(),
                                   last_name=faker.last_name())

    # UI: авторизация
    login_page.login(user)

    # UI: открытие созданной задачи и назначение на текущего пользователя
    task_page.open_task(task_id)
    task_page.assign_on_current_user()

    # UI: у задачи отображается имя переданный пользователя
    task_page.verify_assign(user)

    # DB: в БД в поле assign указан переданный пользователь
    db_client.verify_assign(task_id, user)


from tests.page_board import TaskPage
from tests.tms_service import TmsService

@pytest.fixture
def tms_service():
    return TmsService()


@pytest.fixture
def login_page():
    return TmsService()

@pytest.fixture
def task_page():
    return TaskPage()


@pytest.fixture
def task_page():
    return TaskPage()



# пример: consumer contract (Pact) — идея/скелет
# зависимости: pact-python (или аналогичный pact client)

from pact import Consumer, Provider
from pact.matchers import Like, EachLike, Term

pact = Consumer("web-app").has_pact_with(
    Provider("user-service"),
    host_name="localhost",
    port=1234
)

def test_assign_a_task_to_yourself(tms_service, db_client, login_page, task_page):
    # Arrange: создаём данные через API (быстро и стабильно)
    task_id = tms_service.create_task(
        title=faker.text(),
        description=faker.text()
    )

    user = tms_service.create_user(
        first_name=faker.first_name(),
        last_name=faker.last_name()
    )

    # Act: только ключевое пользовательское действие через UI
    # Авторизация: внутри для получения токена используется API
    login_page.login(user)
    task_page.open_task(task_id)
    task_page.assign_on_current_user()

    # Assert UI: пользователь видит себя назначенным
    task_page.verify_assign(user)

    # Assert DB: система реально сохранила изменение
    db_client.verify_assign(task_id, user)

#conftest.py
def pytest_addoption(parser):
    parser.addoption("--env", action="store", default="dev")
    parser.addoption("--base-url", action="store", default=None)


@pytest.fixture(scope="session")
def env(request) -> str:
    return request.config.getoption("--env")

