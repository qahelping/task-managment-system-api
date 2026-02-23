import React from 'react';
import { Link } from 'react-router-dom';
import { AutomationLabLayout } from './components/AutomationLabLayout';

export const AutomationLabHomePage: React.FC = () => {
  return (
    <AutomationLabLayout showFooter>
      {/* HERO */}
       <section className="hero hero--home">
        <h2 className="hero-title">
          Web Automation Torture Lab
          <span className="hero-title__glow">для автоматизаторов</span>
        </h2>

        <p className="hero-description">
          Комплексная платформа для практики тестирования: веб-автоматизация (Selenium, Playwright) с реальными "flaky" кейсами и тест-дизайн на примере формы подписки.
        </p>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="section-head">
          <h3 className="section-title">Категории</h3>
        </div>

        <div className="features-grid">
          {/* 1 - Clicks */}
          {/* <div className="feature-card">
            <div className="feature-top">
              <div className="feature-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="12" y="12" width="40" height="40" rx="8" fill="#4F46E5" opacity="0.1"/>
                  <circle cx="32" cy="32" r="12" fill="#4F46E5"/>
                  <path d="M28 32L30.5 34.5L36 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="pill pill--accent">Core</span>
            </div>
            <h4 className="feature-title">Клики и взаимодействия</h4>
            <p className="feature-desc">Double/Right click, hover, перекрытия, sticky, проблемы с кликабельностью.</p>
            <Link to="/automation-lab/clicks" className="feature-link">Открыть →</Link>
          </div> */}

          {/* 2 - Forms */}
          {/* <div className="feature-card">
            <div className="feature-top">
              <div className="feature-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="12" y="20" width="40" height="8" rx="4" fill="#10B981" opacity="0.1"/>
                  <rect x="12" y="20" width="40" height="8" rx="4" stroke="#10B981" strokeWidth="2"/>
                  <rect x="12" y="36" width="40" height="8" rx="4" fill="#10B981" opacity="0.1"/>
                  <rect x="12" y="36" width="40" height="8" rx="4" stroke="#10B981" strokeWidth="2"/>
                  <circle cx="20" cy="24" r="2" fill="#10B981"/>
                  <circle cx="20" cy="40" r="2" fill="#10B981"/>
                </svg>
              </div>
              <span className="pill">Forms</span>
            </div>
            <h4 className="feature-title">Формы и поля ввода</h4>
            <p className="feature-desc">Masked inputs, автозаполнение, валидации, debounce, "прыгающий" курсор.</p>
            <Link to="/automation-lab/forms" className="feature-link">Открыть →</Link>
          </div> */}

          {/* 3 - Overlays */}
          {/* <div className="feature-card">
            <div className="feature-top">
              <div className="feature-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="8" width="48" height="48" rx="8" fill="#F59E0B" opacity="0.1"/>
                  <rect x="8" y="8" width="48" height="48" rx="8" stroke="#F59E0B" strokeWidth="2"/>
                  <rect x="16" y="20" width="32" height="24" rx="4" fill="#F59E0B" opacity="0.2"/>
                  <circle cx="40" cy="28" r="3" fill="#F59E0B"/>
                  <path d="M24 32L28 36L40 24" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="pill">Overlays</span>
            </div>
            <h4 className="feature-title">Модалки и уведомления</h4>
            <p className="feature-desc">Dialogs, toast, confirm, sticky headers, overlays, z-index войны.</p>
            <Link to="/automation-lab/overlays" className="feature-link">Открыть →</Link>
          </div> */}

          {/* 4 - Frames */}
          {/* <div className="feature-card">
            <div className="feature-top">
              <div className="feature-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="10" width="20" height="20" rx="4" fill="#8B5CF6" opacity="0.1"/>
                  <rect x="10" y="10" width="20" height="20" rx="4" stroke="#8B5CF6" strokeWidth="2"/>
                  <rect x="34" y="34" width="20" height="20" rx="4" fill="#8B5CF6" opacity="0.1"/>
                  <rect x="34" y="34" width="20" height="20" rx="4" stroke="#8B5CF6" strokeWidth="2"/>
                  <path d="M20 20L34 34M30 20L44 34" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="pill">Frames</span>
            </div>
            <h4 className="feature-title">Фреймы и Shadow DOM</h4>
            <p className="feature-desc">Iframes, nested frames, shadow roots, особенности локаторов и ожиданий.</p>
            <Link to="/automation-lab/frames-shadowdom" className="feature-link">Открыть →</Link>
          </div> */}

          {/* 5 - Dynamic */}
          {/* <div className="feature-card">
            <div className="feature-top">
              <div className="feature-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="20" fill="#EC4899" opacity="0.1"/>
                  <circle cx="32" cy="32" r="20" stroke="#EC4899" strokeWidth="2"/>
                  <path d="M20 32L28 40L44 24" stroke="#EC4899" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="32" cy="32" r="4" fill="#EC4899"/>
                  <path d="M32 12V20M32 44V52M12 32H20M44 32H52" stroke="#EC4899" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="pill pill--danger">Flaky</span>
            </div>
            <h4 className="feature-title">Асинхронность</h4>
            <p className="feature-desc">Async loading, re-render, race conditions, тайминги, ожидания и стабильность.</p>
            <Link to="/automation-lab/dynamic" className="feature-link">Открыть →</Link>
          </div> */}

          {/* 6 - Clipboard */}
          {/* <div className="feature-card">
            <div className="feature-top">
              <div className="feature-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="14" y="18" width="36" height="28" rx="4" fill="#3B82F6" opacity="0.1"/>
                  <rect x="14" y="18" width="36" height="28" rx="4" stroke="#3B82F6" strokeWidth="2"/>
                  <path d="M20 26L32 34L44 26" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="20" y="32" width="24" height="4" rx="2" fill="#3B82F6"/>
                  <rect x="20" y="38" width="16" height="4" rx="2" fill="#3B82F6" opacity="0.5"/>
                </svg>
              </div>
              <span className="pill">Clipboard</span>
            </div>
            <h4 className="feature-title">Буфер обмена</h4>
            <p className="feature-desc">Clipboard API, permissions, downloads, управление файлами, flaky из-за браузера.</p>
            <Link to="/automation-lab/clipboard" className="feature-link">Открыть →</Link>
          </div> */}

          {/* 7 - Cards */}
          <div className="feature-card">
            <div className="feature-top">
              <div className="feature-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="12" y="12" width="18" height="24" rx="4" fill="#6366F1" opacity="0.1"/>
                  <rect x="12" y="12" width="18" height="24" rx="4" stroke="#6366F1" strokeWidth="2"/>
                  <rect x="34" y="12" width="18" height="24" rx="4" fill="#6366F1" opacity="0.1"/>
                  <rect x="34" y="12" width="18" height="24" rx="4" stroke="#6366F1" strokeWidth="2"/>
                  <rect x="12" y="28" width="18" height="8" rx="2" fill="#6366F1"/>
                  <rect x="34" y="28" width="18" height="8" rx="2" fill="#6366F1"/>
                  <circle cx="21" cy="20" r="2" fill="#6366F1"/>
                  <circle cx="43" cy="20" r="2" fill="#6366F1"/>
                </svg>
              </div>
              <span className="pill pill--accent">Target</span>
            </div>
            <h4 className="feature-title">Карточки данных</h4>
            <p className="feature-desc">Много карточек, поиск по id, таргетные проверки, устойчивые локаторы.</p>
            <Link to="/automation-lab/cards" className="feature-link">Открыть →</Link>
          </div>

          {/* 8 - Extra */}
          {/* <div className="feature-card">
            <div className="feature-top">
              <div className="feature-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="16" y="16" width="32" height="32" rx="6" fill="#14B8A6" opacity="0.1"/>
                  <rect x="16" y="16" width="32" height="32" rx="6" stroke="#14B8A6" strokeWidth="2"/>
                  <circle cx="32" cy="28" r="4" fill="#14B8A6"/>
                  <path d="M24 40L28 36L32 40L40 32" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="20" y="44" width="24" height="2" rx="1" fill="#14B8A6"/>
                  <rect x="24" y="48" width="16" height="2" rx="1" fill="#14B8A6" opacity="0.5"/>
                </svg>
              </div>
              <span className="pill">Extra</span>
            </div>
            <h4 className="feature-title">Дополнительно</h4>
            <p className="feature-desc">Сбор "грязных" практик: flaky, re-try, логирование, анти-паттерны ожиданий.</p>
            <Link to="/automation-lab/clicks" className="feature-link">Открыть →</Link>
          </div> */}

          {/* 9 - Subscription Form */}
          <div className="feature-card">
            <div className="feature-top">
              <div className="feature-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="18" width="44" height="28" rx="4" fill="#DC2680" opacity="0.1"/>
                  <rect x="10" y="18" width="44" height="28" rx="4" stroke="#DC2680" strokeWidth="2"/>
                  <rect x="10" y="24" width="44" height="6" fill="#DC2680" opacity="0.3"/>
                  <rect x="16" y="36" width="20" height="4" rx="2" fill="#DC2680"/>
                  <rect x="40" y="36" width="8" height="4" rx="2" fill="#DC2680" opacity="0.5"/>
                  <circle cx="48" cy="24" r="6" fill="#FFD700" opacity="0.3"/>
                  <circle cx="52" cy="24" r="6" fill="#FF6B35" opacity="0.3"/>
                </svg>
              </div>
              <span className="pill pill--accent">Test Design</span>
            </div>
            <h4 className="feature-title">Форма подписки</h4>
            <p className="feature-desc">Практика тест-дизайна: тарифы, промокоды, скидки, валидация карт, расчёты.</p>
            <Link to="/automation-lab/subscription" className="feature-link">Открыть →</Link>
          </div>

          {/* 10 - Task Management System */}
          <div className="feature-card">
            <div className="feature-top">
              <div className="feature-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="12" width="48" height="40" rx="4" fill="#6366F1" opacity="0.1"/>
                  <rect x="8" y="12" width="48" height="40" rx="4" stroke="#6366F1" strokeWidth="2"/>
                  <rect x="12" y="20" width="12" height="28" rx="2" fill="#6366F1" opacity="0.15"/>
                  <rect x="12" y="20" width="12" height="28" rx="2" stroke="#6366F1" strokeWidth="1.5"/>
                  <rect x="26" y="20" width="12" height="28" rx="2" fill="#6366F1" opacity="0.15"/>
                  <rect x="26" y="20" width="12" height="28" rx="2" stroke="#6366F1" strokeWidth="1.5"/>
                  <rect x="40" y="20" width="12" height="28" rx="2" fill="#6366F1" opacity="0.15"/>
                  <rect x="40" y="20" width="12" height="28" rx="2" stroke="#6366F1" strokeWidth="1.5"/>
                  <rect x="14" y="24" width="8" height="6" rx="1" fill="#6366F1" opacity="0.4"/>
                  <rect x="14" y="32" width="8" height="6" rx="1" fill="#6366F1" opacity="0.4"/>
                  <rect x="28" y="24" width="8" height="6" rx="1" fill="#6366F1" opacity="0.4"/>
                  <rect x="28" y="32" width="8" height="6" rx="1" fill="#6366F1" opacity="0.4"/>
                  <rect x="42" y="24" width="8" height="6" rx="1" fill="#6366F1" opacity="0.4"/>
                  <rect x="42" y="32" width="8" height="6" rx="1" fill="#6366F1" opacity="0.4"/>
                </svg>
              </div>
              <span className="pill pill--accent">Task Management System</span>
            </div>
            <h4 className="feature-title">Система управления задачами</h4>
            <p className="feature-desc">Большое приложения для практики тестирования и автоматизации</p>
            <Link to="/dashboard" className="feature-link">Открыть →</Link>
          </div>
        </div>
      </section>

      {/* HOW TO */}
      {/* <section className="info-section">
        <div className="section-head">
          <h3 className="section-title">Как использовать</h3>
          <p className="section-subtitle">Быстрый маршрут обучения: от простого к динамике.</p>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-n">1</div>
            <div className="step-body">
              <div className="step-title">Выберите страницу</div>
              <div className="step-text">Откройте категорию слева и перейдите к кейсам.</div>
            </div>
          </div>

          <div className="step">
            <div className="step-n">2</div>
            <div className="step-body">
              <div className="step-title">Посмотрите Problem → Why</div>
              <div className="step-text">Сначала поймите причину, потом решение.</div>
            </div>
          </div>

          <div className="step">
            <div className="step-n">3</div>
            <div className="step-body">
              <div className="step-title">Скопируйте решение</div>
              <div className="step-text">В каждом кейсе есть готовые примеры для Selenium и Playwright.</div>
            </div>
          </div>

          <div className="step">
            <div className="step-n">4</div>
            <div className="step-body">
              <div className="step-title">Trigger + Stress Mode</div>
              <div className="step-text">Воспроизводите флейки и учитесь стабилизировать тесты.</div>
            </div>
          </div>
        </div>
      </section> */}

      {/* BULLETS */}
      {/* <section className="info-section">
        <div className="section-head">
          <h3 className="section-title">Особенности</h3>
          <p className="section-subtitle">Почему этот тренажёр полезен для джуна и мидла.</p>
        </div>

        <div className="bullets">
          <div className="bullet">✅ Все примеры работают без сборки — просто откройте <code>index.html</code></div>
          <div className="bullet">✅ Stress режим имитирует нестабильность (flaky)</div>
          <div className="bullet">✅ Подсветка кода + копирование одним кликом</div>
          <div className="bullet">✅ Адаптивный дизайн — можно тренироваться с ноутбука/планшета</div>
          <div className="bullet">✅ Чёткая структура: Problem → Why → Solution → Assert</div>
          <div className="bullet">✅ Удобная навигация и единый стиль компонентов</div>
        </div>
      </section> */}
    </AutomationLabLayout>
  );
};
