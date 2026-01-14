import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AutomationLabLayout } from './components/AutomationLabLayout';

interface BankCard {
  id: string;
  bankName: string;
  tier: string;
  network: string;
  isVirtual: boolean;
  maskedPan: string;
  holderName: string;
  balanceAmount: number;
  balanceCurrency: string;
  status: string;
  exp: string;
}

export const CardsPage: React.FC = () => {
  const [cards, setCards] = useState<BankCard[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCards = async () => {
    setLoading(true);
    try {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8000/api/bank_cards/'
        : '/api/bank_cards/';
      
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        setCards(data);
      }
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AutomationLabLayout subtitle="Async & Dynamic • Data Cards">
          <Link to="/automation-lab" className="back-link">Назад</Link>
          
          <div className="page-header">
            <h2 className="page-title">Карточки подгружаются асинхронно</h2>
            <p className="page-description">
              Карточки догружаются через fake network delay. Тест ищет карточку сразу → NoSuchElement/timeout.
            </p>
            <div style={{ marginTop: '1rem' }}>
              <Link to="/automation-lab/cards/tasks" className="btn btn-primary">
                Посмотреть список задач →
              </Link>
            </div>
          </div>

          <section className="case-card">
            <div className="case-head">
              <div className="case-head__left">
                <div className="case-icon">🧩</div>
                <div>
                  <h3 className="case-title">Карточки подгружаются асинхронно</h3>
                </div>
              </div>
              <div className="case-head__right">
                <button className="trigger-btn" onClick={loadCards}>
                  Загрузить карточки
                </button>
              </div>
            </div>

            <div className="case-element" style={{ background: 'transparent', padding: '18px' }}>
              {loading ? (
                <div className="cards-loader">
                  <div className="loader-spinner"></div>
                  <div className="loader-text">Загрузка карточек</div>
                  <div className="loader-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              ) : cards.length > 0 ? (
                <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', width: '100%' }}>
                  {cards.map((card) => {
                    const networkIcon = card.network.toLowerCase() === 'visa' 
                      ? '/automation-lab/assets/payment-icons/visa.svg'
                      : card.network.toLowerCase() === 'mastercard'
                      ? '/automation-lab/assets/payment-icons/mastercard.svg'
                      : '/automation-lab/assets/payment-icons/unionpay.svg';
                    
                    const currencySymbol = card.balanceCurrency === 'USD' ? '$' 
                      : card.balanceCurrency === 'EUR' ? '€' 
                      : card.balanceCurrency === 'GBP' ? '£'
                      : '₽';
                    
                    return (
                      <div 
                        key={card.id} 
                        className={`card card--${card.tier.toLowerCase()}`}
                        data-card-id={card.id}
                        data-virtual={card.isVirtual}
                        data-status={card.status}
                      >
                        <div className="card__bg"></div>
                        <div className="card__top">
                          <div className="bank">
                            <div className="bank__name">{card.bankName}</div>
                            <div className="bank__tier">{card.tier.toUpperCase()}</div>
                          </div>
                          <div className="badges">
                            <span className="badge badge--virtual"></span>
                          </div>
                        </div>
                        <div className="card__pan" aria-label="Card number">{card.maskedPan}</div>
                        <div className="card__holder-name">
                          <div className="holder__name">{card.holderName}</div>
                        </div>
                        <div className="card__bottom">
                          <div className="meta">
                            <div className="balance" aria-label="Balance">
                              <div className="balance__value">
                                {currencySymbol}{card.balanceAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div className={`network network--${card.network.toLowerCase()}`} aria-label={card.network.toUpperCase()}>
                              <img 
                                src={networkIcon} 
                                alt={card.network.toUpperCase()} 
                                className="network__icon"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.parentElement) {
                                    e.currentTarget.parentElement.innerHTML = `<span style="color: white; font-size: 12px; font-weight: bold;">${card.network.toUpperCase()}</span>`;
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                  Нажмите "Загрузить карточки" для отображения данных
                </div>
              )}
            </div>

            <div className="sections">
              <div className="info-card info-card--problem">
                <div className="info-title">
                  <span className="tag tag--problem">Problem</span>
                </div>
                <div className="info-text">
                  Карточки догружаются через <code>setTimeout</code> / fake delay. Тест ищет карточку сразу → ошибка.
                </div>
              </div>

              <div className="info-card info-card--why">
                <div className="info-title">
                  <span className="tag tag--why">Why</span>
                </div>
                <div className="info-text">
                  Элементы рендерятся асинхронно после загрузки данных с сервера. Нужно ждать появления элементов.
                </div>
              </div>

              <div className="info-card info-card--solution">
                <div className="info-title">
                  <span className="tag tag--solution">Solution</span>
                </div>
                <div className="info-text">
                  Используйте явные ожидания (WebDriverWait, page.waitForSelector) перед поиском элементов.
                </div>
              </div>
            </div>
          </section>
    </AutomationLabLayout>
  );
};

