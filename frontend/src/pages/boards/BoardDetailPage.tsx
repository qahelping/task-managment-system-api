import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { useBoardsStore } from '@/stores/boardsStore';
import { useTasksStore } from '@/stores/tasksStore';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';
import { EditTaskModal } from '@/components/modals/EditTaskModal';
import { EditBoardModal } from '@/components/modals/EditBoardModal';
import { DeleteBoardModal } from '@/components/modals/DeleteBoardModal';
import { BoardMembersModal } from '@/components/modals/BoardMembersModal';
import { FiEdit2, FiTrash2, FiPlus, FiShare2, FiCheck, FiUsers } from 'react-icons/fi';
import { Select } from '@/components/ui/Select';
import { TaskStatus, TaskPriority } from '@/types';
import { trackBoardOpen } from '@/utils/recentBoards';

// Функция для обрезки текста с добавлением "..."
const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.trim().length === 0) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Функция для проверки, является ли строка пустой или содержит только пробелы
const isEmptyOrWhitespace = (text: string | null | undefined): boolean => {
  return !text || text.trim().length === 0;
};

export const BoardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const boardId = parseInt(id || '0', 10);
  const { currentBoard, fetchBoard, loading, error: boardError, clearError, setCurrentBoard } = useBoardsStore();
  const { currentTask, fetchTasks, setCurrentTask } = useTasksStore();
  const { user } = useAuthStore();
  const { openModal, modals, addNotification, searchQuery } = useUIStore();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [linkCopied, setLinkCopied] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Предотвращаем повторную загрузку при изменении функций из store
    if (!boardId || hasLoadedRef.current) return;

    hasLoadedRef.current = true;
    clearError();
    setCurrentBoard(null); // чтобы не показывать предыдущую доску при переходе на другую

    // Загружаем данные параллельно
    Promise.all([
      fetchBoard(boardId),
      fetchTasks(boardId)
    ]).then(() => {
      // Отслеживаем открытие доски только при успешной загрузке (currentBoard будет установлен в store)
      const state = useBoardsStore.getState();
      if (user?.id && state.currentBoard?.id === boardId) {
        trackBoardOpen(boardId, user.id);
      }
    });

    // Сбрасываем флаг при изменении boardId
    return () => {
      hasLoadedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  // Очищаем currentTask при закрытии модального окна редактирования
  // Очищаем только после того, как модальное окно полностью закроется
  useEffect(() => {
    if (!modals.editTask && currentTask) {
      // Используем задержку, чтобы модальное окно успело полностью закрыться
      const timer = setTimeout(() => {
        setCurrentTask(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [modals.editTask]);

  // Проверка прав доступа
  // Владелец - это автор доски
  const isOwner = currentBoard?.created_by === user?.id;
  // Админ - администратор
  const isAdmin = user?.role === 'admin';
  // Пользователь - авторизованный пользователь, который не является владельцем и админом
  const isUser = user !== null && user?.role === 'user' && !isOwner && !isAdmin;
  // Гость - неавторизованный пользователь или пользователь с ролью 'guest'
  const isGuest = user === null || user?.role === 'guest';

  const isOwnerOrAdmin = isOwner || isAdmin;
  const isArchived = currentBoard?.archived || false;

  // Для удаленной доски: админ может только просматривать (кнопки disabled)
  // Владелец и админ могут редактировать/удалять доску
  // Пользователи и гости не могут редактировать/удалять доску
  const canEditBoard = isOwnerOrAdmin && !isArchived;
  const canDeleteBoard = isOwnerOrAdmin && !isArchived;
  // Поделиться могут только владелец и админ для публичных досок
  // Пользователи и гости не могут делиться досками
  const canShareBoard = isOwnerOrAdmin && currentBoard?.public && !isArchived;
  // Создавать задачи могут все авторизованные пользователи (владелец, админ, пользователь)
  // Гости не могут создавать задачи
  const canCreateTask = !isArchived && !isGuest && (isOwner || isAdmin || isUser);

  // Обрезка текста для отображения
  const displayTitle = currentBoard?.title ? truncateText(currentBoard.title, 20) : '';
  const displayDescription = currentBoard?.description && !isEmptyOrWhitespace(currentBoard.description)
    ? truncateText(currentBoard.description, 100)
    : null;

  const handleShareBoard = async () => {
    if (!currentBoard?.public) {
      addNotification({
        type: 'warning',
        message: 'Сначала сделайте доску публичной в настройках',
      });
      return;
    }

    if (isArchived) {
      addNotification({
        type: 'warning',
        message: 'Нельзя поделиться удаленной доской',
      });
      return;
    }

    const publicUrl = `${window.location.origin}/public/boards/${boardId}`;
    
    try {
      await navigator.clipboard.writeText(publicUrl);
      setLinkCopied(true);
      addNotification({
        type: 'success',
        message: 'Ссылка скопирована в буфер обмена!',
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = publicUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      addNotification({
        type: 'success',
        message: 'Ссылка скопирована!',
      });
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // Показываем loader только при первой загрузке, чтобы избежать дрожания
  if (loading && !currentBoard) {
    return (
      <Layout>
        <Loader fullScreen />
      </Layout>
    );
  }

  if (!currentBoard) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600" data-qa="board-error-message">
            {boardError || 'Доска не найдена'}
          </p>
          <Button variant="primary" onClick={() => navigate('/boards')} className="mt-4" data-qa="board-back-to-boards">
            Вернуться к доскам
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 h-full flex flex-col" data-qa="board-detail-page">
        {/* Header */}
        <div className="board-header" data-qa="board-header">
          <div className="board-header-content">
            <div className="board-title-wrapper">
              <h1 className="board-title" data-qa="board-title">{displayTitle}</h1>
              {isOwnerOrAdmin && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal('editBoard')}
                    className="btn-icon-only"
                    data-qa="board-edit-button"
                    title="Редактировать доску"
                    disabled={!canEditBoard}
                  >
                    <FiEdit2 />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => openModal('deleteBoard')}
                    className="btn-icon-only"
                    data-qa="board-delete-button"
                    title="Удалить доску"
                    disabled={!canDeleteBoard}
                  >
                    <FiTrash2 />
                  </Button>
                </>
              )}
            </div>
            <div className="flex gap-2" data-qa="board-actions">
              {isOwnerOrAdmin && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openModal('boardMembers')}
                  data-qa="board-members-button"
                  title="Управление участниками"
                >
                  <FiUsers className="inline mr-2" />
                  Участники
                </Button>
              )}
              {canShareBoard && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShareBoard}
                  data-qa="board-share-button"
                  disabled={!canShareBoard}
                >
                  {linkCopied ? (
                    <>
                      <FiCheck className="inline mr-2" />
                      Скопировано!
                    </>
                  ) : (
                    <>
                      <FiShare2 className="inline mr-2" />
                      Поделиться
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => openModal('createTask')}
                data-qa="board-create-task-button"
                disabled={!canCreateTask}
              >
                <FiPlus className="inline mr-2" />
                Создать задачу
              </Button>
            </div>
          </div>
          {displayDescription && (
            <p className="board-description" data-qa="board-description">{displayDescription}</p>
          )}
        </div>

        {/* Filters */}
        <div className="board-filters" data-qa="board-filters">
          <div className="board-filter-item">
            <Select
              options={[
                { value: '', label: 'Все статусы' },
                { value: 'todo', label: 'В работу' },
                { value: 'in_progress', label: 'В работе' },
                { value: 'done', label: 'Выполнено' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
              data-qa="board-status-filter"
            />
          </div>
          <div className="board-filter-item">
            <Select
              options={[
                { value: '', label: 'Все приоритеты' },
                { value: 'low', label: 'Низкий' },
                { value: 'medium', label: 'Средний' },
                { value: 'high', label: 'Высокий' },
              ]}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
              data-qa="board-priority-filter"
            />
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 min-h-0" data-qa="kanban-board-container">
          <KanbanBoard
            boardId={boardId}
            searchQuery={searchQuery}
            statusFilter={statusFilter || undefined}
            priorityFilter={priorityFilter || undefined}
            initialTasks={currentBoard.tasks}
          />
        </div>
      </div>

      {/* Modals */}
      {modals.createTask && canCreateTask && <CreateTaskModal boardId={boardId} />}
      {modals.editTask && currentTask && currentTask.board_id && (
        <EditTaskModal
          task={currentTask}
          boardId={currentTask.board_id || boardId}
          onTaskUpdated={() => {
            fetchTasks(boardId, statusFilter || undefined, priorityFilter || undefined);
            setCurrentTask(null);
          }}
        />
      )}
      {modals.editBoard && canEditBoard && <EditBoardModal board={currentBoard} />}
      {modals.deleteBoard && canDeleteBoard && <DeleteBoardModal boardId={boardId} />}
      {modals.boardMembers && currentBoard && (
        <BoardMembersModal boardId={boardId} boardOwnerId={currentBoard.created_by} />
      )}
    </Layout>
  );
};

