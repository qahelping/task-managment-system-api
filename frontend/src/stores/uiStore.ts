import { create } from 'zustand';
import { Notification, ModalState } from '@/types';

interface UIState {
  modals: ModalState;
  notifications: Notification[];
  sidebarOpen: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openModal: (modal: keyof ModalState) => void;
  closeModal: (modal: keyof ModalState) => void;
  closeAllModals: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  modals: {
    createBoard: false,
    createTask: false,
    editBoard: false,
    editTask: false,
    deleteBoard: false,
    deleteTask: false,
  },
  notifications: [],
  sidebarOpen: true,
  searchQuery: '',

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  openModal: (modal) => {
    set((state) => ({
      modals: { ...state.modals, [modal]: true },
    }));
  },

  closeModal: (modal) => {
    set((state) => ({
      modals: { ...state.modals, [modal]: false },
    }));
  },

  closeAllModals: () => {
    set({
      modals: {
        createBoard: false,
        createTask: false,
        editBoard: false,
        editTask: false,
        deleteBoard: false,
        deleteTask: false,
      },
    });
  },

  addNotification: (notification) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto remove after duration
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, newNotification.duration);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },
}));

