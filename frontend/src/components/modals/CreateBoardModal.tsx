import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useBoardsStore } from '@/stores/boardsStore';
import { useUIStore } from '@/stores/uiStore';

export const CreateBoardModal: React.FC = () => {
  const { createBoard } = useBoardsStore();
  const { closeModal, modals, addNotification } = useUIStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    public: false,
  });
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: { title?: string; description?: string } = {};
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
      await createBoard({
        title: trimmedTitle,
        description: trimmedDescription || undefined,
        public: formData.public,
      });
      addNotification({
        type: 'success',
        message: 'Доска успешно создана!',
      });
      closeModal('createBoard');
      setFormData({ title: '', description: '', public: false });
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Ошибка создания доски';
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
      isOpen={modals.createBoard}
      onClose={() => {
        closeModal('createBoard');
        setFormData({ title: '', description: '', public: false });
        setErrors({});
        setFormError('');
      }}
      title="Создать доску"
      data-qa="create-board-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-4" data-qa="create-board-form">
        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm" role="alert" data-qa="create-board-error">
            {formError}
          </div>
        )}
        <Input
          label="Название доски"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          error={errors.title}
          required
          minLength={3}
          placeholder="Введите название доски"
          data-qa="create-board-title-input"
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
            placeholder="Введите описание доски"
            data-qa="create-board-description-textarea"
          />
          {errors.description && (
            <p className="input-error-text" role="alert">
              {errors.description}
            </p>
          )}
        </div>
        <div className="checkbox-container">
          <input
            type="checkbox"
            id="public"
            checked={formData.public}
            onChange={(e) =>
              setFormData({ ...formData, public: e.target.checked })
            }
            className="checkbox"
            data-qa="create-board-public-checkbox"
          />
          <label htmlFor="public" className="checkbox-label" data-qa="create-board-public-label">
            Публичная доска
          </label>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              closeModal('createBoard');
              setFormData({ title: '', description: '', public: false });
              setErrors({});
              setFormError('');
            }}
            data-qa="create-board-cancel-button"
          >
            Отмена
          </Button>
          <Button type="submit" isLoading={isLoading} data-qa="create-board-submit-button">
            Создать
          </Button>
        </div>
      </form>
    </Modal>
  );
};



