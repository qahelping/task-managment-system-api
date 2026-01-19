import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthHeader } from '@/components/layout/AuthHeader';
import { AuthFooter } from '@/components/layout/AuthFooter';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const { addNotification } = useUIStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!formData.email) {
      setErrors({ email: 'Email обязателен' });
      return;
    }
    if (!validateEmail(formData.email)) {
      setErrors({ email: 'Неверный формат email' });
      return;
    }
    if (!formData.password) {
      setErrors({ password: 'Пароль обязателен' });
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error: any) {
      const message =
        error.response?.data?.detail || 'Ошибка входа. Проверьте данные.';
      addNotification({
        type: 'error',
        message,
      });
      if (error.response?.status === 401) {
        setErrors({ password: 'Неверный email или пароль' });
      }
    }
  };

  return (
    <>
      <div className="sky" aria-hidden="true"></div>
      <div className="layout auth-page-layout">
        <AuthHeader />
        <main className="main auth-main">
        <div className="hero hero--home auth-form-container" data-qa="login-form-container">
        <div className="auth-form-header">
          <h2 className="hero-title__glow auth-form-title" data-qa="login-title">
            Вход в систему
          </h2>
          <p className="hero-description auth-form-description">
            Или{' '}
            <Link
              to="/register"
              className="auth-form-link"
            >
              зарегистрируйтесь
            </Link>
          </p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit} data-qa="login-form">
          <div className="auth-form-fields">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              error={errors.email}
              required
              autoComplete="email"
              data-qa="login-email-input"
            />
            <Input
              label="Пароль"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              error={errors.password}
              required
              autoComplete="current-password"
              data-qa="login-password-input"
            />
          </div>
          <Button type="submit" isLoading={isLoading} className="w-full" data-qa="login-submit-button">
            Войти
          </Button>
        </form>
        </div>
        </main>
        <AuthFooter />
      </div>
    </>
  );
};

