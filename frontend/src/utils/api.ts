import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Определяем baseURL в зависимости от окружения
// В продакшн (Docker) используем /api, который проксируется nginx к backend
// В dev режиме используем переменную окружения или localhost
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;
  
  // В продакшн режиме (когда нет VITE_API_BASE_URL) используем относительный путь
  // Nginx будет проксировать /api к backend
  if (import.meta.env.PROD) {
    return '/api';
  }
  
  // В dev режиме используем localhost
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Публичные эндпоинты не требуют токена
    const publicEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/register-admin',
      '/auth/register-guest',
      '/boards/public',
      '/users/public',
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors
let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Проверяем, что это не публичный эндпоинт
      const publicEndpoints = [
        '/auth/login',
        '/auth/register',
        '/auth/register-admin',
        '/auth/register-guest',
        '/boards/public',
        '/users/public',
        '/bank_cards',
      ];
      
      const isPublicEndpoint = publicEndpoints.some(endpoint => 
        error.config?.url?.includes(endpoint)
      );
      
      // Если это публичный эндпоинт, просто возвращаем ошибку без редиректа
      if (isPublicEndpoint) {
        return Promise.reject(error);
      }
      
      // Проверяем, что мы не на странице логина и не происходит уже редирект
      const currentPath = window.location.pathname;
      const isOnLoginPage = currentPath === '/login' || currentPath === '/register';
      
      if (!isRedirecting && !isOnLoginPage) {
        isRedirecting = true;
        
        // Очищаем токен и данные пользователя
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Используем sessionStorage для предотвращения множественных редиректов
        const redirectKey = 'auth_redirect_in_progress';
        if (!sessionStorage.getItem(redirectKey)) {
          sessionStorage.setItem(redirectKey, 'true');
          
          // Редирект на страницу логина
          window.location.href = '/login';
          
          // Очищаем флаг через небольшую задержку
          setTimeout(() => {
            sessionStorage.removeItem(redirectKey);
            isRedirecting = false;
          }, 1000);
        } else {
          isRedirecting = false;
        }
      }
    }
    return Promise.reject(error);
  }
);

// Retry logic for network errors (опционально, можно добавить позже)
// Пока используем стандартный экземпляр axios

export default api;

