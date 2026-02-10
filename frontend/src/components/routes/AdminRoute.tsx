import { ReactNode, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const { addNotification } = useUIStore();
  const hasNotified403 = useRef(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== 'admin' && !hasNotified403.current) {
      hasNotified403.current = true;
      addNotification({
        type: 'error',
        message: 'Доступ запрещён (403). Только для администраторов.',
      });
    }
  }, [isLoading, isAuthenticated, user?.role, addNotification]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};















