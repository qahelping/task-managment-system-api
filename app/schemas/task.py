"""
Pydantic схемы для задач.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    """Схема создания задачи"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: str = Field(default="todo", pattern="^(todo|in_progress|done)$")
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")


class TaskUpdate(BaseModel):
    """Схема обновления задачи"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(todo|in_progress|done)$")
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")


class TaskResponse(BaseModel):
    """Схема ответа с данными задачи"""
    id: int
    title: str
    description: Optional[str]
    status: str
    priority: str
    board_id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class BulkStatusUpdate(BaseModel):
    """Схема массового изменения статуса"""
    task_ids: List[int]
    new_status: str = Field(..., pattern="^(todo|in_progress|done)$")


class BulkDelete(BaseModel):
    """Схема массового удаления"""
    task_ids: List[int]


class ReorderTasks(BaseModel):
    """Схема изменения порядка задач"""
    ordered_ids: List[int]
