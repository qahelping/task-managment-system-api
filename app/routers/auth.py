"""
Роутер для аутентификации.
Регистрация первого админа и логин.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import RegisterAdminRequest, LoginRequest, TokenResponse
from app.services import user_service
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register-admin", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_admin(
    admin_data: RegisterAdminRequest,
    db: Session = Depends(get_db)
):
    """
    Регистрация первого администратора.
    Доступно только если в системе нет ни одного пользователя.
    """
    # Проверка, что нет других пользователей
    user_count = user_service.count_users(db)
    if user_count > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin already exists. Registration is disabled."
        )
    
    # Создание первого администратора
    from app.schemas.user import UserCreate
    user_data = UserCreate(
        username=admin_data.username,
        email=admin_data.email,
        password=admin_data.password
    )
    
    user = user_service.create_user(db, user_data)
    
    # Создание токена
    access_token = create_access_token(data={"sub": user.id})
    
    return TokenResponse(access_token=access_token)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: RegisterAdminRequest,
    db: Session = Depends(get_db)
):
    """
    Регистрация обычного пользователя.
    Доступно всем.
    """
    from app.schemas.user import UserCreate
    
    # Создание обычного пользователя
    new_user_data = UserCreate(
        username=user_data.username,
        email=user_data.email,
        password=user_data.password
    )
    
    user = user_service.create_regular_user(db, new_user_data)
    
    # Создание токена
    access_token = create_access_token(data={"sub": user.id})
    
    return TokenResponse(access_token=access_token)


@router.post("/register-guest", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_guest(
    user_data: RegisterAdminRequest,
    db: Session = Depends(get_db)
):
    """
    Регистрация гостя (пользователя с ограниченными правами).
    Гости могут только просматривать публичные доски и их задачи.
    """
    from app.schemas.user import UserCreate
    
    # Создание гостя
    new_user_data = UserCreate(
        username=user_data.username,
        email=user_data.email,
        password=user_data.password
    )
    
    user = user_service.create_guest_user(db, new_user_data)
    
    # Создание токена
    access_token = create_access_token(data={"sub": user.id})
    
    return TokenResponse(access_token=access_token)


@router.post("/login", response_model=TokenResponse)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Вход в систему.
    Возвращает JWT токен.
    """
    # Поиск пользователя по email
    user = user_service.get_user_by_email(db, login_data.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Проверка пароля
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Создание токена
    access_token = create_access_token(data={"sub": user.id})
    
    return TokenResponse(access_token=access_token)

