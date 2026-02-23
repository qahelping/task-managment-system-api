from playwright.sync_api import Page, expect


class TaskPage(BasePage):
    """
    Page Object для страницы задачи в TMS.
    Содержит локаторы и методы для взаимодействия с задачей.
    """

    def __init__(self, page: Page):
        super().__init__(page)
        self.page = page

        # --- Locators ---
        self.assign_to_me_button = page.locator("button:has-text('Assign to me')")
        self.assignee_field = page.locator("[data-testid='assignee-name']")
        self.loader = page.locator("[data-testid='loader']")

    # --- Actions ---

    def open_task(self, task_id: int) -> None:
        """
        Открывает страницу задачи по её ID.

        :param task_id: Идентификатор задачи.
        """
        url = f"{self.base_url}/tasks/{task_id}"
        self.page.goto(url)
        self.page.wait_for_load_state("networkidle")

    def assign_on_current_user(self) -> None:
        """
        Назначает текущего авторизованного пользователя
        ответственным за задачу.
        """
        expect(self.assign_to_me_button).to_be_visible()
        self.assign_to_me_button.click()

        # Ожидание завершения запроса/обновления UI
        self.page.wait_for_load_state("networkidle")
