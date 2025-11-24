"""
Сервис для работы с досками.
"""
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.board import Board
from app.models.board_member import BoardMember
from app.models.task import Task
from app.schemas.board import BoardCreate, BoardUpdate


def get_board_by_id(db: Session, board_id: int) -> Optional[Board]:
    """Получить доску по ID"""
    return db.query(Board).filter(Board.id == board_id).first()


def get_all_boards(db: Session, skip: int = 0, limit: int = 100, archived: bool = False) -> List[Board]:
    """Получить список всех досок"""
    query = db.query(Board).filter(Board.archived == archived)
    return query.offset(skip).limit(limit).all()


def create_board(db: Session, board_data: BoardCreate, user_id: int) -> Board:
    """Создать новую доску"""
    db_board = Board(
        title=board_data.title,
        description=board_data.description,
        public=getattr(board_data, 'public', False),
        created_by=user_id
    )
    
    db.add(db_board)
    db.commit()
    db.refresh(db_board)
    
    return db_board


def update_board(db: Session, board_id: int, board_data: BoardUpdate) -> Board:
    """Обновить доску"""
    db_board = get_board_by_id(db, board_id)
    
    if not db_board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    # Обновление полей
    update_data = board_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_board, field, value)
    
    db.commit()
    db.refresh(db_board)
    
    return db_board


def delete_board(db: Session, board_id: int) -> bool:
    """Удалить доску"""
    db_board = get_board_by_id(db, board_id)
    
    if not db_board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    db.delete(db_board)
    db.commit()
    
    return True


def add_member(db: Session, board_id: int, user_id: int) -> BoardMember:
    """Добавить участника на доску"""
    # Проверяем что участник ещё не добавлен
    existing = db.query(BoardMember).filter(
        BoardMember.board_id == board_id,
        BoardMember.user_id == user_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this board"
        )
    
    member = BoardMember(board_id=board_id, user_id=user_id)
    db.add(member)
    db.commit()
    db.refresh(member)
    
    return member


def remove_member(db: Session, board_id: int, user_id: int) -> bool:
    """Удалить участника с доски"""
    member = db.query(BoardMember).filter(
        BoardMember.board_id == board_id,
        BoardMember.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not a member of this board"
        )
    
    db.delete(member)
    db.commit()
    
    return True


def get_board_members(db: Session, board_id: int) -> List[BoardMember]:
    """Получить список участников доски"""
    return db.query(BoardMember).filter(BoardMember.board_id == board_id).all()


def archive_board(db: Session, board_id: int) -> Board:
    """Архивировать доску"""
    board = get_board_by_id(db, board_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    board.archived = True
    db.commit()
    db.refresh(board)
    
    return board


def get_board_stats(db: Session, board_id: int) -> Dict:
    """Получить статистику по задачам на доске"""
    board = get_board_by_id(db, board_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    total = db.query(Task).filter(Task.board_id == board_id).count()
    todo = db.query(Task).filter(Task.board_id == board_id, Task.status == "todo").count()
    in_progress = db.query(Task).filter(Task.board_id == board_id, Task.status == "in_progress").count()
    done = db.query(Task).filter(Task.board_id == board_id, Task.status == "done").count()
    
    return {
        "total": total,
        "todo": todo,
        "in_progress": in_progress,
        "done": done
    }

