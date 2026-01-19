import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthHeader } from '@/components/layout/AuthHeader';
import { AuthFooter } from '@/components/layout/AuthFooter';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const { addNotification } = useUIStore();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!formData.username || formData.username.length < 3) {
      setErrors({ username: 'Имя пользователя должно быть минимум 3 символа' });
      return;
    }
    if (!formData.email) {
      setErrors({ email: 'Email обязателен' });
      return;
    }
    if (!validateEmail(formData.email)) {
      setErrors({ email: 'Неверный формат email' });
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setErrors({ password: 'Пароль должен быть минимум 6 символов' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Пароли не совпадают' });
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password);
      addNotification({
        type: 'success',
        message: 'Регистрация успешна!',
      });
      navigate('/login');
    } catch (error: any) {
      const message =
        error.response?.data?.detail || 'Ошибка регистрации. Попробуйте снова.';
      addNotification({
        type: 'error',
        message,
      });
      if (error.response?.status === 400) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          if (detail.includes('email')) {
            setErrors({ email: 'Email уже используется' });
          } else if (detail.includes('username')) {
            setErrors({ username: 'Имя пользователя уже используется' });
          }
        }
      }
    }
  };

  return (
    <>
      <div className="sky" aria-hidden="true"></div>
      <div className="layout auth-page-layout">
        <AuthHeader />
        <main className="main auth-main">
        <div className="hero hero--home auth-form-container" data-qa="register-form-container">
        <div className="auth-form-header">
          <h2 className="hero-title__glow auth-form-title" data-qa="register-title">
            Регистрация
          </h2>
          <p className="hero-description auth-form-description">
            Или{' '}
            <Link
              to="/login"
              className="auth-form-link"
            >
              войдите в систему
            </Link>
          </p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit} data-qa="register-form">
          <div className="auth-form-fields">
            <Input
              label="Имя пользователя"
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              error={errors.username}
              required
              minLength={3}
              autoComplete="username"
              data-qa="register-username-input"
            />
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
              data-qa="register-email-input"
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
              minLength={6}
              autoComplete="new-password"
              data-qa="register-password-input"
            />
            <Input
              label="Подтверждение пароля"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
              data-qa="register-confirm-password-input"
            />
          </div>
          <Button type="submit" isLoading={isLoading} className="w-full" data-qa="register-submit-button">
            Зарегистрироваться
          </Button>
        </form>
        

        </div>
        </main>
        <AuthFooter />
      </div>
    </>
  );
};

