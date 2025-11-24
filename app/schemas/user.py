"""
Pydantic схемы для пользователей.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    """Схема создания пользователя"""
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., pattern=r"^[^@]+@[^@]+\.[^@]+$")
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    """Схема ответа с данными пользователя"""
    id: int
    username: str
    email: str
    role: str
    avatar_url: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class PasswordUpdate(BaseModel):
    """Схема обновления пароля"""
    new_password: str = Field(..., min_length=6)


class AvatarUpdate(BaseModel):
    """Схема обновления аватара"""
    avatar_url: str = Field(..., min_length=1)
