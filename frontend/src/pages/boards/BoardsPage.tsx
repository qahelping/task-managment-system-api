import React, { useEffect, useState, type FC, type ChangeEvent, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { useBoardsStore } from '@/stores/boardsStore';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { statsService } from '@/services/stats.service';
import { tasksService } from '@/services/tasks.service';
import { EditTaskModal } from '@/components/modals/EditTaskModal';
import { Task, Board } from '@/types';
import { FiSearch, FiPlus, FiChevronDown, FiChevronUp, FiEdit2 } from 'react-icons/fi';
import { format } from 'date-fns';
import ru from 'date-fns/locale/ru';
import { getRecentBoards } from '@/utils/recentBoards';

export const BoardsPage: FC = () => {
  const { boards, fetchBoards, loading, fetchBoard } = useBoardsStore();
  const { openModal, closeModal, modals } = useUIStore();
  const { user } = useAuthStore();
  const [editingTask, setEditingTask] = useState<{ task: Task; boardId: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyPublic, setShowOnlyPublic] = useState(false);
  const [allBoards, setAllBoards] = useState<Board[]>([]);
  const [loadingAllBoards, setLoadingAllBoards] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBoards, setTotalBoards] = useState(0);
  const [expandedBoards, setExpandedBoards] = useState<Set<number>>(new Set());
  const [boardTasks, setBoardTasks] = useState<Record<number, Task[]>>({});
  const [loadingTasks, setLoadingTasks] = useState<Record<number, boolean>>({});
  const itemsPerPage = 10;

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadAllBoards();
    } else {
      fetchBoards();
    }
  }, [fetchBoards, isAdmin]);

  useEffect(() => {
    // Сбрасываем на первую страницу при изменении фильтров
    setCurrentPage(1);
  }, [searchQuery, showOnlyPublic]);

  const loadAllBoards = async () => {
    setLoadingAllBoards(true);
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const data = await statsService.getAllBoardsAdmin(skip, itemsPerPage);
      setAllBoards(data.boards);
      setTotalBoards(data.total);
    } catch (error) {
      console.error('Failed to load all boards:', error);
    } finally {
      setLoadingAllBoards(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllBoards();
    }
  }, [currentPage, isAdmin]);

  // Открываем модальное окно автоматически, когда editingTask установлен
  useEffect(() => {
    if (editingTask && !modals.editTask) {
      console.log('Auto-opening modal for editingTask:', editingTask);
      openModal('editTask');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTask]);

  // Очищаем editingTask при закрытии модального окна
  useEffect(() => {
    if (!modals.editTask && editingTask) {
      setEditingTask(null);
    }
  }, [modals.editTask, editingTask]);

  // Для администратора используем все доски, для остальных - только доступные
  const boardsToDisplay = isAdmin ? allBoards : boards;
  const isLoading = isAdmin ? loadingAllBoards : loading;

  // Фильтрация (для неадминов применяется на клиенте, для админов данные уже отфильтрованы на сервере)
  const filteredBySearch = boardsToDisplay.filter((board: Board) => {
    const matchesSearch = board.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPublicFilter = !showOnlyPublic || board.public;
    return matchesSearch && matchesPublicFilter;
  });

  // Убираем дубликаты по id (на случай если API вернул одну доску дважды)
  const uniqueById = Array.from(
    new Map(filteredBySearch.map((b: Board) => [b.id, b])).values()
  ) as Board[];

  // Сортировка по времени последнего использования: сначала недавно открытые
  const recentOrder = user?.id ? getRecentBoards(user.id).map((r) => r.boardId) : [];
  const filteredBoards = [...uniqueById].sort((a: Board, b: Board) => {
    const indexA = recentOrder.indexOf(a.id);
    const indexB = recentOrder.indexOf(b.id);
    if (indexA === -1 && indexB === -1) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // Для неадминов применяем пагинацию на клиенте
  const paginatedBoards = isAdmin
    ? filteredBoards
    : filteredBoards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil((isAdmin ? totalBoards : filteredBoards.length) / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Прокрутка вверх при смене страницы
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleBoardExpansion = async (boardId: number) => {
    const isExpanded = expandedBoards.has(boardId);
    if (isExpanded) {
      // Сворачиваем
      const newExpanded = new Set(expandedBoards);
      newExpanded.delete(boardId);
      setExpandedBoards(newExpanded);
    } else {
      // Разворачиваем и загружаем задачи
      setExpandedBoards(new Set([...expandedBoards, boardId]));
      if (!boardTasks[boardId]) {
        setLoadingTasks({ ...loadingTasks, [boardId]: true });
        try {
          const tasks = await tasksService.getTasksByBoard(boardId);
          setBoardTasks({ ...boardTasks, [boardId]: tasks });
        } catch (error: unknown) {
          console.error('Failed to load tasks for board:', error);
        } finally {
          setLoadingTasks({ ...loadingTasks, [boardId]: false });
        }
      }
    }
  };

  const handleEditTask = (task: Task, boardId: number) => {
    console.log('handleEditTask called', { task, boardId, currentModals: modals });
    // Убеждаемся, что task имеет board_id
    const taskWithBoardId: Task = { ...task, board_id: boardId };
    
    // Если модальное окно уже открыто для другой задачи, сначала закрываем его
    if (modals.editTask && editingTask && editingTask.task.id !== task.id) {
      console.log('Closing existing modal first');
      closeModal('editTask');
    }
    
    // Устанавливаем editingTask
    setEditingTask({ task: taskWithBoardId, boardId });
    
    // Открываем модальное окно явно (useEffect тоже сработает как подстраховка)
    console.log('Opening editTask modal explicitly');
    openModal('editTask');
    
    // Загружаем доску для модального окна (не блокируем открытие)
    fetchBoard(boardId).catch((error: unknown) => {
      console.error('Failed to load board for task editing:', error);
    });
  };

  const handleTaskUpdated = async (boardId: number) => {
    // Обновляем список задач после редактирования
    setLoadingTasks({ ...loadingTasks, [boardId]: true });
    try {
      const tasks = await tasksService.getTasksByBoard(boardId);
      setBoardTasks({ ...boardTasks, [boardId]: tasks });
    } catch (error) {
      console.error('Failed to reload tasks for board:', error);
    } finally {
      setLoadingTasks({ ...loadingTasks, [boardId]: false });
    }
  };

  return (
    <Layout>
      <div className="boards-page" data-qa="boards-page">
        {/* Header */}
        <div className="boards-page-header">
          <h1 className="boards-page-title" data-qa="boards-page-title">Доски</h1>
          <Button
            variant="primary"
            onClick={() => openModal('createBoard')}
            data-qa="boards-create-board-button"
          >
            <FiPlus className="icon-sm" />
            <span>Создать доску</span>
          </Button>
        </div>
        <div className="boards-filters" data-qa="boards-filters">
          <div className="boards-search-container">
            <FiSearch className="boards-search-icon" />
            <Input
              type="text"
              placeholder="Поиск досок"
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="boards-search-input"
              data-qa="boards-search-input"
            />
          </div>
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="public-only"
              checked={showOnlyPublic}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setShowOnlyPublic(e.target.checked)}
              className="checkbox"
              data-qa="boards-public-only-checkbox"
            />
            <label htmlFor="public-only" className="checkbox-label" data-qa="boards-public-only-label">
              Только публичные
            </label>
          </div>
        </div>

        {/* Все доски */}
        <Card className="mb-6">
          <div>
            <h2 className="admin-section-title" style={{ marginBottom: '16px' }}>
              {isAdmin ? 'Все доски' : 'Доски'} ({isAdmin ? totalBoards : boardsToDisplay.length})
            </h2>
          </div>
          {isLoading ? (
            <Loader />
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th aria-label="Развернуть" />
                    <th>Название</th>
                    <th>Описание</th>
                    <th>Публичная</th>
                    <th>Архивирована</th>
                    <th>Дата создания</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBoards.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="admin-table-empty">
                        {boardsToDisplay.length === 0 ? 'Доски не найдены' : 'Ничего не найдено'}
                      </td>
                    </tr>
                  ) : (
                    paginatedBoards.map((board: Board) => {
                      const isExpanded = expandedBoards.has(board.id);
                      const tasks = boardTasks[board.id] || [];
                      const isLoadingTasks = loadingTasks[board.id];
                      
                      return (
                        <React.Fragment key={board.id}>
                          <tr>
                            <td>
                              <button
                                type="button"
                                onClick={() => toggleBoardExpansion(board.id)}
                                className="p-1 rounded hover:bg-gray-100"
                                aria-label={isExpanded ? 'Свернуть' : 'Развернуть'}
                                data-qa={`board-expand-${board.id}`}
                              >
                                {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                              </button>
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="font-medium">{board.title}</div>
                              </div>
                            </td>
                            <td>
                              <div className="text-sm text-gray-500">
                                {board.description || '-'}
                              </div>
                            </td>
                            <td>
                              <span className={`admin-role-badge ${board.public ? 'admin-role-badge--user' : 'admin-role-badge--guest'}`}>
                                {board.public ? 'Да' : 'Нет'}
                              </span>
                            </td>
                            <td>
                              <span className={`admin-role-badge ${board.archived ? 'admin-role-badge--admin' : 'admin-role-badge--user'}`}>
                                {board.archived ? 'Да' : 'Нет'}
                              </span>
                            </td>
                            <td>
                              <div className="admin-table-user-date">
                                {format(new Date(board.created_at), 'dd MMM yyyy', {
                                  locale: ru,
                                })}
                              </div>
                            </td>
                            <td>
                              <Link
                                to={`/boards/${board.id}`}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Открыть
                              </Link>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={7} className="p-4 bg-gray-50">
                                {isLoadingTasks ? (
                                  <Loader />
                                ) : tasks.length === 0 ? (
                                  <p className="text-sm text-gray-500">Нет задач</p>
                                ) : (
                                  <div className="space-y-2">
                                    {tasks.map((task: Task) => {
                                      const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleEditTask(task, board.id);
                                      };
                                      
                                      return (
                                        <div
                                          key={task.id}
                                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                        >
                                          <div className="flex-1">
                                            <div className="font-medium">{task.title}</div>
                                            {task.description && (
                                              <div className="text-sm text-gray-500 mt-1">
                                                {task.description}
                                              </div>
                                            )}
                                          </div>
                                          <button
                                            onClick={handleClick}
                                            className="task-card-edit-btn ml-4"
                                            style={{ opacity: 1, pointerEvents: 'auto', zIndex: 10 }}
                                            data-qa={`task-card-edit-btn-${task.id}`}
                                            title="Редактировать задачу"
                                            type="button"
                                          >
                                            <FiEdit2 />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && paginatedBoards.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={isAdmin ? totalBoards : filteredBoards.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </Card>
      </div>

      {modals.editTask && editingTask && (
        <EditTaskModal 
          task={editingTask.task} 
          boardId={editingTask.boardId}
          onTaskUpdated={() => {
            handleTaskUpdated(editingTask.boardId);
            setEditingTask(null);
          }}
        />
      )}
    </Layout>
  );
};

