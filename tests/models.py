from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

class BoardCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Заголовок элемента")
    description: Optional[str] = Field(..., max_length=2000, description="Описание элемента")
    public: Optional[bool] = Field(default=False, description="Публичный доступ")

class Board(BaseModel):
    id: int = Field(..., gt=0, description="Идентификатор элемента")
    title: str = Field(..., min_length=1, max_length=255, description="Заголовок элемента")
    description: str = Field(..., max_length=2000, description="Описание элемента")
    public: bool = Field(default=False, description="Публичный доступ")
    archived: bool = Field(default=False, description="Архивирован ли элемент")
    created_by: int = Field(..., gt=0, description="ID создателя")
    created_at: datetime = Field(..., description="Дата и время создания")