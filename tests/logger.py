import logging
import os


def create_logger():
    logger = logging.getLogger()

    logger_level = os.getenv("LOGGER_LEVEL", "ERROR")
    if logger_level == "INFO":
        logger.setLevel(logging.INFO)
    elif logger_level == "CRITICAL":
        logger.setLevel(logging.CRITICAL)
    elif logger_level == "DEBUG":
        logger.setLevel(logging.DEBUG)

    # Создаем обработчик для вывода логов в консоль
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)

    # Создаем обработчик для записи логов в файл
    file_handler = logging.FileHandler("request.log")
    file_handler.setLevel(logging.INFO)

    # Форматирование логов
    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    console_handler.setFormatter(formatter)
    file_handler.setFormatter(formatter)

    # Добавляем обработчики к логгеру
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return logger


logger = create_logger()
