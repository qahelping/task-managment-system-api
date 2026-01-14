import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface AutomationLabLayoutProps {
  children: React.ReactNode;
  subtitle?: string;
}

export const AutomationLabLayout: React.FC<AutomationLabLayoutProps> = ({ children, subtitle }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/automation-lab');
  };

  return (
    <div className="layout">
        <header className="header">
        <div className="header-content">
          <Link to="/automation-lab" className="brand flex-shrink-0" onClick={handleLogoClick}>
            <div className="brand-mark">
              <img 
                src="/automation-lab/assets/logo.png" 
                alt="Logo" 
                className="brand-logo-img" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }} 
              />
            </div>
            <div className="brand-text">
              <div className="brand-title">Web Automation Torture Lab</div>
              <div className="brand-subtitle">{subtitle || 'Практика автоматизации тестирования'}</div>
            </div>
          </Link>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};

