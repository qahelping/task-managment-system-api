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
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Retry logic for network errors (опционально, можно добавить позже)
// Пока используем стандартный экземпляр axios

export default api;

