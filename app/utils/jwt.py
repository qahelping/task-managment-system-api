"""
Утилиты для работы с JWT токенами.
Обёртка над функциями из core.security для удобства использования.
"""

from app.core.security import create_access_token, decode_access_token


__all__ = ["create_access_token", "decode_access_token"]

