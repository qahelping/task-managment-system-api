"""
Модель лога аудита.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class AuditLog(Base):
    """Лог аудита действий пользователей"""
    
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Может быть None для системных действий
    action = Column(String, nullable=False, index=True)  # create, update, delete, login, etc.
    entity_type = Column(String, nullable=False, index=True)  # board, task, user, etc.
    entity_id = Column(Integer, nullable=True)  # ID сущности
    details = Column(Text, nullable=True)  # Дополнительная информация в JSON
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    user = relationship("User")

