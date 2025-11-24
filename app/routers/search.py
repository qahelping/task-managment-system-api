"""
Роутер для глобального поиска.
"""
from typing import List, Dict
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.board import Board
from app.models.task import Task
from app.models.user import User
from app.core.security import get_current_user_id

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("")
def global_search(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Глобальный поиск по системе.
    Ищет доски, задачи и пользователей.
    """
    search_term = f"%{q}%"
    
    # Поиск досок
    boards = db.query(Board).filter(
        or_(
            Board.title.ilike(search_term),
            Board.description.ilike(search_term)
        )
    ).limit(10).all()
    
    # Поиск задач
    tasks = db.query(Task).filter(
        or_(
            Task.title.ilike(search_term),
            Task.description.ilike(search_term)
        )
    ).limit(10).all()
    
    # Поиск пользователей (по username)
    users = db.query(User).filter(
        User.username.ilike(search_term)
    ).limit(10).all()
    
    return {
        "boards": [
            {"id": b.id, "title": b.title, "description": b.description}
            for b in boards
        ],
        "tasks": [
            {"id": t.id, "title": t.title, "description": t.description, "board_id": t.board_id}
            for t in tasks
        ],
        "users": [
            {"id": u.id, "username": u.username, "email": u.email}
            for u in users
        ]
    }

