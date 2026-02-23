"""
Роутер для статистики и аналитики.
"""
from typing import Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from typing import List
from app.database import get_db
from app.models.board import Board
from app.models.task import Task
from app.models.user import User
from app.core.security import get_current_user_id
from app.services import user_service
from app.schemas.board import BoardResponse
from app.schemas.task import TaskResponse

router = APIRouter(prefix="/stats", tags=["Statistics"])


@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Получить статистику для дашборда.
    Возвращает общее количество досок и задач, а также распределение задач по статусам.
    """
    # Подсчет досок (только неархивированных)
    total_boards = db.query(Board).filter(Board.archived == False).count()
    
    # Подсчет всех задач
    total_tasks = db.query(Task).count()
    
    # Подсчет задач по статусам
    tasks_todo = db.query(Task).filter(Task.status == "todo").count()
    tasks_in_progress = db.query(Task).filter(Task.status == "in_progress").count()
    tasks_done = db.query(Task).filter(Task.status == "done").count()
    
    return {
        "total_boards": total_boards,
        "total_tasks": total_tasks,
        "tasks_by_status": {
            "todo": tasks_todo,
            "in_progress": tasks_in_progress,
            "done": tasks_done
        }
    }


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


@router.get("/admin/all-boards")
def get_all_boards_admin(
    skip: int = 0,
    limit: int = 100,
    archived: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Получить все доски (только для администратора).
    """
    current_user = user_service.get_user_by_id(db, current_user_id)
    if not current_user or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access this endpoint"
        )
    
    query = db.query(Board)
    if archived is not None:
        query = query.filter(Board.archived == archived)
    
    total_query = query
    boards = query.offset(skip).limit(limit).all()
    total = total_query.count()
    
    return {
        "boards": [BoardResponse.model_validate(board) for board in boards],
        "total": total
    }


@router.get("/admin/all-tasks")
def get_all_tasks_admin(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    priority_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Получить все задачи (только для администратора).
    """
    current_user = user_service.get_user_by_id(db, current_user_id)
    if not current_user or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access this endpoint"
        )
    
    query = db.query(Task)
    
    if status_filter:
        query = query.filter(Task.status == status_filter)
    if priority_filter:
        query = query.filter(Task.priority == priority_filter)
    
    total_query = query
    tasks = query.offset(skip).limit(limit).all()
    total = total_query.count()
    
    return {
        "tasks": [TaskResponse.model_validate(task) for task in tasks],
        "total": total
    }

