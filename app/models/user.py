"""
Модель пользователя.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    """Пользователь системы"""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="admin", nullable=False)
    avatar_url = Column(String, nullable=True)  # URL аватара пользователя
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    boards = relationship("Board", back_populates="creator", cascade="all, delete-orphan")
    tasks = relationship("Task", foreign_keys="Task.created_by", back_populates="creator", cascade="all, delete-orphan")
    assigned_tasks = relationship("Task", foreign_keys="Task.assignee_id", back_populates="assignee")
    board_memberships = relationship("BoardMember", back_populates="user", cascade="all, delete-orphan")
