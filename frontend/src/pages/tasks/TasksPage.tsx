import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { tasksService } from '@/services/tasks.service';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { FiSearch } from 'react-icons/fi';
import { format } from 'date-fns';
import ru from 'date-fns/locale/ru';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    loadTasks();
  }, [currentPage, statusFilter, priorityFilter]);

  useEffect(() => {
    // Сбрасываем на первую страницу при изменении фильтров
    setCurrentPage(1);
  }, [searchQuery, statusFilter, priorityFilter]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const data = await tasksService.getAccessibleTasks(
        skip,
        itemsPerPage,
        statusFilter || undefined,
        priorityFilter || undefined
      );
      setTasks(data.tasks);
      setTotalTasks(data.total);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo':
        return 'В работу';
      case 'in_progress':
        return 'В работе';
      case 'done':
        return 'Выполнено';
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'Низкий';
      case 'medium':
        return 'Средний';
      case 'high':
        return 'Высокий';
      default:
        return priority;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'todo':
        return 'admin-role-badge admin-role-badge--todo';
      case 'in_progress':
        return 'admin-role-badge admin-role-badge--user';
      case 'done':
        return 'admin-role-badge admin-role-badge--done';
      default:
        return 'admin-role-badge admin-role-badge--user';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'admin-role-badge admin-role-badge--priority-low';
      case 'medium':
        return 'admin-role-badge admin-role-badge--priority-medium';
      case 'high':
        return 'admin-role-badge admin-role-badge--priority-high';
      default:
        return 'admin-role-badge admin-role-badge--admin';
    }
  };

  // Фильтрация по поисковому запросу (на клиенте)
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(totalTasks / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Прокрутка вверх при смене страницы
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="tasks-page" data-qa="tasks-page">
        {/* Header */}
        <div className="tasks-page-header">
          <h1 className="tasks-page-title" data-qa="tasks-page-title">Все задачи</h1>
        </div>

        {/* Filters */}
        <div className="tasks-filters" data-qa="tasks-filters">
          <div className="tasks-search-container">
            <FiSearch className="tasks-search-icon" />
            <Input
              type="text"
              placeholder="Поиск задач"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tasks-search-input"
              data-qa="tasks-search-input"
            />
          </div>
          <div className="tasks-filter-item">
            <Select
              options={[
                { value: '', label: 'Все статусы' },
                { value: 'todo', label: 'В работу' },
                { value: 'in_progress', label: 'В работе' },
                { value: 'done', label: 'Выполнено' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
              data-qa="tasks-status-filter"
            />
          </div>
          <div className="tasks-filter-item">
            <Select
              options={[
                { value: '', label: 'Все приоритеты' },
                { value: 'low', label: 'Низкий' },
                { value: 'medium', label: 'Средний' },
                { value: 'high', label: 'Высокий' },
              ]}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
              data-qa="tasks-priority-filter"
            />
          </div>
        </div>

        {/* Все задачи */}
        <Card className="mb-6">
          <div>
            <h2 className="admin-section-title" style={{ marginBottom: '16px' }}>
              Все задачи ({totalTasks})
            </h2>
          </div>
          {loading ? (
            <Loader />
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Описание</th>
                    <th>Статус</th>
                    <th>Приоритет</th>
                    <th>Дата создания</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="admin-table-empty">
                        {tasks.length === 0 ? 'Задачи не найдены' : 'Ничего не найдено'}
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => (
                      <tr key={task.id}>
                        <td>
                          <div className="font-medium">{task.title}</div>
                        </td>
                        <td>
                          <div className="text-sm text-gray-500">
                            {task.description || '-'}
                          </div>
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(task.status)}>
                            {getStatusLabel(task.status)}
                          </span>
                        </td>
                        <td>
                          <span className={getPriorityBadgeClass(task.priority)}>
                            {getPriorityLabel(task.priority)}
                          </span>
                        </td>
                        <td>
                          <div className="admin-table-user-date">
                            {format(new Date(task.created_at), 'dd MMM yyyy', {
                              locale: ru,
                            })}
                          </div>
                        </td>
                        <td>
                          <Link
                            to={`/boards/${task.board_id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Открыть
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filteredTasks.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={totalTasks}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};
