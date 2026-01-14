import React from 'react';
import { Link } from 'react-router-dom';
import { AutomationLabLayout } from './components/AutomationLabLayout';

export const OverlaysPage: React.FC = () => {
  return (
    <AutomationLabLayout subtitle="Оверлеи и модалки">
      <Link to="/automation-lab" className="back-link">Назад</Link>
      
      <div className="page-header">
        <h2 className="page-title">Оверлеи и модалки</h2>
        <p className="page-description">
          Модальные окна, порталы, sticky headers, toast-уведомления.
        </p>
      </div>

      <section className="case-card">
        <div className="case-head">
          <div className="case-head__left">
            <div className="case-icon">🪟</div>
            <div>
              <h3 className="case-title">Оверлеи и модалки</h3>
            </div>
          </div>
        </div>

        <div className="sections">
          <div className="info-card info-card--problem">
            <div className="info-title">
              <span className="tag tag--problem">Problem</span>
            </div>
            <div className="info-text">
              Проблемы с модальными окнами, порталами, sticky headers и toast-уведомлениями.
            </div>
          </div>
        </div>
      </section>
    </AutomationLabLayout>
  );
};


