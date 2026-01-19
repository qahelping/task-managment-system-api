import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTasksStore } from '@/stores/tasksStore';
import { useUIStore } from '@/stores/uiStore';
import { TaskStatus, TaskPriority } from '@/types';

interface CreateTaskModalProps {
  boardId: number;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ boardId }) => {
  const { createTask } = useTasksStore();
  const { closeModal, modals, addNotification } = useUIStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
  });
  const [errors, setErrors] = useState<{ title?: string; description?: string; status?: string; priority?: string }>({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: { title?: string; description?: string; status?: string; priority?: string } = {};
    const trimmedTitle = formData.title.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedTitle) {
      newErrors.title = 'Название обязательно';
    } else if (trimmedTitle.length < 3) {
      newErrors.title = 'Название должно быть минимум 3 символа';
    } else if (trimmedTitle.length > 200) {
      newErrors.title = 'Название не должно превышать 200 символов';
    }

    if (trimmedDescription && trimmedDescription.length > 1000) {
      newErrors.description = 'Описание не должно превышать 1000 символов';
    }

    if (!['todo', 'in_progress', 'done'].includes(formData.status)) {
      newErrors.status = 'Недопустимый статус';
    }

    if (!['low', 'medium', 'high'].includes(formData.priority)) {
      newErrors.priority = 'Недопустимый приоритет';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length) {
      setFormError('Исправьте ошибки формы и попробуйте снова');
      return { isValid: false, trimmedTitle, trimmedDescription };
    }

    setFormError('');
    return { isValid: true, trimmedTitle, trimmedDescription };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setFormError('');

    const { isValid, trimmedTitle, trimmedDescription } = validate();
    if (!isValid) return;

    setIsLoading(true);
    try {
      await createTask(boardId, {
        title: trimmedTitle,
        description: trimmedDescription || undefined,
        status: formData.status,
        priority: formData.priority,
      });
      addNotification({
        type: 'success',
        message: 'Задача успешно создана!',
      });
      closeModal('createTask');
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
      });
    } catch (error: any) {
      const message =
        error.response?.data?.detail || 'Ошибка создания задачи';
      setFormError(message);
      addNotification({
        type: 'error',
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={modals.createTask}
      onClose={() => {
        closeModal('createTask');
        setFormData({
          title: '',
          description: '',
          status: 'todo',
          priority: 'medium',
        });
        setErrors({});
        setFormError('');
      }}
      title="Создать задачу"
      data-qa="create-task-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-4" data-qa="create-task-form">
        {formError && (
          <div className="form-error-message" role="alert" data-qa="create-task-error">
            {formError}
          </div>
        )}
        <Input
          label="Название задачи"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          error={errors.title}
          required
          placeholder="Введите название задачи"
          data-qa="create-task-title-input"
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
            className={`textarea-modern ${errors.description ? 'textarea-error' : ''}`}
            rows={4}
            placeholder="Введите описание задачи"
            data-qa="create-task-description-textarea"
          />
          {errors.description && (
            <p className="input-error-text" role="alert">
              {errors.description}
            </p>
          )}
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
            data-qa="create-task-status-select"
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
            data-qa="create-task-priority-select"
          />
          {errors.status && (
            <p className="text-sm text-danger-600 col-span-2" role="alert">
              {errors.status}
            </p>
          )}
          {errors.priority && (
            <p className="text-sm text-danger-600 col-span-2" role="alert">
              {errors.priority}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              closeModal('createTask');
              setFormData({
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium',
              });
              setErrors({});
              setFormError('');
            }}
            data-qa="create-task-cancel-button"
          >
            Отмена
          </Button>
          <Button type="submit" isLoading={isLoading} data-qa="create-task-submit-button">
            Создать
          </Button>
        </div>
      </form>
    </Modal>
  );
};



