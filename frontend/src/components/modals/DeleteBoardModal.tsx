import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useBoardsStore } from '@/stores/boardsStore';
import { useUIStore } from '@/stores/uiStore';

interface DeleteBoardModalProps {
  boardId: number;
}

export const DeleteBoardModal: React.FC<DeleteBoardModalProps> = ({ boardId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { deleteBoard, fetchBoards } = useBoardsStore();
  const { closeModal, modals, addNotification } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteBoard(boardId);
      addNotification({
        type: 'success',
        message: 'Доска успешно удалена!',
      });
      closeModal('deleteBoard');
      
      // Если мы на странице доски, перенаправляем на список досок
      if (location.pathname.startsWith('/boards/') && location.pathname !== '/boards') {
        navigate('/boards');
      } else {
        // Если мы уже на странице списка досок, просто обновляем список
        await fetchBoards();
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.detail || 'Ошибка удаления доски',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={modals.deleteBoard}
      onClose={() => closeModal('deleteBoard')}
      title="Удалить доску"
      data-qa="delete-board-modal"
    >
      <div className="space-y-4" data-qa="delete-board-content">
        <p className="text-gray-700" data-qa="delete-board-message">
          Вы уверены, что хотите удалить эту доску? Это действие нельзя отменить.
          Все задачи на доске также будут удалены.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => closeModal('deleteBoard')}
            disabled={isLoading}
            data-qa="delete-board-cancel-button"
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            isLoading={isLoading}
            data-qa="delete-board-confirm-button"
          >
            Удалить
          </Button>
        </div>
      </div>
    </Modal>
  );
};

