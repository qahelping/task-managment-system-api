"""
Роутер для работы с задачами.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, BulkStatusUpdate, BulkDelete, ReorderTasks
from app.services import task_service, board_service, user_service
from app.core.security import get_current_user_id, check_board_access

router = APIRouter(tags=["Tasks"])


@router.get("/boards/{board_id}/tasks", response_model=List[TaskResponse])
def get_tasks(
    board_id: int,
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Получить список задач на доске.
    Поддерживает фильтрацию по status и priority.
    Требуется аутентификация.
    Гости могут просматривать задачи только на публичных досках.
    """
    # Проверка существования доски
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
    
    tasks = task_service.get_tasks_by_board(
        db, board_id,
        status_filter=status_filter,
        priority_filter=priority_filter,
        skip=skip,
        limit=limit
    )
    return tasks


@router.post("/boards/{board_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    board_id: int,
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Создать новую задачу на доске.
    Требуется аутентификация.
    """
    # Проверка существования доски
    board = board_service.get_board_by_id(db, board_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    task = task_service.create_task(db, board_id, task_data, current_user_id)
    return task


@router.get("/boards/{board_id}/tasks/{task_id}", response_model=TaskResponse)
def get_task(
    board_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Получить задачу по ID.
    Требуется аутентификация.
    """
    task = task_service.get_task_by_id(db, task_id)
    
    if not task or task.board_id != board_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task


@router.put("/boards/{board_id}/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    board_id: int,
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Обновить задачу.
    Требуется аутентификация.
    """
    # Проверка существования задачи
    task = task_service.get_task_by_id(db, task_id)
    if not task or task.board_id != board_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task = task_service.update_task(db, task_id, task_data)
    return task


@router.delete("/boards/{board_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    board_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Удалить задачу.
    Требуется аутентификация.
    """
    # Проверка существования задачи
    task = task_service.get_task_by_id(db, task_id)
    if not task or task.board_id != board_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task_service.delete_task(db, task_id)
    return None


@router.put("/boards/{board_id}/tasks/{task_id}/move-to/{target_board_id}", response_model=TaskResponse)
def move_task_to_board(
    board_id: int,
    task_id: int,
    target_board_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Перенести задачу на другую доску.
    """
    task = task_service.get_task_by_id(db, task_id)
    if not task or task.board_id != board_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task = task_service.move_task(db, task_id, target_board_id)
    return task


@router.put("/tasks/{task_id}/status/{new_status}", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Изменить статус задачи одной кнопкой.
    """
    task = task_service.update_task_status(db, task_id, new_status)
    return task


@router.put("/tasks/{task_id}/next-status", response_model=TaskResponse)
def update_task_to_next_status(
    task_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Изменить статус задачи на следующий.
    Логика: todo → in_progress → done → done
    """
    task = task_service.update_task_to_next_status(db, task_id)
    return task


@router.put("/tasks/{task_id}/priority/{new_priority}", response_model=TaskResponse)
def update_task_priority(
    task_id: int,
    new_priority: str,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Изменить приоритет задачи.
    """
    task = task_service.update_task_priority(db, task_id, new_priority)
    return task


@router.get("/tasks/search", response_model=List[TaskResponse])
def search_tasks(
    q: str = Query(..., min_length=1),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Поиск задач по тексту (title и description).
    """
    tasks = task_service.search_tasks(db, q, skip=skip, limit=limit)
    return tasks


@router.put("/boards/{board_id}/tasks/bulk/status")
def bulk_update_task_status(
    board_id: int,
    payload: BulkStatusUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Массовое изменение статуса задач.
    """
    updated = task_service.bulk_update_status(db, payload.task_ids, payload.new_status)
    return {"updated": updated, "message": f"Updated {updated} tasks to status '{payload.new_status}'"}


@router.post("/boards/{board_id}/tasks/bulk/delete", status_code=status.HTTP_200_OK)
def bulk_delete_tasks(
    board_id: int,
    payload: BulkDelete,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Массовое удаление задач.
    Использует POST вместо DELETE для передачи body.
    """
    deleted = task_service.bulk_delete_tasks(db, payload.task_ids)
    return {"deleted": deleted, "message": f"Deleted {deleted} tasks"}


@router.put("/boards/{board_id}/tasks/reorder")
def reorder_tasks(
    board_id: int,
    payload: ReorderTasks,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Изменение порядка задач на доске.
    """
    # Проверяем существование доски и доступ
    from app.services import board_service
    from app.core.security import check_board_access
    from app.services import user_service
    
    board = board_service.get_board_by_id(db, board_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    user = user_service.get_user_by_id(db, current_user_id)
    if user:
        check_board_access(board, current_user_id, user.role, action="write")
    
    task_service.reorder_tasks(db, board_id, payload.ordered_ids)
    return {"message": "Tasks reordered successfully"}

