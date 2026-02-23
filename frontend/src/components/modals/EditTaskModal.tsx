import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTasksStore } from '@/stores/tasksStore';
import { useUIStore } from '@/stores/uiStore';
import { useBoardsStore } from '@/stores/boardsStore';
import { useAuthStore } from '@/stores/authStore';
import { boardsService } from '@/services/boards.service';
import { usersService } from '@/services/users.service';
import { Task, TaskStatus, TaskPriority, User } from '@/types';
import { format } from 'date-fns';
import ru from 'date-fns/locale/ru';

interface EditTaskModalProps {
  task: Task;
  boardId: number;
  onTaskUpdated?: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, boardId, onTaskUpdated }) => {
  const { updateTask, deleteTask } = useTasksStore();
  const { closeModal, modals, addNotification } = useUIStore();
  const { currentBoard } = useBoardsStore();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    assignee_id: task.assignee_id || null,
  });
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [boardUsers, setBoardUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignee_id: task.assignee_id || null,
    });
  }, [task]);

  useEffect(() => {
    if (modals.editTask && boardId) {
      loadBoardUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modals.editTask, boardId]);

  const loadBoardUsers = async () => {
    setLoadingUsers(true);
    try {
      // Получаем участников доски
      const members = await boardsService.getBoardMembers(boardId);
      const memberIds = members.map((m: any) => m.id);
      
      // Получаем доску для определения создателя
      let boardCreatorId: number | null = null;
      if (currentBoard && currentBoard.id === boardId) {
        boardCreatorId = currentBoard.created_by;
      } else {
        // Если currentBoard не установлен, загружаем доску
        try {
          const board = await boardsService.getBoardById(boardId);
          boardCreatorId = board.created_by;
        } catch (error) {
          console.error('Failed to load board:', error);
        }
      }
      
      // Добавляем создателя доски, если его нет в списке участников
      if (boardCreatorId && !memberIds.includes(boardCreatorId)) {
        memberIds.push(boardCreatorId);
      }
      
      // Получаем всех пользователей и фильтруем по участникам доски
      const allUsers = await usersService.getAllUsers();
      const users = allUsers.filter(u => memberIds.includes(u.id));
      
      // Добавляем текущего пользователя, если его нет в списке
      if (user && !users.find(u => u.id === user.id)) {
        users.push(user);
      }
      
      setBoardUsers(users);
    } catch (error) {
      console.error('Failed to load board users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.title || formData.title.length < 1) {
      setErrors({ title: 'Название обязательно' });
      return;
    }

    setIsLoading(true);
    try {
      await updateTask(boardId, task.id, {
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        assignee_id: formData.assignee_id || null,
      });
      addNotification({
        type: 'success',
        message: 'Задача успешно обновлена!',
      });
      if (onTaskUpdated) {
        onTaskUpdated();
      }
      closeModal('editTask');
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.detail || 'Ошибка обновления задачи',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTask(boardId, task.id);
      addNotification({
        type: 'success',
        message: 'Задача успешно удалена!',
      });
      if (onTaskUpdated) {
        onTaskUpdated();
      }
      closeModal('editTask');
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.detail || 'Ошибка удаления задачи',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    closeModal('editTask');
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignee_id: task.assignee_id || null,
    });
    setErrors({});
  };

  return (
    <Modal
      isOpen={modals.editTask}
      onClose={handleClose}
      title="Редактировать задачу"
      size="lg"
      data-qa="edit-task-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-4" data-qa="edit-task-form">
        <Input
          label="Название задачи"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          error={errors.title}
          required
          data-qa="edit-task-title-input"
        />
        <div>
          <label className="label">
            Описание (необязательно)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="textarea-modern"
            rows={4}
            placeholder="Введите описание задачи"
            data-qa="edit-task-description-textarea"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Статус"
            options={[
              { value: 'todo', label: 'В работу' },
              { value: 'in_progress', label: 'В работе' },
              { value: 'done', label: 'Выполнено' },
            ]}
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as TaskStatus })
            }
            data-qa="edit-task-status-select"
          />
          <Select
            label="Приоритет"
            options={[
              { value: 'low', label: 'Низкий' },
              { value: 'medium', label: 'Средний' },
              { value: 'high', label: 'Высокий' },
            ]}
            value={formData.priority}
            onChange={(e) =>
              setFormData({
                ...formData,
                priority: e.target.value as TaskPriority,
              })
            }
            data-qa="edit-task-priority-select"
          />
        </div>
        <Select
          label="Назначено"
          options={[
            { value: '', label: 'Не назначено' },
            ...boardUsers.map((u) => ({
              value: u.id.toString(),
              label: `${u.username}${u.id === user?.id ? ' (Вы)' : ''}`,
            })),
          ]}
          value={formData.assignee_id?.toString() || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              assignee_id: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          disabled={loadingUsers}
          data-qa="edit-task-assignee-select"
        />
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Создана:</strong>{' '}
            {format(new Date(task.created_at), 'dd MMM yyyy HH:mm', {
              locale: ru,
            })}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Обновлена:</strong>{' '}
            {format(new Date(task.updated_at), 'dd MMM yyyy HH:mm', {
              locale: ru,
            })}
          </p>
        </div>
        <div className="flex justify-between">
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
            data-qa="edit-task-delete-button"
          >
            Удалить
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              data-qa="edit-task-cancel-button"
            >
              Отмена
            </Button>
            <Button type="submit" isLoading={isLoading} data-qa="edit-task-save-button">
              Сохранить
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

