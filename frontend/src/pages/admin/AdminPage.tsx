import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { usersService } from '@/services/users.service';
import { User } from '@/types';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { EditUserModal } from '@/components/modals/EditUserModal';
import { DeleteUserModal } from '@/components/modals/DeleteUserModal';
import { FiSearch, FiUser, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import ru from 'date-fns/locale/ru';

export const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { openModal, modals } = useUIStore();
  const { user: currentUser } = useAuthStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.email.toLowerCase().includes(query) ||
            user.username.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'admin-role-badge--admin';
      case 'user':
        return 'admin-role-badge--user';
      case 'guest':
        return 'admin-role-badge--guest';
      default:
        return 'admin-role-badge--guest';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'user':
        return 'Пользователь';
      case 'guest':
        return 'Гость';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loader fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-page">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Административная панель</h1>
        </div>

        {/* Пользователи */}
        <Card>
          <div>
            <h2 className="admin-section-title">
              Управление пользователями
            </h2>
            <div className="admin-search-wrapper">
              <FiSearch className="admin-search-icon" />
              <Input
                type="text"
                placeholder="Поиск по email или имени пользователя..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-search-input"
              />
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Пользователь</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Дата регистрации</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-table-empty">
                      Пользователи не найдены
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-table-user-cell">
                          <div className="admin-table-user-avatar">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.username}
                              />
                            ) : (
                              <FiUser />
                            )}
                          </div>
                          <div className="admin-table-user-name">
                            {user.username}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="admin-table-user-email">{user.email}</div>
                      </td>
                      <td>
                        <span className={`admin-role-badge ${getRoleBadgeClass(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-user-date">
                          {format(new Date(user.created_at), 'dd MMM yyyy', {
                            locale: ru,
                          })}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              openModal('editUser');
                            }}
                            disabled={user.id === currentUser?.id}
                            title={user.id === currentUser?.id ? 'Нельзя редактировать себя' : 'Редактировать'}
                            data-qa={`edit-user-button-${user.id}`}
                          >
                            <FiEdit2 />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              openModal('deleteUser');
                            }}
                            disabled={user.id === currentUser?.id}
                            title={user.id === currentUser?.id ? 'Нельзя удалить себя' : 'Удалить'}
                            data-qa={`delete-user-button-${user.id}`}
                          >
                            <FiTrash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modals */}
      {modals.editUser && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onUserUpdated={() => {
            loadUsers();
            setSelectedUser(null);
          }}
        />
      )}
      {modals.deleteUser && selectedUser && (
        <DeleteUserModal
          user={selectedUser}
          onUserDeleted={() => {
            loadUsers();
            setSelectedUser(null);
          }}
        />
      )}
    </Layout>
  );
};

