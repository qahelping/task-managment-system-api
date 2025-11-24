"""
Модуль безопасности для работы с JWT токенами и паролями.
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
import jwt

from app.core.config import settings

# Контекст для хэширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer схема для извлечения токена из заголовка
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка пароля"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Хэширование пароля"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Создание JWT токена"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")
    
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """Декодирование JWT токена"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    """Получение ID текущего пользователя из токена"""
    token = credentials.credentials
    payload = decode_access_token(token)
    user_id: int = payload.get("sub")
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    return user_id


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Получение текущего пользователя с полными данными"""
    from sqlalchemy.orm import Session
    from app.database import get_db
    from app.services import user_service
    
    token = credentials.credentials
    payload = decode_access_token(token)
    user_id: int = payload.get("sub")
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    # Получаем БД из контекста
    # Это будет работать только если вызывается через Depends
    return {"user_id": user_id}


def check_board_access(board, user_id: int, user_role: str, action: str = "read"):
    """
    Проверка прав доступа к доске.
    
    Args:
        board: Объект доски
        user_id: ID пользователя
        user_role: Роль пользователя (admin, user, guest)
        action: Действие (read, write, delete)
    """
    # Админы имеют полный доступ
    if user_role == "admin":
        return True
    
    # Владелец доски имеет полный доступ
    if board.created_by == user_id:
        return True
    
    # Обычные пользователи имеют доступ к своим доскам
    if user_role == "user" and action != "read":
        if board.created_by != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to modify this board"
            )
        return True
    
    # Гости могут только просматривать публичные доски
    if user_role == "guest":
        if action != "read":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Guests can only view public boards"
            )
        if not board.public:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This board is private. Guests can only view public boards"
            )
        return True
    
    # Все пользователи могут читать публичные доски
    if action == "read" and board.public:
        return True
    
    # По умолчанию запрещаем доступ
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied"
    )
