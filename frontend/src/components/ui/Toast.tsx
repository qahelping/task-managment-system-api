import React from 'react';
import { createPortal } from 'react-dom';
import { Notification } from '@/types';
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';

interface ToastProps {
  notification: Notification;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const icons = {
    success: FiCheckCircle,
    error: FiAlertCircle,
    warning: FiAlertTriangle,
    info: FiInfo,
  };

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          background: 'rgba(25, 195, 125, 0.16)',
          borderColor: 'rgba(25, 195, 125, 0.4)',
          color: 'rgba(25, 195, 125, 0.95)',
          iconColor: 'rgba(25, 195, 125, 0.9)',
        };
      case 'error':
        return {
          background: 'rgba(255, 90, 95, 0.16)',
          borderColor: 'rgba(255, 90, 95, 0.4)',
          color: 'rgba(255, 90, 95, 0.95)',
          iconColor: 'rgba(255, 90, 95, 0.9)',
        };
      case 'warning':
        return {
          background: 'rgba(255, 204, 102, 0.16)',
          borderColor: 'rgba(255, 204, 102, 0.4)',
          color: 'rgba(255, 204, 102, 0.95)',
          iconColor: 'rgba(255, 204, 102, 0.9)',
        };
      case 'info':
      default:
        return {
          background: 'rgba(99, 166, 255, 0.16)',
          borderColor: 'rgba(99, 166, 255, 0.4)',
          color: 'rgba(99, 166, 255, 0.95)',
          iconColor: 'rgba(99, 166, 255, 0.9)',
        };
    }
  };

  const Icon = icons[notification.type];
  const styles = getToastStyles(notification.type);

  return (
    <div
      className="toast-notification animate-slide-in"
      style={{
        background: styles.background,
        borderColor: styles.borderColor,
        color: styles.color,
      }}
    >
      <Icon className="toast-icon" style={{ color: styles.iconColor }} />
      <p className="toast-message">{notification.message}</p>
      <button
        onClick={onClose}
        className="toast-close-btn"
        aria-label="Close notification"
      >
        <FiX />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  notifications,
  onRemove,
}) => {
  if (notifications.length === 0) return null;

  const container = (
    <div className="toast-container">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );

  return createPortal(container, document.body);
};















