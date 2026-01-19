import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/indigo-styles.css';
import '../../styles/aurora.css';
import '../../styles/subscription-styles.css';

// =========================================================
// DATA
// =========================================================

interface Tariff {
  id: string;
  name: string;
  monthly: number;
  features: string[];
}

interface PromoCode {
  code: string;
  type: 'percent' | 'fixed' | 'set_price';
  value: number;
  applicableTo: string[];
  validFrom: string | null;
  validUntil: string | null;
  usageLimit: number | null;
  usedCount: number;
  minPurchase: number;
  singleUsePerUser: boolean;
  excludedTariffs: string[];
  description: string;
}

const TARIFFS: Tariff[] = [
  { id: 'basic', name: 'Базовый', monthly: 299, features: ['HD качество', '1 устройство'] },
  { id: 'premium', name: 'Премиум', monthly: 499, features: ['4K Ultra HD', '4 устройства', 'Без рекламы'] },
  { id: 'family', name: 'Семейный', monthly: 799, features: ['4K Ultra HD', '6 устройств', 'Без рекламы', 'Детский профиль'] }
];

const PROMO_CODES: PromoCode[] = [
  {
    code: 'WELCOME10', type: 'percent', value: 10, applicableTo: ['all'],
    validFrom: '2024-01-01', validUntil: '2024-12-31', usageLimit: 5000, usedCount: 3241,
    minPurchase: 0, singleUsePerUser: true, excludedTariffs: [],
    description: 'Скидка 10% для новых пользователей'
  },
  {
    code: 'FAMILY300', type: 'fixed', value: 300, applicableTo: ['family'],
    validFrom: '2024-03-01', validUntil: '2024-06-30', usageLimit: 1000, usedCount: 876,
    minPurchase: 799, singleUsePerUser: false, excludedTariffs: [],
    description: 'Фиксированная скидка 300₷ на Семейный тариф'
  },
  {
    code: 'SUMMER25', type: 'percent', value: 25, applicableTo: ['premium', 'family'],
    validFrom: '2024-06-01', validUntil: '2024-08-31', usageLimit: 2000, usedCount: 1999,
    minPurchase: 0, singleUsePerUser: true, excludedTariffs: [],
    description: 'Летняя скидка 25% на Премиум и Семейный'
  },
  {
    code: 'BASIC199', type: 'set_price', value: 199, applicableTo: ['basic'],
    validFrom: '2024-01-15', validUntil: null, usageLimit: null, usedCount: 120,
    minPurchase: 0, singleUsePerUser: false, excludedTariffs: [],
    description: 'Специальная цена 199₷/мес на Базовый тариф'
  },
  {
    code: 'LOYALTY15', type: 'percent', value: 15, applicableTo: ['all'],
    validFrom: '2024-01-01', validUntil: '2025-01-01', usageLimit: null, usedCount: 2150,
    minPurchase: 300, singleUsePerUser: true, excludedTariffs: ['basic'],
    description: 'Скидка 15% для лояльных клиентов (мин. 300₷)'
  }
];

const TEST_CARDS: Record<string, string> = {
  success: '4111111111111111',
  failure: '4000000000000002',
  insufficient: '4000000000009995',
  stolen: '4000000000009979',
  fraud: '4000000000004954',
  processing_error: '4000000000000119',
  incorrect_cvc: '4000000000000127'
};

const PERIOD_DISCOUNTS: Record<number, number> = { 1: 0, 3: 0.10, 12: 0.20 };

// =========================================================
// UTILITIES
// =========================================================

const formatNumber = (num: number) => Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const detectCardSystem = (number: string): string => {
  const cleanNumber = number.replace(/\s/g, '');
  if (!cleanNumber || cleanNumber.length < 1) return 'unknown';
  const firstFour = parseInt(cleanNumber.substring(0, 4));
  if (/^4/.test(cleanNumber)) return 'visa';
  if (/^5[1-5]/.test(cleanNumber) || (firstFour >= 2221 && firstFour <= 2720)) return 'mastercard';
  if (/^3[47]/.test(cleanNumber)) return 'amex';
  if (/^220[0-4]/.test(cleanNumber)) return 'mir';
  if (/^3(0[0-5]|[689])/.test(cleanNumber)) return 'diners';
  if (/^6(011|4[4-9]|5)/.test(cleanNumber)) return 'discover';
  if (/^(352[8-9]|35[3-8][0-9])/.test(cleanNumber)) return 'jcb';
  return 'unknown';
};

const getCvcLength = (cardType: string) => cardType === 'amex' ? 4 : 3;
const getCardNumberLength = (cardType: string) => {
  if (cardType === 'amex') return 15;
  if (cardType === 'diners') return 14;
  return 16;
};

const luhnCheck = (number: string): boolean => {
  if (!number || number.length < 13) return false;
  let sum = 0;
  let isEven = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
};

const formatCardNumber = (value: string, cardType: string): string => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (cardType === 'amex') {
    const parts = [];
    if (v.length > 0) parts.push(v.substring(0, 4));
    if (v.length > 4) parts.push(v.substring(4, 10));
    if (v.length > 10) parts.push(v.substring(10));
    return parts.join(' ');
  }
  const parts = [];
  for (let i = 0; i < v.length; i += 4) {
    parts.push(v.substring(i, i + 4));
  }
  return parts.length ? parts.join(' ') : v;
};

const formatExpiry = (value: string): string => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 2) return v.substring(0, 2) + '/' + v.substring(2);
  return v;
};

const getRenewalDate = (months: number): string => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

const getPeriodText = (months: number): string => {
  if (months === 1) return '1 месяц';
  if (months === 3) return '3 месяца';
  if (months === 12) return '12 месяцев';
  return `${months} месяцев`;
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return 'Бессрочно';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// =========================================================
// COMPONENT
// =========================================================

export const SubscriptionPage: React.FC = () => {
  // State
  const [selectedTariff, setSelectedTariff] = useState('family');
  const [selectedPeriod, setSelectedPeriod] = useState(12);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  
  const [cardNumberError, setCardNumberError] = useState('');
  const [cardExpiryError, setCardExpiryError] = useState('');
  const [cardCvvError, setCardCvvError] = useState('');
  const [cardGeneralError, setCardGeneralError] = useState('');
  
  const [cardValid, setCardValid] = useState({ number: false, expiry: false, cvv: false });
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPromoHintModal, setShowPromoHintModal] = useState(false);
  const [showTaskGoalsModal, setShowTaskGoalsModal] = useState(false);
  
  const [usedPromoCodes] = useState<string[]>([]);

  const cardType = detectCardSystem(cardNumber);

  // Calculations
  const calculatePrice = useCallback(() => {
    const tariff = TARIFFS.find(t => t.id === selectedTariff);
    if (!tariff) return { total: 0, baseTotal: 0, periodDiscount: 0, promoDiscount: 0, totalSavings: 0 };

    const period = selectedPeriod;
    const baseTotal = tariff.monthly * period;
    const periodDiscountRate = PERIOD_DISCOUNTS[period] || 0;
    const periodDiscount = Math.floor(baseTotal * periodDiscountRate);
    let total = baseTotal - periodDiscount;
    
    let promoDiscount = 0;
    if (appliedPromo) {
      if (appliedPromo.type === 'percent') {
        promoDiscount = Math.floor(total * (appliedPromo.value / 100));
      } else if (appliedPromo.type === 'fixed') {
        promoDiscount = Math.min(appliedPromo.value, total);
      } else if (appliedPromo.type === 'set_price') {
        const newTotal = appliedPromo.value * period * (1 - periodDiscountRate);
        promoDiscount = Math.floor(total - newTotal);
      }
      total = Math.max(0, total - promoDiscount);
    }
    
    return { baseTotal, periodDiscount, promoDiscount, total, totalSavings: periodDiscount + promoDiscount };
  }, [selectedTariff, selectedPeriod, appliedPromo]);

  const prices = calculatePrice();
  const tariff = TARIFFS.find(t => t.id === selectedTariff);

  // Validation functions
  const validateCardNumber = useCallback((value: string, showErrors = false) => {
    const cleaned = value.replace(/\s/g, '');
    const type = detectCardSystem(cleaned);
    const expectedLength = getCardNumberLength(type);
    
    if (!cleaned) {
      if (showErrors) setCardNumberError('Введите номер карты');
      setCardValid(prev => ({ ...prev, number: false }));
      return false;
    }
    
    if (/[^0-9\s]/.test(value)) {
      if (showErrors) setCardNumberError('Только цифры');
      setCardValid(prev => ({ ...prev, number: false }));
      return false;
    }
    
    if (cleaned.length < expectedLength) {
      if (showErrors) setCardNumberError(`Номер карты должен содержать ${expectedLength} цифр`);
      setCardValid(prev => ({ ...prev, number: false }));
      return false;
    }
    
    if (cleaned.length >= 6 && type === 'unknown') {
      if (showErrors) setCardNumberError('Неподдерживаемая платежная система');
      setCardValid(prev => ({ ...prev, number: false }));
      return false;
    }
    
    if (cleaned.length === expectedLength && !luhnCheck(cleaned)) {
      if (showErrors) setCardNumberError('Неверный номер карты');
      setCardValid(prev => ({ ...prev, number: false }));
      return false;
    }
    
    const isValid = cleaned.length === expectedLength && luhnCheck(cleaned) && type !== 'unknown';
    setCardValid(prev => ({ ...prev, number: isValid }));
    if (isValid) setCardNumberError('');
    return isValid;
  }, []);

  const validateExpiry = useCallback((value: string, showErrors = false) => {
    if (!value) {
      if (showErrors) setCardExpiryError('Введите срок действия');
      setCardValid(prev => ({ ...prev, expiry: false }));
      return false;
    }
    
    const match = value.match(/^(\d{2})\/(\d{2})$/);
    if (!match) {
      if (showErrors) setCardExpiryError('Формат: MM/YY');
      setCardValid(prev => ({ ...prev, expiry: false }));
      return false;
    }
    
    const month = parseInt(match[1], 10);
    const year = parseInt('20' + match[2], 10);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (month < 1 || month > 12) {
      if (showErrors) setCardExpiryError('Месяц должен быть от 01 до 12');
      setCardValid(prev => ({ ...prev, expiry: false }));
      return false;
    }
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      if (showErrors) setCardExpiryError('Карта просрочена');
      setCardValid(prev => ({ ...prev, expiry: false }));
      return false;
    }
    
    if (year > currentYear + 5) {
      if (showErrors) setCardExpiryError('Срок действия не может превышать 5 лет');
      setCardValid(prev => ({ ...prev, expiry: false }));
      return false;
    }
    
    setCardValid(prev => ({ ...prev, expiry: true }));
    setCardExpiryError('');
    return true;
  }, []);

  const validateCvv = useCallback((value: string, showErrors = false) => {
    const expectedLength = getCvcLength(cardType);
    
    if (!value) {
      if (showErrors) setCardCvvError('Введите CVV');
      setCardValid(prev => ({ ...prev, cvv: false }));
      return false;
    }
    
    if (/\D/.test(value)) {
      if (showErrors) setCardCvvError('Только цифры');
      setCardValid(prev => ({ ...prev, cvv: false }));
      return false;
    }
    
    if (value.length !== expectedLength) {
      if (showErrors) setCardCvvError(`CVC должен содержать ${expectedLength} цифры`);
      setCardValid(prev => ({ ...prev, cvv: false }));
      return false;
    }
    
    setCardValid(prev => ({ ...prev, cvv: true }));
    setCardCvvError('');
    return true;
  }, [cardType]);

  // Promo validation
  const validatePromoCode = useCallback((code: string) => {
    const sanitizedCode = code.trim().toUpperCase();
    if (!sanitizedCode) return { isValid: false, error: 'Введите промокод', promo: null };
    
    const promo = PROMO_CODES.find(p => p.code.toUpperCase() === sanitizedCode);
    if (!promo) return { isValid: false, error: 'Промокод не найден', promo: null };
    
    const now = new Date();
    if (promo.validFrom) {
      const startDate = new Date(promo.validFrom);
      if (now < startDate) return { isValid: false, error: `Промокод действует с ${formatDate(promo.validFrom)}`, promo: null };
    }
    
    if (promo.validUntil) {
      const endDate = new Date(promo.validUntil);
      endDate.setHours(23, 59, 59, 999);
      if (now > endDate) return { isValid: false, error: `Промокод истек ${formatDate(promo.validUntil)}`, promo: null };
    }
    
    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
      return { isValid: false, error: 'Лимит использований исчерпан', promo: null };
    }
    
    if (promo.singleUsePerUser && usedPromoCodes.includes(sanitizedCode)) {
      return { isValid: false, error: 'Вы уже использовали этот промокод', promo: null };
    }
    
    const appliesToAll = promo.applicableTo.includes('all');
    const appliesToTariff = promo.applicableTo.includes(selectedTariff);
    if (!appliesToAll && !appliesToTariff) {
      const names = promo.applicableTo.filter(t => t !== 'all').map(id => TARIFFS.find(tar => tar.id === id)?.name || id);
      return { isValid: false, error: `Промокод только для: ${names.join(', ')}`, promo: null };
    }
    
    if (promo.excludedTariffs?.includes(selectedTariff)) {
      const tariffName = TARIFFS.find(t => t.id === selectedTariff)?.name;
      return { isValid: false, error: `Промокод не действует для тарифа ${tariffName}`, promo: null };
    }
    
    if (promo.minPurchase && prices.total < promo.minPurchase) {
      return { isValid: false, error: `Минимальная сумма для промокода: ${formatNumber(promo.minPurchase)}₷`, promo: null };
    }
    
    return { isValid: true, error: null, promo };
  }, [selectedTariff, usedPromoCodes, prices.total]);

  // Handlers
  const handlePeriodClick = (period: number) => {
    if (period !== selectedPeriod) {
      setSelectedPeriod(period);
      if (appliedPromo) {
        const validation = validatePromoCode(appliedPromo.code);
        if (!validation.isValid) {
          setAppliedPromo(null);
          setPromoMessage({ text: validation.error || '', type: 'error' });
        }
      }
    }
  };

  const handleTariffClick = (tariffId: string) => {
    if (tariffId !== selectedTariff) {
      setSelectedTariff(tariffId);
      if (appliedPromo) {
        const validation = validatePromoCode(appliedPromo.code);
        if (!validation.isValid) {
          setAppliedPromo(null);
          setPromoMessage({ text: validation.error || '', type: 'error' });
        }
      }
    }
  };

  const handleApplyPromo = () => {
    const validation = validatePromoCode(promoInput);
    if (!validation.isValid) {
      setPromoMessage({ text: validation.error || '', type: 'error' });
      setAppliedPromo(null);
      return;
    }
    
    if (appliedPromo && appliedPromo.code === validation.promo?.code) {
      setPromoMessage({ text: 'Промокод уже применён', type: 'error' });
      return;
    }
    
    setAppliedPromo(validation.promo);
    setPromoMessage({ text: `Промокод применён: ${validation.promo?.description}`, type: 'success' });
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[\d\s]*$/.test(value)) {
      const type = detectCardSystem(value.replace(/\s/g, ''));
      const formatted = formatCardNumber(value, type);
      setCardNumber(formatted);
      validateCardNumber(formatted, false);
    } else {
      setCardNumber(value);
      validateCardNumber(value, false);
    }
    setCardNumberError('');
    setCardGeneralError('');
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[\d\/]*$/.test(value)) {
      const formatted = formatExpiry(value);
      setCardExpiry(formatted);
      validateExpiry(formatted, false);
    } else {
      setCardExpiry(value);
      validateExpiry(value, false);
    }
    setCardExpiryError('');
    setCardGeneralError('');
  };

  const handleCardCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCardCvv(value);
    validateCvv(value, false);
    setCardCvvError('');
    setCardGeneralError('');
  };

  const handlePayment = () => {
    const isNumberValid = validateCardNumber(cardNumber, true);
    const isExpiryValid = validateExpiry(cardExpiry, true);
    const isCvvValid = validateCvv(cardCvv, true);
    
    if (!isNumberValid || !isExpiryValid || !isCvvValid) return;
    
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (cleanNumber === TEST_CARDS.failure) { setCardGeneralError('Карта отклонена. Попробуйте другую карту'); return; }
    if (cleanNumber === TEST_CARDS.insufficient) { setCardGeneralError('Недостаточно средств на карте'); return; }
    if (cleanNumber === TEST_CARDS.stolen) { setCardGeneralError('Карта заблокирована. Обратитесь в банк'); return; }
    if (cleanNumber === TEST_CARDS.fraud) { setCardGeneralError('Подозрительная активность. Операция отклонена'); return; }
    if (cleanNumber === TEST_CARDS.processing_error) { setCardGeneralError('Ошибка обработки платежа. Попробуйте позже'); return; }
    if (cleanNumber === TEST_CARDS.incorrect_cvc) { setCardGeneralError('Неверный CVV код'); return; }
    
    setShowSuccessModal(true);
  };

  // Keyboard escape handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSuccessModal(false);
        setShowPromoHintModal(false);
        setShowTaskGoalsModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isPayButtonEnabled = cardValid.number && cardValid.expiry && cardValid.cvv;

  // Card brand icon
  const getCardBrandIcon = () => {
    switch (cardType) {
      case 'visa':
        return <svg viewBox="0 0 48 32" fill="none"><rect width="48" height="32" rx="4" fill="#1A1F71"/><path d="M19.5 21H17L18.5 11H21L19.5 21ZM15.5 11L13 18L12.5 15.5L11.5 12C11.5 12 11.3 11 10 11H6L6 11.2C6 11.2 7.5 11.5 9 12.5L11.5 21H14L18 11H15.5ZM36 21H38.5L36.5 11H34.5C33.5 11 33 11.5 33 12L29 21H31.5L32 19.5H35L35.3 21H36ZM32.8 17.5L34 13.5L34.8 17.5H32.8ZM29 14L29.3 12.2C29.3 12.2 28 11.7 26.5 11.7C24.8 11.7 21.5 12.5 21.5 15.5C21.5 18.3 25.5 18.3 25.5 19.8C25.5 21.3 22 21 20.8 20L20.5 22C20.5 22 21.8 22.5 23.8 22.5C25.8 22.5 29 21.2 29 18.3C29 15.3 25 15.5 25 14C25 12.5 27.5 12.7 29 14Z" fill="white"/></svg>;
      case 'mastercard':
        return <svg viewBox="0 0 48 32" fill="none"><rect width="48" height="32" rx="4" fill="#000"/><circle cx="18" cy="16" r="9" fill="#EB001B"/><circle cx="30" cy="16" r="9" fill="#F79E1B"/><path d="M24 9C26.2 10.8 27.5 13.2 27.5 16C27.5 18.8 26.2 21.2 24 23C21.8 21.2 20.5 18.8 20.5 16C20.5 13.2 21.8 10.8 24 9Z" fill="#FF5F00"/></svg>;
      case 'amex':
        return <svg viewBox="0 0 48 32" fill="none"><rect width="48" height="32" rx="4" fill="#006FCF"/><path d="M8 20H10L11 17.5L12 20H14L11.5 16L14 12H12L11 14.5L10 12H8L10.5 16L8 20ZM15 20H17V17H19V15H17V14H19.5V12H15V20ZM21 20H23V17H24.5L26 20H28.5L26.5 16.5C27.5 16 28 15 28 14C28 12.5 27 12 25.5 12H21V20ZM23 15V14H25C25.5 14 26 14.2 26 14.5C26 14.8 25.5 15 25 15H23ZM30 20H36V18H32V17H36V15H32V14H36V12H30V20ZM37 18L40 20H42L38.5 16L42 12H40L37 14V12H35V20H37V18Z" fill="white"/></svg>;
      default:
        return <svg className="card-brand-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="12" r="5" opacity="0.8"/><circle cx="15" cy="12" r="5" opacity="0.6"/></svg>;
    }
  };

  return (
    <>
      <div className="sky" aria-hidden="true"></div>
      <div className="layout" data-style="s2">
        <header className="header">
          <div className="header-content">
            <Link to="/automation-lab" className="brand flex-shrink-0">
              <div className="brand-mark">
                <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="brand-logo-img">
                  <rect width="64" height="64" rx="12" fill="#6366F1"/>
                  <path d="M32 16L20 28V44H28V36H36V44H44V28L32 16Z" fill="white"/>
                  <circle cx="32" cy="48" r="4" fill="white"/>
                </svg>
              </div>
              <div className="brand-text">
                <div className="brand-title">StreamVibe</div>
                <div className="brand-subtitle">Подключение подписки</div>
              </div>
            </Link>
            <div className="header-actions">
              <Link to="/automation-lab" className="back-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Назад
              </Link>
            </div>
          </div>
        </header>

        <main className="main">
          <div className="container">
            {/* Hero Section */}
            <section className="subscription-hero">
              <div className="hero-header">
                <div>
                  <h1 className="subscription-title">Подключение подписки StreamVibe</h1>
                  <p className="subscription-subtitle">Форма для тестирования сервиса подписки, для практики техник тест-дизайна</p>
                </div>
                <div className="hero-actions">
                  <button type="button" className="promo-hint-btn" onClick={() => setShowPromoHintModal(true)} data-testid="promo-hint-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    Подсказка
                  </button>
                  <button type="button" className="task-goals-btn" onClick={() => setShowTaskGoalsModal(true)} data-testid="task-goals-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3L22 4"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                    Цели задачи
                  </button>
                </div>
              </div>
            </section>

            <div className="subscription-layout">
              {/* Left Column */}
              <div className="subscription-main">
                {/* Period Section */}
                <section className="period-section" data-testid="period-section">
                  <h2 className="section-label">Выберите период</h2>
                  <div className="period-switcher" role="radiogroup" aria-label="Период подписки">
                    <button className={`period-btn ${selectedPeriod === 1 ? 'active' : ''}`} onClick={() => handlePeriodClick(1)} data-testid="period-1">
                      <span className="period-name">1 месяц</span>
                    </button>
                    <button className={`period-btn ${selectedPeriod === 3 ? 'active' : ''}`} onClick={() => handlePeriodClick(3)} data-testid="period-3">
                      <span className="period-name">3 месяца</span>
                      <span className="period-badge">-10%</span>
                    </button>
                    <button className={`period-btn ${selectedPeriod === 12 ? 'active' : ''}`} onClick={() => handlePeriodClick(12)} data-testid="period-12">
                      <span className="period-name">12 месяцев</span>
                      <span className="period-badge accent">-50%</span>
                    </button>
                  </div>
                </section>

                {/* Tariffs Section */}
                <section className="tariffs-section" data-testid="tariffs-section">
                  <h2 className="section-label">Подключи подписку</h2>
                  <p className="section-hint">Выбери период для подключения. Чем больше срок, тем больше выгода.</p>
                  
                  <div className="tariffs-grid">
                    {TARIFFS.map((t) => {
                      const baseTotal = t.monthly * selectedPeriod;
                      const discountRate = PERIOD_DISCOUNTS[selectedPeriod] || 0;
                      const discountedTotal = Math.floor(baseTotal * (1 - discountRate));
                      
                      return (
                        <div 
                          key={t.id}
                          className={`tariff-card ${t.id === 'premium' ? 'popular' : ''} ${selectedTariff === t.id ? 'selected' : ''}`}
                          data-tariff={t.id}
                          data-testid={`tariff-${t.id}`}
                          onClick={() => handleTariffClick(t.id)}
                        >
                          <div className="tariff-period-badge">{selectedPeriod}</div>
                          <div className="tariff-header">
                            {t.id === 'premium' && (
                              <div className="popular-badge">
                                <span className="discount-percent">14%</span>
                              </div>
                            )}
                            {t.id === 'family' && (
                              <div className="promo-badge">
                                <span className="discount-percent">50%</span>
                              </div>
                            )}
                            <h3 className="tariff-name">{t.name}</h3>
                          </div>
                          <div className="tariff-price-block">
                            <span className="tariff-price">{t.monthly}</span>
                            <span className="tariff-currency">₷</span>
                          </div>
                          <span className="tariff-period-text">за месяц</span>
                          <div className="tariff-total" data-testid={`tariff-${t.id}-total`}>
                            <span className="total-label">
                              {selectedPeriod === 1 
                                ? 'Оплата ежемесячно'
                                : <>При оплате <strong>{formatNumber(discountedTotal)} ₷</strong> раз в {selectedPeriod} {selectedPeriod === 3 ? 'месяца' : 'месяцев'}</>
                              }
                            </span>
                          </div>
                          <ul className="tariff-features">
                            {t.features.map((f, i) => (
                              <li key={i}><span className="feature-icon">✓</span> {f}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                  
                  <p className="tariff-note">1 месяц равен 30 календарным дням</p>
                </section>

                {/* Promo Section */}
                <section className="promo-section" data-testid="promo-section">
                  <h2 className="section-label">Промокод</h2>
                  <div className="promo-form">
                    <div className="promo-input-wrapper">
                      <input 
                        type="text" 
                        className={`promo-input ${promoMessage.type === 'success' ? 'valid' : ''} ${promoMessage.type === 'error' ? 'invalid' : ''}`}
                        placeholder="Введите промокод"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value);
                          if (!e.target.value) {
                            setPromoMessage({ text: '', type: '' });
                            setAppliedPromo(null);
                          }
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter' && promoInput) handleApplyPromo(); }}
                        data-testid="promo-input"
                        maxLength={20}
                      />
                      <button 
                        type="button" 
                        className="promo-apply-btn" 
                        disabled={!promoInput}
                        onClick={handleApplyPromo}
                        data-testid="promo-apply-btn"
                      >
                        Применить
                      </button>
                    </div>
                    {promoMessage.text && (
                      <div className={`promo-message ${promoMessage.type}`} data-testid="promo-message">
                        {promoMessage.text}
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Column */}
              <div className="subscription-sidebar">
                {/* Payment Section */}
                <section className="payment-section" data-testid="payment-section">
                  <div className="payment-card-visual">
                    <div className="card-design">
                      <div className="card-chip"></div>
                      <div className="card-brand">{getCardBrandIcon()}</div>
                    </div>
                    
                    <div className="card-fields">
                      <div className="card-number-field">
                        <label className="card-label">Номер карты</label>
                        <input 
                          type="text" 
                          className={`card-input card-number ${cardValid.number ? 'valid' : ''} ${cardNumberError ? 'invalid' : ''}`}
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          data-testid="card-number"
                        />
                        {cardNumberError && <div className="field-error">{cardNumberError}</div>}
                      </div>
                      
                      <div className="card-row">
                        <div className="card-expiry-field">
                          <label className="card-label">ММ / ГГ</label>
                          <input 
                            type="text" 
                            className={`card-input card-expiry ${cardValid.expiry ? 'valid' : ''} ${cardExpiryError ? 'invalid' : ''}`}
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={handleCardExpiryChange}
                            data-testid="card-expiry"
                          />
                          {cardExpiryError && <div className="field-error">{cardExpiryError}</div>}
                        </div>
                        <div className="card-cvv-field">
                          <label className="card-label">CVV</label>
                          <input 
                            type={showCvv ? 'text' : 'password'}
                            className={`card-input card-cvv ${cardValid.cvv ? 'valid' : ''} ${cardCvvError ? 'invalid' : ''}`}
                            placeholder={cardType === 'amex' ? '••••' : '•••'}
                            value={cardCvv}
                            onChange={handleCardCvvChange}
                            data-testid="card-cvv"
                          />
                          <button type="button" className="cvv-toggle" onClick={() => setShowCvv(!showCvv)} aria-label="Показать CVV">
                            <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>
                          {cardCvvError && <div className="field-error">{cardCvvError}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {cardGeneralError && <div className="card-errors" data-testid="card-errors">{cardGeneralError}</div>}
                </section>

                {/* Summary Section */}
                <section className="summary-section" data-testid="summary-section">
                  <div className="summary-header">
                    <h2 className="summary-title">Введи карту</h2>
                    <p className="summary-description">
                      для подключения подписки StreamVibe. <span>{getPeriodText(selectedPeriod)}</span> за <span>{formatNumber(prices.total)}</span> ₷, продление <span>{getRenewalDate(selectedPeriod)}</span> по этой же цене. Оплата пройдёт за 24 часа до продления.
                    </p>
                  </div>
                  
                  <div className="summary-details">
                    <div className="summary-row">
                      <span className="summary-label">Тариф</span>
                      <span className="summary-value">{tariff?.name}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Период</span>
                      <span className="summary-value">{getPeriodText(selectedPeriod)}</span>
                    </div>
                    {prices.periodDiscount > 0 && (
                      <div className="summary-row">
                        <span className="summary-label">Скидка за период</span>
                        <span className="summary-value discount">-{formatNumber(prices.periodDiscount)} ₷</span>
                      </div>
                    )}
                    {prices.promoDiscount > 0 && (
                      <div className="summary-row">
                        <span className="summary-label">Скидка по промокоду</span>
                        <span className="summary-value discount">-{formatNumber(prices.promoDiscount)} ₷</span>
                      </div>
                    )}
                    {prices.totalSavings > 0 && (
                      <div className="summary-row savings">
                        <span className="summary-label">Экономия</span>
                        <span className="summary-value">{formatNumber(prices.totalSavings)} ₷</span>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    type="button" 
                    className="pay-button"
                    disabled={!isPayButtonEnabled}
                    onClick={handlePayment}
                    data-testid="pay-button"
                  >
                    <span className="pay-btn-text">Подключить за </span>
                    {prices.totalSavings > 0 && <span className="pay-btn-old-price">{formatNumber(prices.baseTotal)}</span>}
                    <span className="pay-btn-price">{formatNumber(prices.total)}</span>
                    <span className="pay-btn-currency">₷</span>
                  </button>
                </section>
              </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
              <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) setShowSuccessModal(false); }} data-testid="success-modal">
                <div className="modal-content success-modal">
                  <div className="success-icon">
                    <svg viewBox="0 0 64 64" fill="none">
                      <circle cx="32" cy="32" r="30" fill="rgba(25, 195, 125, 0.15)" stroke="rgba(25, 195, 125, 0.5)" strokeWidth="2"/>
                      <path d="M20 32L28 40L44 24" stroke="#19c37d" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="success-title">Успешно!</h3>
                  <p className="success-text">Подписка <span>{tariff?.name}</span> успешно оформлена</p>
                  <div className="success-details">
                    <div className="success-row">
                      <span>Период:</span>
                      <strong>{getPeriodText(selectedPeriod)}</strong>
                    </div>
                    <div className="success-row">
                      <span>Сумма:</span>
                      <strong>{formatNumber(prices.total)} ₷</strong>
                    </div>
                    <div className="success-row">
                      <span>Карта:</span>
                      <strong>•••• {cardNumber.replace(/\s/g, '').slice(-4)}</strong>
                    </div>
                  </div>
                  <button type="button" className="modal-close-btn" onClick={() => setShowSuccessModal(false)}>Отлично!</button>
                </div>
              </div>
            )}

            {/* Promo Hint Modal */}
            {showPromoHintModal && (
              <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) setShowPromoHintModal(false); }} data-testid="promo-hint-modal">
                <div className="modal-content promo-hint-modal">
                  <div className="modal-header">
                    <h3 className="modal-title">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      Доступные промокоды для тестирования
                    </h3>
                    <button type="button" className="modal-close-x" onClick={() => setShowPromoHintModal(false)} aria-label="Закрыть">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="promo-codes-list">
                    <div className="promo-code-card">
                      <div className="promo-code-header">
                        <code className="promo-code-value">WELCOME10</code>
                        <span className="promo-type-badge percent">-10%</span>
                      </div>
                      <p className="promo-code-desc">Скидка 10% для новых пользователей</p>
                      <div className="promo-code-details">
                        <div className="detail-row"><span className="detail-label">Тарифы:</span><span className="detail-value">Все тарифы</span></div>
                        <div className="detail-row"><span className="detail-label">Действует:</span><span className="detail-value">01.01.2024 — 31.12.2024</span></div>
                      </div>
                    </div>
                    <div className="promo-code-card">
                      <div className="promo-code-header">
                        <code className="promo-code-value">FAMILY300</code>
                        <span className="promo-type-badge fixed">-300₷</span>
                      </div>
                      <p className="promo-code-desc">Фиксированная скидка 300₷ на Семейный тариф</p>
                      <div className="promo-code-details">
                        <div className="detail-row"><span className="detail-label">Тарифы:</span><span className="detail-value">Только Семейный</span></div>
                        <div className="detail-row"><span className="detail-label">Действует:</span><span className="detail-value">01.03.2024 — 30.06.2024</span></div>
                        <div className="detail-row"><span className="detail-label">Мин. сумма:</span><span className="detail-value">799₷</span></div>
                      </div>
                    </div>
                    <div className="promo-code-card">
                      <div className="promo-code-header">
                        <code className="promo-code-value">SUMMER25</code>
                        <span className="promo-type-badge percent">-25%</span>
                      </div>
                      <p className="promo-code-desc">Летняя скидка 25% на Премиум и Семейный</p>
                      <div className="promo-code-details">
                        <div className="detail-row"><span className="detail-label">Тарифы:</span><span className="detail-value">Премиум, Семейный</span></div>
                        <div className="detail-row"><span className="detail-label">Действует:</span><span className="detail-value">01.06.2024 — 31.08.2024</span></div>
                        <div className="detail-row"><span className="detail-label">Лимит:</span><span className="detail-value danger">2000 использований (осталось 1!)</span></div>
                      </div>
                    </div>
                    <div className="promo-code-card">
                      <div className="promo-code-header">
                        <code className="promo-code-value">BASIC199</code>
                        <span className="promo-type-badge set-price">199₷/мес</span>
                      </div>
                      <p className="promo-code-desc">Специальная цена 199₷/мес на Базовый тариф</p>
                      <div className="promo-code-details">
                        <div className="detail-row"><span className="detail-label">Тарифы:</span><span className="detail-value">Только Базовый</span></div>
                        <div className="detail-row"><span className="detail-label">Действует:</span><span className="detail-value">с 15.01.2024, бессрочно</span></div>
                      </div>
                    </div>
                    <div className="promo-code-card">
                      <div className="promo-code-header">
                        <code className="promo-code-value">LOYALTY15</code>
                        <span className="promo-type-badge percent">-15%</span>
                      </div>
                      <p className="promo-code-desc">Скидка 15% для лояльных клиентов</p>
                      <div className="promo-code-details">
                        <div className="detail-row"><span className="detail-label">Тарифы:</span><span className="detail-value">Премиум, Семейный <span className="excluded">(не Базовый!)</span></span></div>
                        <div className="detail-row"><span className="detail-label">Действует:</span><span className="detail-value">01.01.2024 — 01.01.2025</span></div>
                        <div className="detail-row"><span className="detail-label">Мин. сумма:</span><span className="detail-value warning">300₷</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="promo-hint-footer">
                    <h4>Тестовые карты для оплаты</h4>
                    <div className="test-cards-grid">
                      <div className="test-card"><code>4111 1111 1111 1111</code><span className="test-card-result success">Успешная оплата</span></div>
                      <div className="test-card"><code>5555 5555 5555 4444</code><span className="test-card-result success">MasterCard успех</span></div>
                      <div className="test-card"><code>3782 822463 10005</code><span className="test-card-result success">AmEx (CVC 4 цифры)</span></div>
                      <div className="test-card"><code>4000 0000 0000 0002</code><span className="test-card-result danger">Карта отклонена</span></div>
                      <div className="test-card"><code>4000 0000 0000 9995</code><span className="test-card-result danger">Недостаточно средств</span></div>
                    </div>
                    <p className="test-cards-note">Срок действия: любой будущий (например, 12/29), CVV: любые 3 цифры (4 для AmEx)</p>
                  </div>

                  <button type="button" className="modal-close-btn" onClick={() => setShowPromoHintModal(false)}>Понятно</button>
                </div>
              </div>
            )}

            {/* Task Goals Modal */}
            {showTaskGoalsModal && (
              <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) setShowTaskGoalsModal(false); }} data-testid="task-goals-modal">
                <div className="modal-content task-goals-modal">
                  <div className="modal-header">
                    <h3 className="modal-title">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                        <path d="M9 11l3 3L22 4"/>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                      Цели задания
                    </h3>
                    <button type="button" className="modal-close-x" onClick={() => setShowTaskGoalsModal(false)} aria-label="Закрыть">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="task-goals-content">
                    <div className="goals-section">
                      <h4 className="goals-section-title">Цели задания</h4>
                      <ul className="goals-list">
                        <li>Применить на практике ключевые техники тест-дизайна.</li>
                        <li>Найти и грамотно оформить критические и функциональные баги.</li>
                        <li>Оценить удобство и ясность интерфейса для пользователя.</li>
                        <li>Доказать эффективность применения формальных техник по сравнению с хаотичным тестированием.</li>
                      </ul>
                    </div>

                    <div className="goals-section">
                      <h4 className="goals-section-title">Объект тестирования: Форма оформления подписки</h4>
                      <p className="goals-description">Краткое описание функционала (как у пользователя):</p>
                      <ul className="goals-list">
                        <li>Выбор одного из трех тарифов ("Базовый", "Премиум", "Семейный") с переключением периодов оплаты (Месяц/Год).</li>
                        <li>Возможность применить промокод для скидки.</li>
                        <li>Форма для заполнения карты.</li>
                        <li>Кнопка оформления заказа с отображением финальной суммы.</li>
                      </ul>
                    </div>

                    <div className="goals-section">
                      <h4 className="goals-section-title">Часть 1: Анализ и Планирование</h4>
                      <p className="goals-task">Задача: Используя только описание формы, спланируйте подход к тестированию.</p>
                      <ul className="goals-list">
                        <li><strong>Разбейте форму на логические блоки/модули.</strong></li>
                        <li><strong>Составьте стратегию тестирования этой формы.</strong></li>
                      </ul>
                    </div>

                    <div className="goals-section">
                      <h4 className="goals-section-title">Часть 2: Применение техник тест-дизайна</h4>
                      <p className="goals-task">Задача: Примени техники тест-дизайна.</p>
                      <p className="goals-techniques"><strong>Техники:</strong> Анализ граничных значений, Классы эквивалентности, Таблица принятия решений, Попарное тестирование, Предсказание ошибок.</p>
                    </div>

                    <div className="goals-section">
                      <h4 className="goals-section-title">Часть 3: Исследовательское тестирование</h4>
                      <p className="goals-task">Задача: Выполните тестирование и дополните исследовательским подходом.</p>
                      <ul className="goals-list">
                        <li>Проведите 20-минутное сессионное исследовательское тестирование.</li>
                        <li>Найди и оформи хотя бы 3 бага.</li>
                        <li>Создай чек-лист из 10 пунктов для smoke-тестирования.</li>
                      </ul>
                    </div>

                    <div className="goals-section">
                      <h4 className="goals-section-title">Часть 4: Итоги и рефлексия</h4>
                      <p className="goals-task">Ответьте на вопросы:</p>
                      <ul className="goals-list">
                        <li>Какая техника оказалась самой эффективной?</li>
                        <li>Какой самый интересный баг вы нашли?</li>
                        <li>Что бы вы добавили для защиты от дурака?</li>
                      </ul>
                    </div>
                  </div>

                  <button type="button" className="modal-close-btn" onClick={() => setShowTaskGoalsModal(false)}>Понятно</button>
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="footer">
          <div className="container">
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>
              StreamVibe © {new Date().getFullYear()} | Учебная форма для практики тест-дизайна
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

