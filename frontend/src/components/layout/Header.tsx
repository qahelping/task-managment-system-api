import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { FiLogOut, FiUser, FiSearch, FiChevronDown } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { searchQuery, setSearchQuery } = useUIStore();
  const location = useLocation();
  const isBoardPage = location.pathname.startsWith('/boards/') && location.pathname !== '/boards';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };


  // Закрытие выпадающего списка при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className="header" data-qa="header">
      <div className="header-content">
        <Link 
          to="/" 
          className="brand flex-shrink-0" 
          data-qa="header-logo-link"
        >
          <div className="brand-mark">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="brand-logo-img" 
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
        
        {/* Поиск задач - показывается только на странице доски */}
        {isBoardPage && (
          <div className="header-search-container" data-qa="header-search-container">
            <div className="header-search-wrapper">
              <FiSearch className="header-search-icon" />
              <input
                type="text"
                placeholder="Поиск задач..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="header-search-input"
                data-qa="header-search-input"
              />
            </div>
          </div>
        )}

        <div className="header-actions flex-shrink-0" data-qa="header-user-menu">
          {user && (
            <div className={cn('header-user-dropdown', dropdownOpen && 'open')} ref={dropdownRef}>
              <button
                className="header-user-info"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                data-qa="header-user-info"
              >
                <div className="header-user-avatar" data-qa="header-user-avatar">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                    />
                  ) : (
                    <FiUser />
                  )}
                </div>
                <span className="header-username" data-qa="header-username">
                  {user.username}
                </span>
                <FiChevronDown className="header-user-dropdown-icon" />
              </button>
              {dropdownOpen && (
                <div className="header-user-dropdown-menu">
                  <div className="header-user-dropdown-info">
                    <div className="header-user-dropdown-avatar">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                        />
                      ) : (
                        <FiUser />
                      )}
                    </div>
                    <div className="header-user-dropdown-details">
                      <div className="header-user-dropdown-name">{user.username}</div>
                      <div className="header-user-dropdown-email">{user.email}</div>
                      {user.role === 'admin' && (
                        <div className="header-user-dropdown-role">Администратор</div>
                      )}
                    </div>
                  </div>
                  <div className="header-user-dropdown-divider"></div>
                  <button
                    className="header-user-dropdown-item"
                    onClick={handleLogout}
                    data-qa="header-logout-button"
                  >
                    <FiLogOut className="header-user-dropdown-item-icon" />
                    <span>Выход</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

