"""
Схемы для банковских карточек.
"""
from pydantic import BaseModel
from typing import Literal


class BankCardResponse(BaseModel):
    """Схема ответа для банковской карточки."""
    id: str
    bankName: str
    tier: Literal["classic", "gold", "premium", "platinum", "infinite", "business"]
    network: Literal["visa", "mastercard", "unionpay"]
    isVirtual: bool
    maskedPan: str
    holderName: str
    balanceAmount: float
    balanceCurrency: Literal["EUR", "USD", "RUB", "GBP"]
    status: Literal["active", "blocked", "frozen"]
    exp: str

    class Config:
        json_schema_extra = {
            "example": {
                "id": "card_10293",
                "bankName": "Union Bank",
                "tier": "premium",
                "network": "visa",
                "isVirtual": False,
                "maskedPan": "1234 5678 9012 3456",
                "holderName": "ALEXANDER IVANOV",
                "balanceAmount": 5430.85,
                "balanceCurrency": "EUR",
                "status": "active",
                "exp": "12/28"
            }
        }

