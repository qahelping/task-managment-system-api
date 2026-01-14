import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTasksStore } from '@/stores/tasksStore';
import { useUIStore } from '@/stores/uiStore';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { format } from 'date-fns';
import ru from 'date-fns/locale/ru';

interface EditTaskModalProps {
  task: Task;
  boardId: number;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, boardId }) => {
  const { updateTask, deleteTask } = useTasksStore();
  const { closeModal, modals, addNotification } = useUIStore();
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
  });
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
    });
  }, [task]);

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
      });
      addNotification({
        type: 'success',
        message: 'Задача успешно обновлена!',
      });
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

  return (
    <Modal
      isOpen={modals.editTask}
      onClose={() => {
        closeModal('editTask');
        setFormData({
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority,
        });
        setErrors({});
      }}
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
              { value: 'todo', label: 'К выполнению' },
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
              onClick={() => {
                closeModal('editTask');
                setFormData({
                  title: task.title,
                  description: task.description || '',
                  status: task.status,
                  priority: task.priority,
                });
                setErrors({});
              }}
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

