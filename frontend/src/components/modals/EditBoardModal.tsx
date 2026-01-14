import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useBoardsStore } from '@/stores/boardsStore';
import { useUIStore } from '@/stores/uiStore';
import { Board } from '@/types';

interface EditBoardModalProps {
  board: Board;
}

export const EditBoardModal: React.FC<EditBoardModalProps> = ({ board }) => {
  const { updateBoard } = useBoardsStore();
  const { closeModal, modals, addNotification } = useUIStore();
  const [formData, setFormData] = useState({
    title: board.title,
    description: board.description || '',
    public: board.public,
  });
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData({
      title: board.title,
      description: board.description || '',
      public: board.public,
    });
  }, [board]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.title || formData.title.length < 3) {
      setErrors({ title: 'Название должно быть минимум 3 символа' });
      return;
    }

    setIsLoading(true);
    try {
      await updateBoard(board.id, {
        title: formData.title,
        description: formData.description || undefined,
        public: formData.public,
      });
      addNotification({
        type: 'success',
        message: 'Доска успешно обновлена!',
      });
      closeModal('editBoard');
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.detail || 'Ошибка обновления доски',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={modals.editBoard}
      onClose={() => {
        closeModal('editBoard');
        setFormData({
          title: board.title,
          description: board.description || '',
          public: board.public,
        });
        setErrors({});
      }}
      title="Редактировать доску"
      data-qa="edit-board-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-4" data-qa="edit-board-form">
        <Input
          label="Название доски"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          error={errors.title}
          required
          minLength={3}
          data-qa="edit-board-title-input"
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
            placeholder="Введите описание доски"
            data-qa="edit-board-description-textarea"
          />
        </div>
        <div className="checkbox-container">
          <input
            type="checkbox"
            id="public-edit"
            checked={formData.public}
            onChange={(e) =>
              setFormData({ ...formData, public: e.target.checked })
            }
            className="checkbox"
            data-qa="edit-board-public-checkbox"
          />
          <label htmlFor="public-edit" className="checkbox-label" data-qa="edit-board-public-label">
            Публичная доска
          </label>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              closeModal('editBoard');
              setFormData({
                title: board.title,
                description: board.description || '',
                public: board.public,
              });
              setErrors({});
            }}
            data-qa="edit-board-cancel-button"
          >
            Отмена
          </Button>
          <Button type="submit" isLoading={isLoading} data-qa="edit-board-save-button">
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
};



