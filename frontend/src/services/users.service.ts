import api from '@/utils/api';
import { User } from '@/types';

export const usersService = {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users/');
    return response.data;
  },

  async getPublicUsers(): Promise<User[]> {
    // Используем прямой axios запрос без токена для публичного доступа
    const axios = (await import('axios')).default;
    const getApiBaseUrl = () => {
      const envUrl = import.meta.env.VITE_API_BASE_URL;
      if (envUrl) return envUrl;
      if (import.meta.env.PROD) return '/api';
      return 'http://localhost:8000';
    };
    const API_BASE_URL = getApiBaseUrl();
    const response = await axios.get<User[]>(`${API_BASE_URL}/users/public`);
    return response.data;
  },

  async getUserById(userId: number): Promise<User> {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  },
};











