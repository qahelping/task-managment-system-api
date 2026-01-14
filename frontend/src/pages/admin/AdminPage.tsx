import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { usersService } from '@/services/users.service';
import { User } from '@/types';
import { FiSearch, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ru from 'date-fns/locale/ru';

export const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="admin-table-empty">
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

