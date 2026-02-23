import pytest
import requests

from tests.logger import logger


class BaseService:

    @staticmethod
    def request(method, url, body, code):
        if pytest.token:
            headers = {"Authorization": f"Bearer {pytest.token}"}
        else:
            headers = None
        try:
            response = requests.request(method, url, headers=headers, json=body)
            if code is None:
                response.raise_for_status()
            else:
                assert response.status_code == code
            logger.info("OK. URL: %s, Code: %d, Response: %s", url, response.status_code, response.json())
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error("Error. %s", str(e))
            return None

    def post(self, url, token, body=None, code=None):
        return self.request("POST", url, body, code)

    def delete(self, url, body=None, code=None):
        return self.request("DELETE", url, body, code)



    def put(self, url, body=None, code=None):
        return self.request("POST", url, body, code)

    def get(self, url, code=None):
        return self.request("POST", url, None, code)


from playwright.sync_api import Page, expect


class BasePage:
    """
    Базовый Page Object.

    Содержит:
    - инициализацию страницы
    - базовый URL
    - общие локаторы
    - универсальные методы ожидания и взаимодействия
    """

    def __init__(self, page: Page, base_url: str):
        self.page = page
        self.base_url = base_url

        # --- Common locators ---
        self.loader = page.locator("[data-testid='loader']")
        self.toast = page.locator("[role='alert']")
        self.header = page.locator("header")

    # --- Navigation ---

    def open(self, path: str = "") -> None:
        """
        Открывает страницу по относительному пути.

        :param path: относительный путь (например: '/tasks/1')
        """
        url = f"{self.base_url}{path}"
        self.page.goto(url)
        self.wait_for_page_loaded()

    # --- Waits ---

    def wait_for_page_loaded(self) -> None:
        """
        Ожидает полной загрузки страницы.
        """
        self.page.wait_for_load_state("networkidle")

    def wait_for_loader_hidden(self) -> None:
        """
        Ожидает исчезновения лоадера.
        """
        if self.loader.count() > 0:
            expect(self.loader).to_be_hidden()

    # --- Actions ---

    def click(self, locator) -> None:
        """
        Кликает по элементу с ожиданием видимости.

        :param locator: Playwright locator
        """
        expect(locator).to_be_visible()
        locator.click()

    def fill(self, locator, value: str) -> None:
        """
        Заполняет поле значением.

        :param locator: Playwright locator
        :param value: текст для ввода
        """
        expect(locator).to_be_visible()
        locator.fill(value)

    # --- Assertions ---

    def should_be_visible(self, locator) -> None:
        """
        Проверяет, что элемент отображается.
        """
        expect(locator).to_be_visible()

    def should_have_text(self, locator, text: str) -> None:
        """
        Проверяет текст элемента.

        :param locator: Playwright locator
        :param text: ожидаемый текст
        """
        expect(locator).to_have_text(text)
