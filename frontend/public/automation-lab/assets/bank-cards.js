// Bank Cards Generator
(function() {
    'use strict';

    // Определение базового пути к assets относительно текущей страницы
    function getAssetsBasePath() {
        // Используем абсолютный путь от корня automation-lab
        const pathname = window.location.pathname;
        
        // Определяем базовый путь automation-lab
        let basePath = '';
        if (pathname.includes('/automation-lab/')) {
            const labIndex = pathname.indexOf('/automation-lab/');
            basePath = pathname.substring(0, labIndex + '/automation-lab'.length) + '/assets/';
        } else if (pathname.includes('/pages/')) {
            // Если страница в pages/, используем относительный путь
            basePath = '../assets/';
        } else {
            // Если страница в корне automation-lab
            basePath = './assets/';
        }
        
        return basePath;
    }

    // Определение базового URL API
    function getApiBaseUrl() {
        // Если страница открыта как файл (file://), используем localhost:8000
        if (window.location.protocol === 'file:') {
            return 'http://localhost:8000';
        }
        
        // В продакшене используем относительный путь /api
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            return '/api';
        }
        
        // В dev режиме используем localhost:8000
        return 'http://localhost:8000';
    }

    // Запрос к реальному API
    async function fetchBankCards() {
        const apiUrl = `${getApiBaseUrl()}/bank_cards/`;
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const cards = await response.json();
        
        if (!Array.isArray(cards) || cards.length === 0) {
            throw new Error('API вернул пустой массив карточек');
        }
        
        return cards;
    }

    // Форматирование валюты
    function formatCurrency(amount, currency) {
        const symbols = {
            'EUR': '€',
            'USD': '$',
            'RUB': '₽',
            'GBP': '£'
        };
        
        const symbol = symbols[currency] || currency;
        return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Форматирование tier для отображения
    function formatTier(tier) {
        return tier.toUpperCase();
    }

    // Маскировка номера карты (первые 4 и последние 4 цифры)
    function maskCardNumber(pan) {
        // Убираем пробелы для обработки
        const cleaned = pan.replace(/\s/g, '');
        
        if (cleaned.length < 8) {
            return pan; // Если номер слишком короткий, возвращаем как есть
        }
        
        // Берем первые 4 и последние 4 цифры
        const first4 = cleaned.substring(0, 4);
        const last4 = cleaned.substring(cleaned.length - 4);
        
        // Форматируем как "9459 **** **** 1991"
        return `${first4} **** **** ${last4}`;
    }

    // Экранирование HTML для безопасности
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Создание HTML карточки
    function createCardHTML(card) {
        const tierClass = `card--${card.tier}`;
        const networkClass = `network--${card.network}`;
        const balanceFormatted = formatCurrency(card.balanceAmount, card.balanceCurrency);
        
        // Путь к SVG иконке платежной системы
        const assetsBasePath = getAssetsBasePath();
        const networkIconPath = `${assetsBasePath}payment-icons/${card.network}.svg`;
        
        return `
            <div class="card ${tierClass}" data-card-id="${escapeHtml(card.id)}" data-virtual="${card.isVirtual}" data-status="${escapeHtml(card.status)}">
                <div class="card__bg"></div>
                
                <div class="card__top">
                    <div class="bank">
                        <div class="bank__name">${escapeHtml(card.bankName)}</div>
                        <div class="bank__tier">${formatTier(card.tier)}</div>
                    </div>
                    
                    <div class="badges">
                        <span class="badge badge--virtual"></span>
                    </div>
                </div>
                
                <div class="card__pan" aria-label="Card number">${escapeHtml(maskCardNumber(card.maskedPan))}</div>
                
                <div class="card__holder-name">
                    <div class="holder__name">${escapeHtml(card.holderName)}</div>
                </div>
                
                <div class="card__bottom">
                    <div class="meta">
                        <div class="balance" aria-label="Balance">
                            <div class="balance__value">${escapeHtml(balanceFormatted)}</div>
                        </div>
                        
                        <div class="network" aria-label="${card.network.toUpperCase()}">
                            <img src="${networkIconPath}" 
                                 alt="${card.network.toUpperCase()}" 
                                 class="network__icon"
                                 onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<span style=\\'color: white; font-size: 12px; font-weight: bold;\\'>'+this.alt+'</span>';" />
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Отображение ошибки
    function showError(message) {
        const grid = document.getElementById('bankCardsGrid');
        if (!grid) return;
        
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: 16px; border: 2px solid #EF4444;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h3 style="color: #EF4444; margin-bottom: 0.5rem; font-size: 1.5rem;">Ошибка загрузки карточек</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">${escapeHtml(message)}</p>
                <button onclick="location.reload()" style="padding: 0.75rem 1.5rem; background: var(--accent-primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    Обновить страницу
                </button>
            </div>
        `;
    }

    // Рендеринг карточек
    async function renderCards() {
        const grid = document.getElementById('bankCardsGrid');
        if (!grid) {
            console.error('renderCards: Контейнер bankCardsGrid не найден');
            return;
        }
        
        console.log('renderCards: Начинаем загрузку карточек...');
        
        // Проверяем, есть ли стили для лоадера на странице
        const hasLoaderStyles = document.querySelector('style')?.textContent.includes('loader-spinner') || 
                                document.querySelector('link[href*="cards-styles"]');
        
        if (hasLoaderStyles) {
            // Используем классы, если стили уже подключены
            grid.innerHTML = `
                <div class="cards-loader">
                    <div class="loader-spinner"></div>
                    <div class="loader-text">
                        Загрузка карточек
                        <div class="loader-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Используем inline стили для совместимости
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; gap: 1.5rem;">
                    <div style="width: 60px; height: 60px; border: 4px solid rgba(124, 92, 255, 0.2); border-top-color: rgba(124, 92, 255, 0.9); border-right-color: rgba(99, 166, 255, 0.7); border-radius: 50%; animation: spin 1s linear infinite;">
                        <style>
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        </style>
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 1rem; font-weight: 500; letter-spacing: 0.5px; text-align: center;">
                        Загрузка карточек
                        <div style="display: inline-flex; gap: 6px; margin-top: 0.5rem;">
                            <span style="width: 8px; height: 8px; border-radius: 50%; background: rgba(124, 92, 255, 0.6); animation: pulse 1.4s ease-in-out infinite;"></span>
                            <span style="width: 8px; height: 8px; border-radius: 50%; background: rgba(124, 92, 255, 0.6); animation: pulse 1.4s ease-in-out infinite 0.2s;"></span>
                            <span style="width: 8px; height: 8px; border-radius: 50%; background: rgba(124, 92, 255, 0.6); animation: pulse 1.4s ease-in-out infinite 0.4s;"></span>
                        </div>
                        <style>
                            @keyframes pulse {
                                0%, 100% { opacity: 0.4; transform: scale(0.8); }
                                50% { opacity: 1; transform: scale(1.2); background: rgba(99, 166, 255, 0.9); }
                            }
                        </style>
                    </div>
                </div>
            `;
        }
        
        try {
            console.log('renderCards: Вызываем fetchBankCards()...');
            const cards = await fetchBankCards();
            console.log('renderCards: Получено карточек:', cards.length, cards);
            
            if (!cards || cards.length === 0) {
                throw new Error('API вернул пустой массив карточек');
            }
            
            const cardsHTML = cards.map(card => createCardHTML(card)).join('');
            console.log('renderCards: HTML карточек сгенерирован, длина:', cardsHTML.length);
            
            grid.innerHTML = cardsHTML;
            console.log('renderCards: Карточки отрендерены в DOM');
            
            // Логируем событие
            if (window.logEvent) {
                window.logEvent('render', `Загружено ${cards.length} карточек из API`, {
                    count: cards.length
                });
            }
        } catch (error) {
            console.error('renderCards: Ошибка загрузки карточек:', error);
            const errorMessage = error.message || 'Не удалось загрузить данные с сервера. Проверьте, что бэкенд запущен.';
            showError(errorMessage);
            
            // Логируем ошибку
            if (window.logEvent) {
                window.logEvent('render', `Ошибка загрузки карточек: ${errorMessage}`, {
                    error: error.message
                });
            }
        }
    }

    // Инициализация при загрузке страницы (только если не отключена)
    if (!window.__bankCardsAutoLoadDisabled) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', renderCards);
        } else {
            renderCards();
        }
    }

    // Экспорт для использования в других скриптах
    window.bankCards = {
        fetchBankCards,
        renderCards
    };
})();

