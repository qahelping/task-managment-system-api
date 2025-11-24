"""
Pydantic схемы для аутентификации.
"""
from pydantic import BaseModel, EmailStr, Field


class RegisterAdminRequest(BaseModel):
    """Схема регистрации первого администратора"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    """Схема запроса на вход"""
    email: EmailStr
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    """Схема ответа с токеном"""
    access_token: str
    token_type: str = "bearer"

