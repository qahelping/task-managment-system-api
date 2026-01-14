import { create } from 'zustand';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { tasksService } from '@/services/tasks.service';

interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
  filters: {
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
  };
  fetchTasks: (boardId: number, status?: TaskStatus, priority?: TaskPriority) => Promise<void>;
  createTask: (boardId: number, data: { title: string; description?: string; status?: TaskStatus; priority?: TaskPriority }) => Promise<Task>;
  updateTask: (boardId: number, taskId: number, data: Partial<Task>) => Promise<void>;
  deleteTask: (boardId: number, taskId: number) => Promise<void>;
  updateTaskStatus: (taskId: number, status: TaskStatus) => Promise<void>;
  updateTaskPriority: (taskId: number, priority: TaskPriority) => Promise<void>;
  setFilters: (filters: { status?: TaskStatus; priority?: TaskPriority; search?: string }) => void;
  setCurrentTask: (task: Task | null) => void;
  setTasks: (tasks: Task[]) => void;
  clearError: () => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  filters: {},

  fetchTasks: async (boardId: number, status?: TaskStatus, priority?: TaskPriority) => {
    set({ loading: true, error: null });
    try {
      const tasks = await tasksService.getTasksByBoard(boardId, status, priority);
      set({ tasks, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch tasks',
        loading: false,
      });
    }
  },

  createTask: async (boardId, data) => {
    set({ loading: true, error: null });
    try {
      const newTask = await tasksService.createTask(boardId, data);
      set((state) => ({
        tasks: [...state.tasks, newTask],
        loading: false,
      }));
      return newTask;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to create task',
        loading: false,
      });
      throw error;
    }
  },

  updateTask: async (boardId: number, taskId: number, data) => {
    set({ loading: true, error: null });
    try {
      const updatedTask = await tasksService.updateTask(boardId, taskId, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to update task',
        loading: false,
      });
      throw error;
    }
  },

  deleteTask: async (boardId: number, taskId: number) => {
    set({ loading: true, error: null });
    try {
      await tasksService.deleteTask(boardId, taskId);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to delete task',
        loading: false,
      });
      throw error;
    }
  },

  updateTaskStatus: async (taskId: number, status: TaskStatus) => {
    set({ loading: true, error: null });
    try {
      const updatedTask = await tasksService.updateTaskStatus(taskId, status);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to update task status',
        loading: false,
      });
      throw error;
    }
  },

  updateTaskPriority: async (taskId: number, priority: TaskPriority) => {
    set({ loading: true, error: null });
    try {
      const updatedTask = await tasksService.updateTaskPriority(taskId, priority);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to update task priority',
        loading: false,
      });
      throw error;
    }
  },

  setFilters: (filters) => {
    set({ filters });
  },

  setCurrentTask: (task) => {
    set({ currentTask: task });
  },

  setTasks: (tasks) => {
    set({ tasks });
  },

  clearError: () => {
    set({ error: null });
  },
}));

