import React from 'react';
import { Link } from 'react-router-dom';
import { AutomationLabLayout } from './components/AutomationLabLayout';

export const DynamicPage: React.FC = () => {
  return (
    <AutomationLabLayout subtitle="Динамический контент">
      <Link to="/automation-lab" className="back-link">Назад</Link>
      
      <div className="page-header">
        <h2 className="page-title">Динамический контент</h2>
        <p className="page-description">
          Lazy loading, infinite scroll, A/B тесты, stale элементы.
        </p>
      </div>

      <section className="case-card">
        <div className="case-head">
          <div className="case-head__left">
            <div className="case-icon">⚡</div>
            <div>
              <h3 className="case-title">Динамический контент</h3>
            </div>
          </div>
        </div>

        <div className="sections">
          <div className="info-card info-card--problem">
            <div className="info-title">
              <span className="tag tag--problem">Problem</span>
            </div>
            <div className="info-text">
              Проблемы с динамическим контентом: lazy loading, infinite scroll, A/B тесты, stale элементы.
            </div>
          </div>
        </div>
      </section>
    </AutomationLabLayout>
  );
};


