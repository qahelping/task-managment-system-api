import api from '@/utils/api';
import { Board, BoardCreate, BoardUpdate, BoardWithTasks, BoardStats } from '@/types';

export const boardsService = {
  async getAllBoards(archived = false): Promise<Board[]> {
    const response = await api.get<Board[]>('/boards/', {
      params: { archived },
    });
    return response.data;
  },

  async getPublicBoards(): Promise<Board[]> {
    const response = await api.get<Board[]>('/boards/public');
    return response.data;
  },

  async getPublicBoard(boardId: number): Promise<BoardWithTasks> {
    const response = await api.get<BoardWithTasks>(`/boards/public/${boardId}`);
    return response.data;
  },

  async getBoardById(boardId: number): Promise<BoardWithTasks> {
    const response = await api.get<BoardWithTasks>(`/boards/${boardId}`);
    return response.data;
  },

  async createBoard(data: BoardCreate): Promise<Board> {
    const response = await api.post<Board>('/boards/', data);
    return response.data;
  },

  async updateBoard(boardId: number, data: BoardUpdate): Promise<Board> {
    const response = await api.put<Board>(`/boards/${boardId}`, data);
    return response.data;
  },

  async deleteBoard(boardId: number): Promise<void> {
    await api.delete(`/boards/${boardId}`);
  },

  async archiveBoard(boardId: number): Promise<Board> {
    const response = await api.put<Board>(`/boards/${boardId}/archive`);
    return response.data;
  },

  async getBoardStats(boardId: number): Promise<BoardStats> {
    const response = await api.get<BoardStats>(`/boards/${boardId}/stats`);
    return response.data;
  },

  async addBoardMember(boardId: number, userId: number): Promise<void> {
    await api.post(`/boards/${boardId}/members/${userId}`);
  },

  async removeBoardMember(boardId: number, userId: number): Promise<void> {
    await api.delete(`/boards/${boardId}/members/${userId}`);
  },

  async getBoardMembers(boardId: number) {
    const response = await api.get(`/boards/${boardId}/members`);
    return response.data;
  },
};

