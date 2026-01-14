import { useEffect, useState } from 'react';
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
import { FiEdit2, FiTrash2, FiPlus, FiShare2, FiCheck } from 'react-icons/fi';
import { Select } from '@/components/ui/Select';
import { TaskStatus, TaskPriority } from '@/types';

export const BoardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const boardId = parseInt(id || '0', 10);
  const { currentBoard, fetchBoard, loading } = useBoardsStore();
  const { fetchTasks, currentTask } = useTasksStore();
  const { user } = useAuthStore();
  const { openModal, modals, addNotification, searchQuery } = useUIStore();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId);
      fetchTasks(boardId);
    }
  }, [boardId, fetchBoard, fetchTasks]);

  const isOwnerOrAdmin =
    user?.role === 'admin' || currentBoard?.created_by === user?.id;

  const handleShareBoard = async () => {
    if (!currentBoard?.public) {
      addNotification({
        type: 'warning',
        message: 'Сначала сделайте доску публичной в настройках',
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

  if (loading) {
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
          <p className="text-gray-600">Доска не найдена</p>
          <Button variant="primary" onClick={() => navigate('/boards')} className="mt-4">
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
              <h1 className="board-title" data-qa="board-title">{currentBoard.title}</h1>
              {isOwnerOrAdmin && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal('editBoard')}
                    className="btn-icon-only"
                    data-qa="board-edit-button"
                    title="Редактировать доску"
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
                  >
                    <FiTrash2 />
                  </Button>
                </>
              )}
            </div>
            <div className="flex gap-2" data-qa="board-actions">
              {currentBoard.public && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShareBoard}
                  data-qa="board-share-button"
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
              >
                <FiPlus className="inline mr-2" />
                Создать задачу
              </Button>
            </div>
          </div>
          {currentBoard.description && (
            <p className="board-description" data-qa="board-description">{currentBoard.description}</p>
          )}
        </div>

        {/* Filters */}
        <div className="board-filters" data-qa="board-filters">
          <div className="board-filter-item">
            <Select
              options={[
                { value: '', label: 'Все статусы' },
                { value: 'todo', label: 'К выполнению' },
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
          />
        </div>
      </div>

      {/* Modals */}
      {modals.createTask && <CreateTaskModal boardId={boardId} />}
      {modals.editTask && currentTask && (
        <EditTaskModal task={currentTask} boardId={boardId} />
      )}
      {modals.editBoard && <EditBoardModal board={currentBoard} />}
      {modals.deleteBoard && <DeleteBoardModal boardId={boardId} />}
    </Layout>
  );
};

