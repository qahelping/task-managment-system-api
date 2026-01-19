import { Link, useLocation } from 'react-router-dom';
import { useBoardsStore } from '@/stores/boardsStore';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';
import { FiHome, FiGrid, FiMenu, FiX, FiSettings } from 'react-icons/fi';
import { cn } from '@/utils/cn';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { fetchBoards } = useBoardsStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchBoards();
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [fetchBoards]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <button
          className="sidebar-mobile-toggle"
          style={{
            position: 'fixed',
            top: '24px',
            left: '24px',
            zIndex: 40,
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--stroke)',
            background: 'var(--panel-strong)',
            color: 'var(--text)',
            cursor: 'pointer',
            transition: 'all .2s ease'
          }}
          onClick={toggleSidebar}
        >
          {sidebarOpen ? (
            <FiX style={{ width: '24px', height: '24px' }} />
          ) : (
            <FiMenu style={{ width: '24px', height: '24px' }} />
          )}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'sidebar',
          sidebarOpen && 'open'
        )}
        style={{
          position: isMobile ? 'fixed' : 'static',
          zIndex: 30,
          width: '280px',
          height: '100%',
          transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: 'transform .3s ease'
        }}
      >
        <div className="sidebar-nav">
          <nav className="space-y-2" data-qa="sidebar-navigation">
            <Link
              to="/dashboard"
              className={cn(
                'sidebar-link',
                isActive('/dashboard') && 'active'
              )}
              onClick={() => setSidebarOpen(false)}
              data-qa="sidebar-home-link"
            >
              <FiHome style={{ width: '20px', height: '20px' }} />
              <span>Главная</span>
            </Link>
            <Link
              to="/boards"
              className={cn(
                'sidebar-link',
                isActive('/boards') && 'active'
              )}
              onClick={() => setSidebarOpen(false)}
              data-qa="sidebar-boards-link"
            >
              <FiGrid style={{ width: '20px', height: '20px' }} />
              <span>Все доски</span>
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={cn(
                  'sidebar-link',
                  isActive('/admin') && 'active'
                )}
                onClick={() => setSidebarOpen(false)}
                data-qa="sidebar-admin-link"
              >
                <FiSettings style={{ width: '20px', height: '20px' }} />
                <span>Административная панель</span>
              </Link>
            )}
          </nav>

          </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 20
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

