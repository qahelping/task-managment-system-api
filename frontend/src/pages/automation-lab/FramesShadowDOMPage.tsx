import React from 'react';
import { Link } from 'react-router-dom';
import { AutomationLabLayout } from './components/AutomationLabLayout';

export const FramesShadowDOMPage: React.FC = () => {
  return (
    <AutomationLabLayout subtitle="Фреймы и Shadow DOM">
      <Link to="/automation-lab" className="back-link">Назад</Link>
      
      <div className="page-header">
        <h2 className="page-title">Фреймы и Shadow DOM</h2>
        <p className="page-description">
          Iframe, вложенные фреймы, Shadow DOM, изоляция контекста.
        </p>
      </div>

      <section className="case-card">
        <div className="case-head">
          <div className="case-head__left">
            <div className="case-icon">🖼️</div>
            <div>
              <h3 className="case-title">Фреймы и Shadow DOM</h3>
            </div>
          </div>
        </div>

        <div className="sections">
          <div className="info-card info-card--problem">
            <div className="info-title">
              <span className="tag tag--problem">Problem</span>
            </div>
            <div className="info-text">
              Проблемы с iframe, вложенными фреймами, Shadow DOM и изоляцией контекста.
            </div>
          </div>
        </div>
      </section>
    </AutomationLabLayout>
  );
};


