import api from '@/utils/api';
import { Task, TaskCreate, TaskUpdate, TaskStatus, TaskPriority } from '@/types';

export const tasksService = {
  async getTasksByBoard(
    boardId: number,
    status?: TaskStatus,
    priority?: TaskPriority
  ): Promise<Task[]> {
    const response = await api.get<Task[]>(`/boards/${boardId}/tasks`, {
      params: { status, priority },
    });
    return response.data;
  },

  async getPublicTasksByBoard(
    boardId: number,
    status?: TaskStatus,
    priority?: TaskPriority
  ): Promise<Task[]> {
    // Используем прямой axios запрос без токена для публичного доступа
    const axios = (await import('axios')).default;
    const getApiBaseUrl = () => {
      const envUrl = import.meta.env.VITE_API_BASE_URL;
      if (envUrl) return envUrl;
      if (import.meta.env.PROD) return '/api';
      return 'http://localhost:8000';
    };
    const API_BASE_URL = getApiBaseUrl();
    const response = await axios.get<Task[]>(`${API_BASE_URL}/boards/public/${boardId}/tasks`, {
      params: { status, priority },
    });
    return response.data;
  },

  async getTaskById(boardId: number, taskId: number): Promise<Task> {
    const response = await api.get<Task>(`/boards/${boardId}/tasks/${taskId}`);
    return response.data;
  },

  async createTask(boardId: number, data: TaskCreate): Promise<Task> {
    const response = await api.post<Task>(`/boards/${boardId}/tasks`, data);
    return response.data;
  },

  async updateTask(boardId: number, taskId: number, data: TaskUpdate): Promise<Task> {
    const response = await api.put<Task>(`/boards/${boardId}/tasks/${taskId}`, data);
    return response.data;
  },

  async deleteTask(boardId: number, taskId: number): Promise<void> {
    await api.delete(`/boards/${boardId}/tasks/${taskId}`);
  },

  async updateTaskStatus(taskId: number, status: TaskStatus): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${taskId}/status/${status}`);
    return response.data;
  },

  async updateTaskPriority(taskId: number, priority: TaskPriority): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${taskId}/priority/${priority}`);
    return response.data;
  },

  async moveTaskToNextStatus(taskId: number): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${taskId}/next-status`);
    return response.data;
  },

  async moveTaskToBoard(
    boardId: number,
    taskId: number,
    targetBoardId: number
  ): Promise<Task> {
    const response = await api.put<Task>(
      `/boards/${boardId}/tasks/${taskId}/move-to/${targetBoardId}`
    );
    return response.data;
  },

  async searchTasks(query: string): Promise<Task[]> {
    const response = await api.get<Task[]>('/tasks/search', {
      params: { q: query },
    });
    return response.data;
  },

  async reorderTasks(boardId: number, orderedIds: number[]): Promise<void> {
    await api.put(`/boards/${boardId}/tasks/reorder`, {
      ordered_ids: orderedIds,
    });
  },
};

