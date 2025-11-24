"""
Роутер для статистики и аналитики.
"""
from typing import Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.board import Board
from app.models.task import Task
from app.models.user import User
from app.core.security import get_current_user_id

router = APIRouter(prefix="/stats", tags=["Statistics"])


@router.get("/tasks")
def get_global_task_stats(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Получить глобальную статистику по задачам.
    """
    boards_count = db.query(Board).count()
    tasks_total = db.query(Task).count()
    tasks_done = db.query(Task).filter(Task.status == "done").count()
    
    return {
        "boards": boards_count,
        "tasks_total": tasks_total,
        "done": tasks_done
    }


@router.get("/users/{user_id}/activity")
def get_user_activity(
    user_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Получить активность пользователя.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    created_tasks = db.query(Task).filter(Task.created_by == user_id).count()
    updated_tasks = db.query(Task).filter(
        Task.created_by == user_id,
        Task.updated_at != Task.created_at
    ).count()
    boards_created = db.query(Board).filter(Board.created_by == user_id).count()
    
    return {
        "created_tasks": created_tasks,
        "updated_tasks": updated_tasks,
        "boards_created": boards_created
    }

