import api from '@/utils/api';
import { LoginRequest, RegisterRequest, TokenResponse, User } from '@/types';

export const authService = {
  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/register', data);
    return response.data;
  },

  async registerGuest(data: RegisterRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/register-guest', data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};













