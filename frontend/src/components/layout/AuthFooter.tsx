import { useState } from 'react';
import { UsersInfoModal } from '@/components/ui/UsersInfoModal';
import { FiUsers } from 'react-icons/fi';

export const AuthFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);

  return (
    <>
      <footer className="footer" style={{ paddingBottom: 0, paddingTop: 0 }}>
        <div className="container" style={{ paddingBottom: '10px', paddingTop: '10px' }}>
          <div className="auth-footer-content">
            <p className="auth-footer-text">
              Task Management System © {currentYear} | Для управления задачами и проектами
            </p>
            <button
              onClick={() => setIsUsersModalOpen(true)}
              className="auth-footer-btn"
            >
              <FiUsers className="icon-sm" />
              <span>Тестовые пользователи</span>
            </button>
          </div>
        </div>
      </footer>
      <UsersInfoModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
      />
    </>
  );
};

