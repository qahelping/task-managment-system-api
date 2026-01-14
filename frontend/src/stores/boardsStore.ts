import { create } from 'zustand';
import { Board, BoardWithTasks } from '@/types';
import { boardsService } from '@/services/boards.service';

interface BoardsState {
  boards: Board[];
  currentBoard: BoardWithTasks | null;
  loading: boolean;
  error: string | null;
  fetchBoards: (archived?: boolean) => Promise<void>;
  fetchBoard: (boardId: number) => Promise<void>;
  createBoard: (data: { title: string; description?: string; public?: boolean }) => Promise<Board>;
  updateBoard: (boardId: number, data: Partial<Board>) => Promise<void>;
  deleteBoard: (boardId: number) => Promise<void>;
  setCurrentBoard: (board: BoardWithTasks | null) => void;
  clearError: () => void;
}

export const useBoardsStore = create<BoardsState>((set, get) => ({
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,

  fetchBoards: async (archived = false) => {
    set({ loading: true, error: null });
    try {
      const boards = await boardsService.getAllBoards(archived);
      set({ boards, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch boards',
        loading: false,
      });
    }
  },

  fetchBoard: async (boardId: number) => {
    set({ loading: true, error: null });
    try {
      const board = await boardsService.getBoardById(boardId);
      set({ currentBoard: board, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch board',
        loading: false,
      });
    }
  },

  createBoard: async (data) => {
    set({ loading: true, error: null });
    try {
      const newBoard = await boardsService.createBoard(data);
      set((state) => ({
        boards: [...state.boards, newBoard],
        loading: false,
      }));
      return newBoard;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to create board',
        loading: false,
      });
      throw error;
    }
  },

  updateBoard: async (boardId: number, data) => {
    set({ loading: true, error: null });
    try {
      await boardsService.updateBoard(boardId, data);
      await get().fetchBoards();
      if (get().currentBoard?.id === boardId) {
        await get().fetchBoard(boardId);
      }
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to update board',
        loading: false,
      });
      throw error;
    }
  },

  deleteBoard: async (boardId: number) => {
    set({ loading: true, error: null });
    try {
      await boardsService.deleteBoard(boardId);
      set((state) => ({
        boards: state.boards.filter((b) => b.id !== boardId),
        currentBoard: state.currentBoard?.id === boardId ? null : state.currentBoard,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to delete board',
        loading: false,
      });
      throw error;
    }
  },

  setCurrentBoard: (board: BoardWithTasks | null) => {
    set({ currentBoard: board });
  },

  clearError: () => {
    set({ error: null });
  },
}));













