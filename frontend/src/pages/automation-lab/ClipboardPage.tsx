import React from 'react';
import { Link } from 'react-router-dom';
import { AutomationLabLayout } from './components/AutomationLabLayout';

export const ClipboardPage: React.FC = () => {
  return (
    <AutomationLabLayout subtitle="Буфер обмена">
      <Link to="/automation-lab" className="back-link">Назад</Link>
      
      <div className="page-header">
        <h2 className="page-title">Буфер обмена</h2>
        <p className="page-description">
          Clipboard API, execCommand, download links, копирование данных.
        </p>
      </div>

      <section className="case-card">
        <div className="case-head">
          <div className="case-head__left">
            <div className="case-icon">📋</div>
            <div>
              <h3 className="case-title">Буфер обмена</h3>
            </div>
          </div>
        </div>

        <div className="sections">
          <div className="info-card info-card--problem">
            <div className="info-title">
              <span className="tag tag--problem">Problem</span>
            </div>
            <div className="info-text">
              Проблемы с буфером обмена: Clipboard API, execCommand, download links, копирование данных.
            </div>
          </div>
        </div>
      </section>
    </AutomationLabLayout>
  );
};


