import api from '@/utils/api';
import { DashboardStats } from '@/types';

export const statsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/stats/dashboard');
    return response.data;
  },
};

















