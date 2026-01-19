import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { ToastContainer } from './components/ui/Toast';
import { Loader } from './components/ui/Loader';
import { PrivateRoute } from './components/routes/PrivateRoute';
import { AdminRoute } from './components/routes/AdminRoute';

// Lazy loading для уменьшения начального размера bundle
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const BoardsPage = lazy(() => import('./pages/boards/BoardsPage').then(m => ({ default: m.BoardsPage })));
const BoardDetailPage = lazy(() => import('./pages/boards/BoardDetailPage').then(m => ({ default: m.BoardDetailPage })));
const PublicBoardPage = lazy(() => import('./pages/boards/PublicBoardPage').then(m => ({ default: m.PublicBoardPage })));
const AdminPage = lazy(() => import('./pages/admin/AdminPage').then(m => ({ default: m.AdminPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const AutomationLabHomePage = lazy(() => import('./pages/automation-lab/AutomationLabHomePage').then(m => ({ default: m.AutomationLabHomePage })));
const CardsPage = lazy(() => import('./pages/automation-lab/CardsPage').then(m => ({ default: m.CardsPage })));
const ClicksPage = lazy(() => import('./pages/automation-lab/ClicksPage').then(m => ({ default: m.ClicksPage })));
const FormsPage = lazy(() => import('./pages/automation-lab/FormsPage').then(m => ({ default: m.FormsPage })));
const OverlaysPage = lazy(() => import('./pages/automation-lab/OverlaysPage').then(m => ({ default: m.OverlaysPage })));
const FramesShadowDOMPage = lazy(() => import('./pages/automation-lab/FramesShadowDOMPage').then(m => ({ default: m.FramesShadowDOMPage })));
const DynamicPage = lazy(() => import('./pages/automation-lab/DynamicPage').then(m => ({ default: m.DynamicPage })));
const ClipboardPage = lazy(() => import('./pages/automation-lab/ClipboardPage').then(m => ({ default: m.ClipboardPage })));
const SubscriptionPage = lazy(() => import('./pages/automation-lab/SubscriptionPage').then(m => ({ default: m.SubscriptionPage })));

function App() {
  const { checkAuth, isAuthenticated, isLoading, logout } = useAuthStore();
  const { notifications, removeNotification } = useUIStore();

  useEffect(() => {
    checkAuth().catch((error) => {
      console.error('Auth check failed:', error);
    });
  }, [checkAuth]);

  // Обработка события storage для синхронизации между вкладками
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Если токен был удален в другой вкладке
      if (e.key === 'token' && e.newValue === null && e.oldValue !== null) {
        // Очищаем состояние и перенаправляем на логин, если не на странице логина/регистрации
        const currentPath = window.location.pathname;
        const isOnAuthPage = currentPath === '/login' || currentPath === '/register';
        
        if (!isOnAuthPage && isAuthenticated) {
          logout();
          // Используем replace вместо href, чтобы избежать добавления в историю
          window.location.replace('/login');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, logout]);

  // Показываем загрузку только если проверяем аутентификацию
  if (isLoading && !isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin" style={{ width: '48px', height: '48px', border: '2px solid var(--stroke)', borderTopColor: 'var(--accent)', borderRadius: '50%', margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--muted)' }}>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={<Loader fullScreen />}>
        <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
          }
        />
        <Route
          path="/"
          element={<AutomationLabHomePage />}
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/boards"
          element={
            <PrivateRoute>
              <BoardsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/boards/:id"
          element={
            <PrivateRoute>
              <BoardDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/public/boards/:id"
          element={<PublicBoardPage />}
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route
          path="/automation-lab"
          element={<AutomationLabHomePage />}
        />
        <Route
          path="/automation-lab/index.html"
          element={<AutomationLabHomePage />}
        />
        {/* Редирект старого пути на главную */}
        <Route
          path="/automation-lab/index"
          element={<Navigate to="/" replace />}
        />
        <Route
          path="/automation-lab/cards"
          element={<CardsPage />}
        />
        <Route
          path="/automation-lab/clicks"
          element={<ClicksPage />}
        />
        <Route
          path="/automation-lab/forms"
          element={<FormsPage />}
        />
        <Route
          path="/automation-lab/overlays"
          element={<OverlaysPage />}
        />
        <Route
          path="/automation-lab/frames-shadowdom"
          element={<FramesShadowDOMPage />}
        />
        <Route
          path="/automation-lab/dynamic"
          element={<DynamicPage />}
        />
        <Route
          path="/automation-lab/clipboard"
          element={<ClipboardPage />}
        />
        <Route
          path="/automation-lab/subscription"
          element={<SubscriptionPage />}
        />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      </Suspense>
      <ToastContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </>
  );
}

export default App;

