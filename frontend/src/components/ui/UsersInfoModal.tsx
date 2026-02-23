import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { usersService } from '@/services/users.service';
import { User } from '@/types';
import { Loader } from './Loader';

interface UsersInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UsersInfoModal: React.FC<UsersInfoModalProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  // Функция для определения стандартного пароля тестового пользователя
  const getTestPassword = (user: User): string => {
    const email = user.email.toLowerCase();
    const username = user.username.toLowerCase();
    
    // Стандартные пароли для тестовых пользователей
    if (email === 'admin@example.com' || username === 'admin') {
      return 'admin123';
    }
    if (email.includes('admin') || user.role === 'admin') {
      return 'admin123';
    }
    if (email.includes('guest') || username.includes('guest')) {
      return 'guest123';
    }
    if (email === 'user@test.com' || username === 'regular_user') {
      return 'user123';
    }
    // Стандартный пароль для большинства тестовых пользователей
    return 'password123';
  };

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Используем публичный endpoint для получения пользователей
      const data = await usersService.getPublicUsers();
      setUsers(data);
    } catch (err: any) {
      const errorMessage = err.response?.status === 404 
        ? 'Эндпоинт не найден. Убедитесь, что бэкенд запущен.'
        : err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')
        ? 'Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на порту 8000.'
        : 'Не удалось загрузить информацию о пользователях.';
      setError(errorMessage);
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Тестовые пользователи"
      size="lg"
    >
      {loading ? (
        <div className="users-modal-loader">
          <Loader />
        </div>
      ) : error ? (
        <div className="users-modal-error">
          <p>{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="users-modal-empty">
          <p>Пользователи не найдены</p>
        </div>
      ) : (
        <div className="users-modal-content">
          <p className="users-modal-description">
            Созданные пользователи в базе данных:
          </p>
          <div className="users-modal-list">
            {users.map((user) => {
              const password = getTestPassword(user);
              return (
                <div
                  key={user.id}
                  className="users-modal-card"
                >
                  <div className="users-modal-card-header">
                    <div className="users-modal-card-username">{user.email} / {password}</div>
                    {user.role === 'admin' && (
                      <span className="users-modal-card-badge">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
};

