import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../../styles/indigo-styles.css';
import '../../../styles/aurora.css';

interface AutomationLabLayoutProps {
  children: React.ReactNode;
  subtitle?: string;
  showFooter?: boolean;
  brandTitle?: string;
  showBackButton?: boolean;
  backLink?: string;
}

export const AutomationLabLayout: React.FC<AutomationLabLayoutProps> = ({ 
  children, 
  subtitle,
  showFooter = false,
  brandTitle = 'Web Automation Torture Lab',
  showBackButton = false,
  backLink = '/automation-lab'
}) => {
  useEffect(() => {
    // Set current year in footer
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear().toString();
    }
  }, []);

  return (
    <>
      <div className="sky" aria-hidden="true"></div>
      <div className="layout" data-style="s2">
        <header className="header">
          <div className="header-content">
            <Link to="/automation-lab" className="brand flex-shrink-0">
              <div className="brand-mark">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="brand-logo-img" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }} 
                />
              </div>
              <div className="brand-text">
                <div className="brand-title">{brandTitle}</div>
                <div className="brand-subtitle">{subtitle || 'Практика автоматизации тестирования'}</div>
              </div>
            </Link>
            {showBackButton && (
              <div className="header-actions">
                <Link to={backLink} className="back-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Назад
                </Link>
              </div>
            )}
          </div>
        </header>

        <main className="main">
          <div className="container">
            {children}
          </div>
        </main>

        {showFooter && (
          <footer className="footer">
            <div className="container">
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>
                Web Automation Torture Lab © <span id="currentYear">{new Date().getFullYear()}</span> | Для автоматизаторов тестирования
              </p>
            </div>
          </footer>
        )}
      </div>
    </>
  );
};
