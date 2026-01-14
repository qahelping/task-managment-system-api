import { Link, useLocation } from 'react-router-dom';
import { useBoardsStore } from '@/stores/boardsStore';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';
import { FiHome, FiGrid, FiPlus, FiMenu, FiX, FiMoreVertical, FiSettings } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { boards, fetchBoards } = useBoardsStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen, openModal } = useUIStore();
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
              to="/"
              className={cn(
                'sidebar-link',
                isActive('/') && 'active'
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

          <div style={{ marginTop: '32px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '16px', padding: '0 16px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Доски
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  openModal('createBoard');
                  setSidebarOpen(false);
                }}
                data-qa="sidebar-create-board-button"
              >
                <FiPlus style={{ width: '16px', height: '16px' }} />
              </Button>
            </div>
            <div className="sidebar-boards-list" role="list" data-qa="sidebar-boards-list">
              {boards.length === 0 ? (
                <p className="sidebar-no-boards" data-qa="sidebar-no-boards">Нет досок</p>
              ) : (
                <>
                  {boards.slice(0, 5).map((board) => {
                    const isSelected = location.pathname === `/boards/${board.id}`;
                    return (
                      <div
                        key={board.id}
                        role="listitem"
                        className={cn(
                          'sidebar-board-item',
                          isSelected && 'sidebar-board-item--selected'
                        )}
                        data-selected={isSelected}
                        data-qa={`sidebar-board-item-${board.id}`}
                      >
                        <div className="sidebar-board-container">
                          <Link
                            to={`/boards/${board.id}`}
                            className="sidebar-board-link"
                            onClick={() => setSidebarOpen(false)}
                            data-qa={`sidebar-board-link-${board.id}`}
                          >
                            <div className="sidebar-board-link-content">
                              <div className="sidebar-board-indent"></div>
                              <div className="sidebar-board-content">
                                <svg
                                  className="sidebar-board-icon"
                                  fill="none"
                                  viewBox="0 0 16 16"
                                  role="presentation"
                                  aria-hidden="true"
                                >
                                  <path
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    d="M2 3.5a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h2.833v-9zm4.333 0v9h3.334v-9zm4.834 0v9H14a.5.5 0 0 0 .5-.5V4a.5.5 0 0 0-.5-.5zM0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="sidebar-board-title">{board.title}</span>
                              </div>
                            </div>
                          </Link>
                          <div className="sidebar-board-actions">
                            <button
                              className="sidebar-board-action-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // TODO: Add board actions menu
                              }}
                              aria-label="Board actions"
                              data-qa={`sidebar-board-actions-${board.id}`}
                            >
                              <FiMoreVertical className="icon-sm" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {boards.length > 5 && (
                    <div
                      role="listitem"
                      className="sidebar-board-item sidebar-board-item--view-all"
                      data-selected={location.pathname === '/boards'}
                      data-qa="sidebar-board-view-all"
                    >
                      <div className="sidebar-board-container">
                        <Link
                          to="/boards"
                          className="sidebar-board-link"
                          onClick={() => setSidebarOpen(false)}
                          data-qa="sidebar-board-view-all-link"
                        >
                          <div className="sidebar-board-link-content">
                            <div className="sidebar-board-indent"></div>
                            <div className="sidebar-board-content">
                              <svg
                                className="sidebar-board-icon"
                                fill="none"
                                viewBox="0 0 16 16"
                                role="presentation"
                                aria-hidden="true"
                              >
                                <path
                                  fill="currentColor"
                                  fillRule="evenodd"
                                  d="M15 3.5H1V2h14zm0 5.25H1v-1.5h14zM8 14H1v-1.5h7z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="sidebar-board-title">Показать все доски</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
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

