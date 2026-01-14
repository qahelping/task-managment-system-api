import React from 'react';
import { FiInbox } from 'react-icons/fi';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Нет данных',
  message = 'Здесь пока ничего нет',
  icon,
  action,
}) => {
  return (
    <div className="empty-state">
      {icon || <FiInbox style={{ width: '64px', height: '64px', color: 'var(--muted)', marginBottom: '16px' }} />}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};











