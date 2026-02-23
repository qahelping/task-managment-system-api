import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const tokenResponse = await authService.login({ email, password });
          
          // Сохраняем токен ПЕРЕД вызовом getCurrentUser
          localStorage.setItem('token', tokenResponse.access_token);
          
          // Устанавливаем токен в store перед запросом пользователя
          set({
            token: tokenResponse.access_token,
            isAuthenticated: true,
          });
          
          // Теперь получаем данные пользователя
          const user = await authService.getCurrentUser();
          
          set({
            user,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const tokenResponse = await authService.register({
            username,
            email,
            password,
          });
          
          // Сохраняем токен ПЕРЕД вызовом getCurrentUser
          localStorage.setItem('token', tokenResponse.access_token);
          
          // Устанавливаем токен в store перед запросом пользователя
          set({
            token: tokenResponse.access_token,
            isAuthenticated: true,
          });
          
          // Теперь получаем данные пользователя
          const user = await authService.getCurrentUser();
          
          set({
            user,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        // Очищаем sessionStorage при явном выходе
        sessionStorage.removeItem('auth_redirect_in_progress');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        // Редирект на страницу логина после выхода
        const currentPath = window.location.pathname;
        const isOnAuthPage = currentPath === '/login' || currentPath === '/register';
        if (!isOnAuthPage) {
          window.location.href = '/login';
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        localStorage.setItem('token', token);
        set({ token, isAuthenticated: true });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (token) {
          set({ isLoading: true });
          try {
            const user = await authService.getCurrentUser();
            set({
              token,
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            set({
              token: null,
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            localStorage.removeItem('token');
          }
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

