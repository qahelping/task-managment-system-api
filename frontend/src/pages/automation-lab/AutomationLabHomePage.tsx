import React from 'react';
import { Link } from 'react-router-dom';
import { AutomationLabLayout } from './components/AutomationLabLayout';

export const AutomationLabHomePage: React.FC = () => {
  return (
    <AutomationLabLayout>
      {/* HERO */}
      <section className="hero hero--home">
        <div className="hero-badge">
          <span className="dot"></span>
          Практика Selenium + Playwright • реальные "flaky" кейсы
        </div>

        <h2 className="hero-title">
          Web Automation Torture Lab
          <span className="hero-title__glow">для автоматизаторов</span>
        </h2>

        <p className="hero-description">
          Тренажёр для веб-автоматизации: клики, формы, оверлеи, фреймы, асинхронность, буфер обмена и карточки данных.
          Каждый кейс — с проблемой, причиной и решением.
        </p>

        <div className="hero-actions">
          <Link className="btn btn-primary" to="/automation-lab/clicks">
            Начать практику →
          </Link>
          <Link className="btn btn-ghost" to="/automation-lab/cards">
            Карточки данных
          </Link>
        </div>

        {/* STATS */}
        <div className="stats">
          <div className="stat">
            <div className="stat-value">8+</div>
            <div className="stat-label">категорий</div>
          </div>
          <div className="stat">
            <div className="stat-value">40+</div>
            <div className="stat-label">кейсов</div>
          </div>
          <div className="stat">
            <div className="stat-value">2</div>
            <div className="stat-label">фреймворка</div>
          </div>
          <div className="stat">
            <div className="stat-value">Stress</div>
            <div className="stat-label">режим</div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="section-head">
          <h3 className="section-title">Категории</h3>
          <p className="section-subtitle">Выбирай блок — внутри готовые "тормозилки" и анти-паттерны для тестов.</p>
        </div>

        <div className="features-grid">
          {/* 1 */}
          <div className="feature-card">
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
          </div>

          {/* 2 */}
          <div className="feature-card">
            <div className="feature-top">
              <div className="feature-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="12" y="12" width="40" height="40" rx="8" fill="#4F46E5" opacity="0.1"/>
                  <rect x="20" y="20" width="24" height="24" rx="4" fill="#4F46E5"/>
                </svg>
              </div>
              <span className="pill pill--accent">Forms</span>
            </div>
            <h4 className="feature-title">Формы и инпуты</h4>
            <p className="feature-desc">Controlled inputs, маски, кастомные селекты, blur-валидация.</p>
            <Link to="/automation-lab/forms" className="feature-link">Открыть →</Link>
          </div>

          {/* 3 */}
          <div className="feature-card">
            <div className="feature-top">
              <div className="feature-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="12" y="12" width="40" height="40" rx="8" fill="#4F46E5" opacity="0.1"/>
                  <rect x="18" y="18" width="28" height="28" rx="4" fill="#4F46E5" opacity="0.3"/>
                  <rect x="22" y="22" width="20" height="20" rx="2" fill="#4F46E5"/>
                </svg>
              </div>
              <span className="pill pill--accent">Overlays</span>
            </div>
            <h4 className="feature-title">Оверлеи и модалки</h4>
            <p className="feature-desc">Модальные окна, порталы, sticky headers, toast-уведомления.</p>
            <Link to="/automation-lab/overlays" className="feature-link">Открыть →</Link>
          </div>

          {/* 4 */}
          <div className="feature-card">
            <div className="feature-top">
              <div className="feature-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="12" y="12" width="40" height="40" rx="8" fill="#4F46E5" opacity="0.1"/>
                  <rect x="16" y="16" width="32" height="24" rx="2" fill="#4F46E5" opacity="0.2"/>
                  <rect x="20" y="20" width="24" height="16" rx="1" fill="#4F46E5"/>
                </svg>
              </div>
              <span className="pill pill--accent">Frames</span>
            </div>
            <h4 className="feature-title">Фреймы и Shadow DOM</h4>
            <p className="feature-desc">Iframe, вложенные фреймы, Shadow DOM, изоляция контекста.</p>
            <Link to="/automation-lab/frames-shadowdom" className="feature-link">Открыть →</Link>
          </div>

          {/* 5 */}
          <div className="feature-card">
            <div className="feature-top">
              <div className="feature-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="12" y="12" width="40" height="40" rx="8" fill="#4F46E5" opacity="0.1"/>
                  <circle cx="32" cy="32" r="8" fill="#4F46E5"/>
                  <path d="M28 32L30 34L36 28" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="pill pill--accent">Dynamic</span>
            </div>
            <h4 className="feature-title">Динамический контент</h4>
            <p className="feature-desc">Lazy loading, infinite scroll, A/B тесты, stale элементы.</p>
            <Link to="/automation-lab/dynamic" className="feature-link">Открыть →</Link>
          </div>

          {/* 6 */}
          <div className="feature-card">
            <div className="feature-top">
              <div className="feature-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="12" y="12" width="40" height="40" rx="8" fill="#4F46E5" opacity="0.1"/>
                  <rect x="20" y="20" width="24" height="18" rx="2" fill="#4F46E5" opacity="0.3"/>
                  <rect x="24" y="24" width="16" height="10" rx="1" fill="#4F46E5"/>
                </svg>
              </div>
              <span className="pill pill--accent">Cards</span>
            </div>
            <h4 className="feature-title">Карточки данных</h4>
            <p className="feature-desc">Асинхронная загрузка, банковские карты, списки задач.</p>
            <Link to="/automation-lab/cards" className="feature-link">Открыть →</Link>
          </div>

          {/* 7 */}
          <div className="feature-card">
            <div className="feature-top">
              <div className="feature-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="12" y="12" width="40" height="40" rx="8" fill="#4F46E5" opacity="0.1"/>
                  <path d="M24 28L32 36L40 28" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="pill pill--accent">Clipboard</span>
            </div>
            <h4 className="feature-title">Буфер обмена</h4>
            <p className="feature-desc">Clipboard API, execCommand, download links, копирование данных.</p>
            <Link to="/automation-lab/clipboard" className="feature-link">Открыть →</Link>
          </div>
        </div>
      </section>

      {/* HOW TO */}
      <section className="info-section">
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
      </section>
    </AutomationLabLayout>
  );
};
