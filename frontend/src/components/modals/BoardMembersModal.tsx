import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Loader } from '@/components/ui/Loader';
import { useUIStore } from '@/stores/uiStore';
import { boardsService } from '@/services/boards.service';
import { usersService } from '@/services/users.service';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types';
import { FiUserPlus, FiTrash2 } from 'react-icons/fi';

interface BoardMembersModalProps {
  boardId: number;
  boardOwnerId: number;
}

interface BoardMember {
  id: number;
  username: string;
  email: string;
}

export const BoardMembersModal: React.FC<BoardMembersModalProps> = ({
  boardId,
  boardOwnerId,
}) => {
  const { closeModal, modals, addNotification } = useUIStore();
  const { user } = useAuthStore();
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [addingUserId, setAddingUserId] = useState<number | null>(null);

  const isOwnerOrAdmin = user?.role === 'admin' || user?.id === boardOwnerId;

  useEffect(() => {
    if (modals.boardMembers) {
      loadMembers();
      loadUsers();
    }
  }, [modals.boardMembers, boardId]);

  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      const data = await boardsService.getBoardMembers(boardId);
      setMembers(data);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.detail || 'Не удалось загрузить участников',
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadUsers = async () => {
    try {
      const users = await usersService.getAllUsers();
      setAllUsers(users);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.detail || 'Не удалось загрузить пользователей',
      });
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) {
      addNotification({
        type: 'warning',
        message: 'Выберите пользователя',
      });
      return;
    }

    const userId = parseInt(selectedUserId);
    if (addingUserId === userId) return;
    
    setAddingUserId(userId);
    try {
      await boardsService.addBoardMember(boardId, userId);
      await loadMembers();
      setSelectedUserId(''); // Сброс выбора
      addNotification({
        type: 'success',
        message: 'Пользователь добавлен на доску',
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.detail || 'Не удалось добавить пользователя',
      });
    } finally {
      setAddingUserId(null);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (userId === boardOwnerId) {
      addNotification({
        type: 'warning',
        message: 'Нельзя удалить владельца доски',
      });
      return;
    }

    if (!confirm('Вы уверены, что хотите удалить этого участника?')) {
      return;
    }

    setLoading(true);
    try {
      await boardsService.removeBoardMember(boardId, userId);
      await loadMembers();
      addNotification({
        type: 'success',
        message: 'Участник удален с доски',
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.detail || 'Не удалось удалить участника',
      });
    } finally {
      setLoading(false);
    }
  };

  const availableUsers = allUsers.filter((u) => {
    const isNotMember = !members.some((m) => m.id === u.id);
    const isNotOwner = u.id !== boardOwnerId;
    return isNotMember && isNotOwner;
  });

  const selectOptions = availableUsers.map((u) => ({
    value: u.id.toString(),
    label: `${u.username} (${u.email})`,
  }));

  if (!modals.boardMembers) return null;

  return (
    <Modal
      isOpen={modals.boardMembers}
      onClose={() => closeModal('boardMembers')}
      title="Участники доски"
      size="md"
    >
      <div className="board-members-modal">
        {loadingMembers ? (
          <Loader />
        ) : (
          <>
            {/* Список текущих участников */}
            <div className="board-members-list">
              <h3 className="board-members-section-title">Участники ({members.length})</h3>
              {members.length === 0 ? (
                <p className="text-gray-500 text-sm">Нет участников</p>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{member.username}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        {member.id === boardOwnerId && (
                          <span className="text-xs text-blue-600 font-medium">Владелец</span>
                        )}
                      </div>
                      {isOwnerOrAdmin && member.id !== boardOwnerId && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={loading}
                          title="Удалить участника"
                        >
                          <FiTrash2 />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Добавление новых участников */}
            {isOwnerOrAdmin && (
              <div className="board-members-add mt-6">
                <h3 className="board-members-section-title">Добавить участника</h3>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      options={[
                        { value: '', label: 'Выберите пользователя...' },
                        ...selectOptions,
                      ]}
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      disabled={loading || availableUsers.length === 0}
                    />
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleAddMember}
                    disabled={!selectedUserId || loading || addingUserId !== null}
                    title="Добавить на доску"
                  >
                    {addingUserId ? (
                      <Loader size="sm" />
                    ) : (
                      <>
                        <FiUserPlus className="mr-2" />
                        Добавить
                      </>
                    )}
                  </Button>
                </div>
                {availableUsers.length === 0 && (
                  <p className="text-gray-500 text-sm mt-2">
                    Нет доступных пользователей для добавления
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

