"""
Роутер для работы с досками.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.board import BoardCreate, BoardUpdate, BoardResponse, BoardWithTasks
from app.schemas.task import TaskResponse
from app.services import board_service, user_service
from app.core.security import get_current_user_id, check_board_access

router = APIRouter(prefix="/boards", tags=["Boards"])


@router.get("/public", response_model=List[BoardResponse])
def get_public_boards(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Получить список всех публичных досок.
    Не требует аутентификации.
    """
    boards = board_service.get_public_boards(db, skip=skip, limit=limit)
    return boards


@router.get("/public/{board_id}", response_model=BoardWithTasks)
def get_public_board(
    board_id: int,
    db: Session = Depends(get_db)
):
    """
    Получить публичную доску по ID с задачами.
    Не требует аутентификации.
    Доступно только для публичных досок.
    """
    board = board_service.get_board_by_id(db, board_id)
    
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    if not board.public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This board is private. Only public boards can be accessed without authentication."
        )
    
    return board


@router.get("/", response_model=List[BoardResponse])
def get_boards(
    skip: int = 0,
    limit: int = 100,
    archived: bool = False,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Получить список всех досок.
    Требуется аутентификация.
    archived=true - получить только архивированные доски.
    """
    boards = board_service.get_all_boards(db, skip=skip, limit=limit, archived=archived)
    return boards


@router.post("/", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
def create_board(
    board_data: BoardCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Создать новую доску.
    Требуется аутентификация.
    """
    board = board_service.create_board(db, board_data, current_user_id)
    return board


@router.get("/{board_id}", response_model=BoardWithTasks)
def get_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Получить доску по ID с задачами.
    Требуется аутентификация.
    Гости могут просматривать только публичные доски.
    """
    board = board_service.get_board_by_id(db, board_id)
    
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    # Проверяем права доступа
    user = user_service.get_user_by_id(db, current_user_id)
    if user:
        check_board_access(board, current_user_id, user.role, action="read")
    
    return board


@router.put("/{board_id}", response_model=BoardResponse)
def update_board(
    board_id: int,
    board_data: BoardUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Обновить доску.
    Требуется аутентификация.
    Гости не могут обновлять доски.
    """
    # Проверяем существование доски
    board = board_service.get_board_by_id(db, board_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    # Проверяем права доступа
    user = user_service.get_user_by_id(db, current_user_id)
    if user:
        check_board_access(board, current_user_id, user.role, action="write")
    
    board = board_service.update_board(db, board_id, board_data)
    return board


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Удалить доску.
    Удаляются также все задачи на доске (cascade).
    Требуется аутентификация.
    Гости не могут удалять доски.
    """
    # Проверяем существование доски
    board = board_service.get_board_by_id(db, board_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    # Проверяем права доступа
    user = user_service.get_user_by_id(db, current_user_id)
    if user:
        check_board_access(board, current_user_id, user.role, action="delete")
    
    board_service.delete_board(db, board_id)
    return None


@router.post("/{board_id}/members/{user_id}", status_code=status.HTTP_201_CREATED)
def add_board_member(
    board_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Добавить участника на доску.
    Только владелец доски или администратор может добавлять участников.
    """
    board = board_service.get_board_by_id(db, board_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    user = user_service.get_user_by_id(db, current_user_id)
    if user.role != "admin" and board.created_by != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only board owner or admin can add members"
        )
    
    target_user = user_service.get_user_by_id(db, user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    board_service.add_member(db, board_id, user_id)
    return {"message": "User added to board"}


@router.delete("/{board_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_board_member(
    board_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Удалить участника с доски.
    """
    board = board_service.get_board_by_id(db, board_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    user = user_service.get_user_by_id(db, current_user_id)
    if user.role != "admin" and board.created_by != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only board owner or admin can remove members"
        )
    
    board_service.remove_member(db, board_id, user_id)
    return None


@router.get("/{board_id}/members")
def get_board_members(
    board_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Получить список участников доски.
    """
    board = board_service.get_board_by_id(db, board_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    members = board_service.get_board_members(db, board_id)
    return [{"id": m.user.id, "username": m.user.username, "email": m.user.email} for m in members]


@router.put("/{board_id}/archive", response_model=BoardResponse)
def archive_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Архивировать доску.
    Архивированная доска скрывается из обычного списка.
    """
    board = board_service.get_board_by_id(db, board_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    user = user_service.get_user_by_id(db, current_user_id)
    if user.role != "admin" and board.created_by != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only board owner or admin can archive board"
        )
    
    board = board_service.archive_board(db, board_id)
    return board


@router.get("/{board_id}/stats")
def get_board_stats(
    board_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Получить статистику по задачам на доске.
    """
    board = board_service.get_board_by_id(db, board_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    stats = board_service.get_board_stats(db, board_id)
    return stats

