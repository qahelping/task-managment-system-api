"""
Роутер для работы с банковскими карточками.
"""
import random
from typing import List
from fastapi import APIRouter

from app.schemas.bank_card import BankCardResponse

router = APIRouter(prefix="/bank_cards", tags=["Bank Cards"])


def generate_random_cards(count: int) -> List[BankCardResponse]:
    """
    Генерирует случайные банковские карточки.
    
    Args:
        count: Количество карточек для генерации (от 3 до 12)
    
    Returns:
        Список банковских карточек
    """
    banks = [
        "Union Bank",
        "Global Trust",
        "PrimeBank",
        "Capital One",
        "First National Bank",
        "Crest Bank",
        "Alliance Bank",
        "Heritage Bank",
        "Summit Bank",
        "Core Bank"
    ]
    
    tiers = ["classic", "gold", "premium", "platinum", "infinite", "business"]
    networks = ["visa", "mastercard", "unionpay"]
    currencies = ["EUR", "USD", "RUB", "GBP"]
    statuses = ["active", "blocked", "frozen"]
    
    first_names = ["ALEXANDER", "ANNA", "SERGEY", "KSENIA", "DMITRY", "MARIA", "IVAN", "ELENA"]
    last_names = ["IVANOV", "PETROVA", "NIKOLAEV", "VOLKOVA", "ROMANOV", "SMIRNOV", "KOVALEV", "NOVIKOV"]
    
    cards = []
    
    for i in range(count):
        tier = random.choice(tiers)
        network = random.choice(networks)
        is_virtual = random.random() > 0.7  # 30% виртуальных
        currency = random.choice(currencies)
        status = random.choice(statuses)
        
        # Генерация номера карты
        pan1 = random.randint(1000, 9999)
        pan2 = random.randint(1000, 9999)
        pan3 = random.randint(1000, 9999)
        pan4 = random.randint(1000, 9999)
        masked_pan = f"{pan1} {pan2} {pan3} {pan4}"
        
        # Генерация баланса
        balance_amount = round(random.uniform(100, 50000), 2)
        
        # Генерация имени
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        holder_name = f"{first_name} {last_name}"
        
        # Генерация срока действия
        month = str(random.randint(1, 12)).zfill(2)
        year = str(random.randint(24, 29))
        exp = f"{month}/{year}"
        
        # Выбор случайного банка из списка
        bank_name = random.choice(banks)
        
        cards.append(BankCardResponse(
            id=f"card_{random.randint(10000, 99999)}",
            bankName=bank_name,
            tier=tier,
            network=network,
            isVirtual=is_virtual,
            maskedPan=masked_pan,
            holderName=holder_name,
            balanceAmount=balance_amount,
            balanceCurrency=currency,
            status=status,
            exp=exp
        ))
    
    return cards


@router.get("/", response_model=List[BankCardResponse])
def get_bank_cards():
    """
    Получить список банковских карточек.
    Генерирует случайное количество карточек от 3 до 12.
    Не требует аутентификации.
    """
    # Генерируем случайное количество карточек от 3 до 12
    count = random.randint(3, 12)
    cards = generate_random_cards(count)
    return cards

