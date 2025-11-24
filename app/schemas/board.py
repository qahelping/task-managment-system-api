"""
Pydantic схемы для досок.
"""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from pydantic import BaseModel, Field

if TYPE_CHECKING:
    from app.schemas.task import TaskResponse


class BoardCreate(BaseModel):
    """Схема создания доски"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    public: bool = False  # По умолчанию доска приватная


class BoardUpdate(BaseModel):
    """Схема обновления доски"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    public: Optional[bool] = None  # Можно изменить статус публичности
    archived: Optional[bool] = None  # Можно изменить статус архивации


class BoardResponse(BaseModel):
    """Схема ответа с данными доски"""
    id: int
    title: str
    description: Optional[str]
    public: bool
    archived: bool
    created_by: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class BoardWithTasks(BoardResponse):
    """Схема доски с задачами"""
    tasks: List[TaskResponse] = []
    
    class Config:
        from_attributes = True


# Import and rebuild model to resolve forward references
from app.schemas.task import TaskResponse

# Pydantic v2 uses model_rebuild(), v1 uses update_forward_refs()
if hasattr(BoardWithTasks, 'model_rebuild'):
    BoardWithTasks.model_rebuild()
else:
    BoardWithTasks.update_forward_refs()

