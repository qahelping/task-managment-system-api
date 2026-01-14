import React from 'react';
import { Link } from 'react-router-dom';
import { AutomationLabLayout } from './components/AutomationLabLayout';

export const ClicksPage: React.FC = () => {
  return (
    <AutomationLabLayout subtitle="Клики и взаимодействия">
      <Link to="/automation-lab" className="back-link">Назад</Link>
      
      <div className="page-header">
        <h2 className="page-title">Клики и взаимодействия</h2>
        <p className="page-description">
          Различные проблемы с кликами: double click, right click, hover, перекрытия элементов.
        </p>
      </div>

      <section className="case-card">
        <div className="case-head">
          <div className="case-head__left">
            <div className="case-icon">🖱️</div>
            <div>
              <h3 className="case-title">Клики и взаимодействия</h3>
            </div>
          </div>
        </div>

        <div className="sections">
          <div className="info-card info-card--problem">
            <div className="info-title">
              <span className="tag tag--problem">Problem</span>
            </div>
            <div className="info-text">
              Различные проблемы с кликами элементов: элементы перекрыты, требуют hover, double click и т.д.
            </div>
          </div>
        </div>
      </section>
    </AutomationLabLayout>
  );
};


