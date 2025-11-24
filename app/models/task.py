"""
Модель задачи.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Task(Base):
    """Задача на доске"""
    
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="todo", nullable=False)  # todo, in_progress, done
    priority = Column(String, default="medium", nullable=False)  # low, medium, high
    order = Column(Integer, default=0, nullable=False)  # Порядок сортировки задач
    parent_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)  # Для подзадач
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    board = relationship("Board", back_populates="tasks")
    creator = relationship("User", back_populates="tasks")
    parent_task = relationship("Task", remote_side=[id], backref="subtasks")
    comments = relationship("TaskComment", back_populates="task", cascade="all, delete-orphan")
