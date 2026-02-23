import { Board } from '@/types';

interface RecentBoard {
  boardId: number;
  openedAt: number; // timestamp
}

const STORAGE_KEY_PREFIX = 'recent_boards_';

/**
 * Получить ключ для localStorage на основе ID пользователя
 */
const getStorageKey = (userId: number): string => {
  return `${STORAGE_KEY_PREFIX}${userId}`;
};

/**
 * Сохранить информацию об открытии доски
 */
export const trackBoardOpen = (boardId: number, userId: number): void => {
  try {
    const key = getStorageKey(userId);
    const recentBoards: RecentBoard[] = getRecentBoards(userId);
    
    // Удаляем доску, если она уже есть в списке
    const filtered = recentBoards.filter(b => b.boardId !== boardId);
    
    // Добавляем доску в начало списка
    const updated: RecentBoard[] = [
      { boardId, openedAt: Date.now() },
      ...filtered
    ].slice(0, 20); // Храним максимум 20 последних досок
    
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to track board open:', error);
  }
};

/**
 * Получить список последних открытых досок
 */
export const getRecentBoards = (userId: number): RecentBoard[] => {
  try {
    const key = getStorageKey(userId);
    const data = localStorage.getItem(key);
    if (!data) return [];
    
    const recentBoards: RecentBoard[] = JSON.parse(data);
    return recentBoards.sort((a, b) => b.openedAt - a.openedAt); // Сортируем по времени открытия (новые первыми)
  } catch (error) {
    console.error('Failed to get recent boards:', error);
    return [];
  }
};

/**
 * Получить последние открытые доски с фильтрацией по доступным доскам
 */
export const getRecentBoardsFiltered = (
  userId: number,
  availableBoards: Board[]
): Board[] => {
  const recentBoards = getRecentBoards(userId);
  const availableBoardIds = new Set(availableBoards.map(b => b.id));
  
  // Фильтруем только те доски, которые доступны пользователю
  const recentBoardIds = recentBoards
    .map(r => r.boardId)
    .filter(id => availableBoardIds.has(id));
  
  // Создаем Map для быстрого доступа к доскам
  const boardsMap = new Map(availableBoards.map(b => [b.id, b]));
  
  // Возвращаем доски в порядке последнего открытия
  return recentBoardIds
    .map(id => boardsMap.get(id))
    .filter((board): board is Board => board !== undefined)
    .slice(0, 6); // Показываем максимум 6 последних досок
};

/**
 * Очистить историю последних открытых досок для пользователя
 */
export const clearRecentBoards = (userId: number): void => {
  try {
    const key = getStorageKey(userId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear recent boards:', error);
  }
};
