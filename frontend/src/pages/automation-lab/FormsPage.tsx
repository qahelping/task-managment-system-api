import React from 'react';
import { Link } from 'react-router-dom';
import { AutomationLabLayout } from './components/AutomationLabLayout';

export const FormsPage: React.FC = () => {
  return (
    <AutomationLabLayout subtitle="Формы и инпуты">
      <Link to="/automation-lab" className="back-link">Назад</Link>
      
      <div className="page-header">
        <h2 className="page-title">Формы и инпуты</h2>
        <p className="page-description">
          Проблемы с формами: controlled inputs, маски, кастомные селекты, blur-валидация.
        </p>
      </div>

      <section className="case-card">
        <div className="case-head">
          <div className="case-head__left">
            <div className="case-icon">📝</div>
            <div>
              <h3 className="case-title">Формы и инпуты</h3>
            </div>
          </div>
        </div>

        <div className="sections">
          <div className="info-card info-card--problem">
            <div className="info-title">
              <span className="tag tag--problem">Problem</span>
            </div>
            <div className="info-text">
              Различные проблемы с формами: controlled inputs, маски ввода, кастомные селекты, валидация на blur.
            </div>
          </div>
        </div>
      </section>
    </AutomationLabLayout>
  );
};


