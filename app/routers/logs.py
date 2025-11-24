"""
Роутер для логов аудита.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import audit_service
from app.core.security import get_current_user_id

router = APIRouter(prefix="/logs", tags=["Audit Logs"])


@router.get("")
def get_audit_logs(
    user_id: Optional[int] = Query(None),
    action: Optional[str] = Query(None),
    entity: Optional[str] = Query(None, alias="entity_type"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """
    Получить логи аудита с фильтрацией.
    """
    logs = audit_service.get_logs(
        db,
        user_id=user_id,
        action=action,
        entity_type=entity,
        skip=skip,
        limit=limit
    )
    
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "created_at": log.created_at
        }
        for log in logs
    ]

