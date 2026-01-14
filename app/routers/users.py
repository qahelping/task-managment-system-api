"""
Роутер для работы с пользователями.
Только для администраторов.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserResponse, PasswordUpdate, AvatarUpdate
from app.services import user_service
from app.core.security import get_current_user_id

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/public", response_model=List[UserResponse])
def get_public_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Получить список всех пользователей (публичный эндпоинт).
    Не требует аутентификации.
    Используется для отображения тестовых пользователей на страницах логина/регистрации.
    """
    users = user_service.get_all_users(db, skip=skip, limit=limit)
    return users


@router.get("/me", response_model=UserResponse)
def get_current_user(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Получить информацию о текущем пользователе.
    Требуется аутентификация.
    """
    user = user_service.get_user_by_id(db, current_user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.get("/", response_model=List[UserResponse])
def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Получить список всех пользователей.
    Требуется аутентификация.
    """
    users = user_service.get_all_users(db, skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Получить пользователя по ID.
    Требуется аутентификация.
    """
    user = user_service.get_user_by_id(db, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.put("/{user_id}/password")
def update_user_password(
    user_id: int,
    payload: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Обновить пароль пользователя.
    Пользователь может обновить только свой пароль.
    """
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own password"
        )
    
    from app.core.security import get_password_hash
    user = user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.password_hash = get_password_hash(payload.new_password)
    db.commit()
    db.refresh(user)
    
    return {"message": "Password updated successfully"}


@router.get("/me/tasks")
def get_my_tasks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Получить все задачи, созданные текущим пользователем.
    """
    from app.models.task import Task
    
    tasks = db.query(Task).filter(
        Task.created_by == current_user_id
    ).offset(skip).limit(limit).all()
    
    return tasks


@router.put("/{user_id}/avatar")
def update_user_avatar(
    user_id: int,
    payload: AvatarUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Обновить аватар пользователя.
    """
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own avatar"
        )
    
    user = user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.avatar_url = payload.avatar_url
    db.commit()
    db.refresh(user)
    
    return {"message": "Avatar updated successfully", "avatar_url": user.avatar_url}


@router.get("/{user_id}/avatar")
def get_user_avatar(
    user_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Получить аватар пользователя по его ID.
    """
    user = user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"user_id": user_id, "avatar_url": user.avatar_url or None}

