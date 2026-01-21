// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  avatar_url?: string | null;
  created_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Board types
export interface Board {
  id: number;
  title: string;
  description?: string | null;
  public: boolean;
  archived: boolean;
  created_by: number;
  created_at: string;
}

export interface BoardWithTasks extends Board {
  tasks: Task[];
}

export interface BoardCreate {
  title: string;
  description?: string | null;
  public?: boolean;
}

export interface BoardUpdate {
  title?: string;
  description?: string | null;
  public?: boolean;
  archived?: boolean;
}

// Task types
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  board_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
}

// UI types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ModalState {
  createBoard: boolean;
  createTask: boolean;
  editBoard: boolean;
  editTask: boolean;
  deleteBoard: boolean;
  deleteTask: boolean;
}

// Stats types
export interface BoardStats {
  total_tasks: number;
  tasks_by_status: {
    todo: number;
    in_progress: number;
    done: number;
  };
  tasks_by_priority: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface DashboardStats {
  total_boards: number;
  total_tasks: number;
  tasks_by_status: {
    todo: number;
    in_progress: number;
    done: number;
  };
}

















