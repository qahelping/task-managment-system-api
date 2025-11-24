"""
Сервис для работы с задачами.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.models.task import Task
from app.models.board import Board
from app.schemas.task import TaskCreate, TaskUpdate


def get_task_by_id(db: Session, task_id: int) -> Optional[Task]:
    """Получить задачу по ID"""
    return db.query(Task).filter(Task.id == task_id).first()


def get_tasks_by_board(
    db: Session,
    board_id: int,
    status_filter: Optional[str] = None,
    priority_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Task]:
    """
    Получить список задач на доске с опциональной фильтрацией.
    """
    query = db.query(Task).filter(Task.board_id == board_id)
    
    if status_filter:
        query = query.filter(Task.status == status_filter)
    
    if priority_filter:
        query = query.filter(Task.priority == priority_filter)
    
    return query.offset(skip).limit(limit).all()


def create_task(db: Session, board_id: int, task_data: TaskCreate, user_id: int) -> Task:
    """Создать новую задачу"""
    db_task = Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        priority=task_data.priority,
        board_id=board_id,
        created_by=user_id
    )
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    return db_task


def update_task(db: Session, task_id: int, task_data: TaskUpdate) -> Task:
    """Обновить задачу"""
    db_task = get_task_by_id(db, task_id)
    
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Обновление полей
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    db.commit()
    db.refresh(db_task)
    
    return db_task


def delete_task(db: Session, task_id: int) -> bool:
    """Удалить задачу"""
    db_task = get_task_by_id(db, task_id)
    
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db.delete(db_task)
    db.commit()
    
    return True


def move_task(db: Session, task_id: int, target_board_id: int) -> Task:
    """Перенести задачу на другую доску"""
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    target_board = db.query(Board).filter(Board.id == target_board_id).first()
    if not target_board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target board not found"
        )
    
    task.board_id = target_board_id
    db.commit()
    db.refresh(task)
    
    return task


def update_task_status(db: Session, task_id: int, new_status: str) -> Task:
    """Изменить статус задачи"""
    valid_statuses = ["todo", "in_progress", "done"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )
    
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task.status = new_status
    db.commit()
    db.refresh(task)
    
    return task


def get_next_status(current_status: str) -> str:
    """Получить следующий статус"""
    status_flow = {
        "todo": "in_progress",
        "in_progress": "done",
        "done": "done"  # Остаётся на done
    }
    return status_flow.get(current_status, "todo")


def update_task_to_next_status(db: Session, task_id: int) -> Task:
    """Изменить статус задачи на следующий"""
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    next_status = get_next_status(task.status)
    task.status = next_status
    db.commit()
    db.refresh(task)
    
    return task


def update_task_priority(db: Session, task_id: int, new_priority: str) -> Task:
    """Изменить приоритет задачи"""
    valid_priorities = ["low", "medium", "high"]
    if new_priority not in valid_priorities:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid priority. Must be one of: {valid_priorities}"
        )
    
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task.priority = new_priority
    db.commit()
    db.refresh(task)
    
    return task


def search_tasks(db: Session, query: str, skip: int = 0, limit: int = 100) -> List[Task]:
    """Поиск задач по тексту (title и description)"""
    search_term = f"%{query}%"
    tasks = db.query(Task).filter(
        or_(
            Task.title.ilike(search_term),
            Task.description.ilike(search_term)
        )
    ).offset(skip).limit(limit).all()
    
    return tasks


def bulk_update_status(db: Session, task_ids: List[int], new_status: str) -> int:
    """Массовое изменение статуса задач"""
    valid_statuses = ["todo", "in_progress", "done"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )
    
    updated = db.query(Task).filter(Task.id.in_(task_ids)).update(
        {"status": new_status},
        synchronize_session=False
    )
    db.commit()
    
    return updated


def bulk_delete_tasks(db: Session, task_ids: List[int]) -> int:
    """Массовое удаление задач"""
    deleted = db.query(Task).filter(Task.id.in_(task_ids)).delete(synchronize_session=False)
    db.commit()
    
    return deleted


def reorder_tasks(db: Session, board_id: int, ordered_ids: List[int]) -> bool:
    """Изменение порядка задач на доске"""
    # Обновляем порядок для каждой задачи
    for index, task_id in enumerate(ordered_ids):
        task = get_task_by_id(db, task_id)
        if task and task.board_id == board_id:
            task.order = index
    
    db.commit()
    return True

