import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Loader } from '@/components/ui/Loader';
import { usersService } from '@/services/users.service';
import { User } from '@/types';
import { useUIStore } from '@/stores/uiStore';

interface EditUserModalProps {
  user: User;
  onUserUpdated: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ user, onUserUpdated }) => {
  const { closeModal } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    role: user.role,
    avatar_url: user.avatar_url || '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await usersService.updateUser(user.id, {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        avatar_url: formData.avatar_url || undefined,
      });
      onUserUpdated();
      closeModal('editUser');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось обновить пользователя');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => closeModal('editUser')}
      title="Редактировать пользователя"
      data-qa="edit-user-modal"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="label">Имя пользователя</label>
            <Input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              minLength={3}
              maxLength={50}
              data-qa="edit-user-username-input"
            />
          </div>

          <div>
            <label className="label">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              data-qa="edit-user-email-input"
            />
          </div>

          <div>
            <label className="label">Роль</label>
            <Select
              options={[
                { value: 'admin', label: 'Администратор' },
                { value: 'user', label: 'Пользователь' },
                { value: 'guest', label: 'Гость' },
              ]}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' | 'guest' })}
              data-qa="edit-user-role-select"
            />
          </div>

          <div>
            <label className="label">URL аватара (необязательно)</label>
            <Input
              type="url"
              value={formData.avatar_url}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
              data-qa="edit-user-avatar-input"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm" data-qa="edit-user-error">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => closeModal('editUser')}
              data-qa="edit-user-cancel-button"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              data-qa="edit-user-save-button"
            >
              {loading ? <Loader size="sm" /> : 'Сохранить'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
