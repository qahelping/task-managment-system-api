import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { usersService } from '@/services/users.service';
import { User } from '@/types';
import { useUIStore } from '@/stores/uiStore';

interface DeleteUserModalProps {
  user: User;
  onUserDeleted: () => void;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ user, onUserDeleted }) => {
  const { closeModal } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setLoading(true);

    try {
      await usersService.deleteUser(user.id);
      onUserDeleted();
      closeModal('deleteUser');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось удалить пользователя');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => closeModal('deleteUser')}
      title="Удалить пользователя"
      data-qa="delete-user-modal"
    >
      <div className="space-y-4">
        <p>
          Вы уверены, что хотите удалить пользователя <strong>{user.username}</strong> ({user.email})?
        </p>
        <p className="text-sm text-gray-500">
          Это действие нельзя отменить. Все доски и задачи, созданные этим пользователем, также будут удалены.
        </p>

        {error && (
          <div className="text-red-500 text-sm" data-qa="delete-user-error">
            {error}
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => closeModal('deleteUser')}
            data-qa="delete-user-cancel-button"
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={loading}
            data-qa="delete-user-confirm-button"
          >
            {loading ? <Loader size="sm" /> : 'Удалить'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
