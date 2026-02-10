import api from '@/utils/api';
import { DashboardStats, Board, Task } from '@/types';

export interface AdminBoardsResponse {
  boards: Board[];
  total: number;
}

export interface AdminTasksResponse {
  tasks: Task[];
  total: number;
}

export const statsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/stats/dashboard');
    return response.data;
  },

  async getAllBoardsAdmin(skip = 0, limit = 100, archived?: boolean): Promise<AdminBoardsResponse> {
    const params: any = { skip, limit };
    if (archived !== undefined) {
      params.archived = archived;
    }
    const response = await api.get<AdminBoardsResponse>('/stats/admin/all-boards', { params });
    return response.data;
  },

  async getAllTasksAdmin(
    skip = 0,
    limit = 100,
    status?: string,
    priority?: string
  ): Promise<AdminTasksResponse> {
    const params: any = { skip, limit };
    if (status) params.status_filter = status;
    if (priority) params.priority_filter = priority;
    const response = await api.get<AdminTasksResponse>('/stats/admin/all-tasks', { params });
    return response.data;
  },
};


















