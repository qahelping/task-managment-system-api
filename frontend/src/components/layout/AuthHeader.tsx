import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const AuthHeader: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Если пользователь авторизован - переводим на главную (дашборд)
    // Если не авторизован - переводим на страницу логина
    if (isAuthenticated) {
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link 
          to={isAuthenticated ? "/" : "/login"} 
          className="brand flex-shrink-0"
          onClick={handleLogoClick}
        >
          <div className="brand-mark">
            <img 
              src="/automation-lab/assets/logo.png" 
              alt="Logo" 
              className="brand-logo-img" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isAuthenticated) {
                  navigate('/');
                } else {
                  navigate('/login');
                }
              }}
              style={{ cursor: 'pointer' }}
              onError={(e) => {
                // Если логотип не найден, скрываем его
                e.currentTarget.style.display = 'none';
              }} 
            />
          </div>
          <div className="brand-text">
            <div className="brand-title">Task Management System</div>
            <div className="brand-subtitle">Система управления задачами</div>
          </div>
        </Link>
      </div>
    </header>
  );
};

