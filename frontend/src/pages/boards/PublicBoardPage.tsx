import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { boardsService } from '@/services/boards.service';
import { BoardWithTasks, TaskStatus, TaskPriority } from '@/types';
import { Link } from 'react-router-dom';
import { FiHome, FiLock } from 'react-icons/fi';
import { useAuthStore } from '@/stores/authStore';
import { trackBoardOpen } from '@/utils/recentBoards';

export const PublicBoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const boardId = parseInt(id || '0', 10);
  const [board, setBoard] = useState<BoardWithTasks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');

  const handleLogoClick = () => {
    navigate('/');
  };

  useEffect(() => {
    if (boardId) {
      loadPublicBoard();
    }
  }, [boardId]);

  const loadPublicBoard = async () => {
    try {
      setLoading(true);
      setError(null);
      // Используем публичный эндпоинт - он уже возвращает доску с задачами
      const publicBoard = await boardsService.getPublicBoard(boardId);
      setBoard(publicBoard);
      
      // Отслеживаем открытие публичной доски для авторизованных пользователей
      if (user?.id) {
        trackBoardOpen(boardId, user.id);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось загрузить доску');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <Loader fullScreen />
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <FiLock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Доска недоступна
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'Эта доска приватная или не существует'}
          </p>
          <Link to="/login">
            <Button variant="primary">
              <FiHome className="inline mr-2" />
              Войти в систему
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header для публичной доски */}
      <header className="header">
        <div className="header-content">
          <Link to="/" className="brand flex-shrink-0">
            <div className="brand-mark">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="brand-logo-img" 
                onClick={handleLogoClick}
                style={{ cursor: 'pointer' }}
                onError={(e) => {
                  // Если логотип не найден, скрываем его
                  e.currentTarget.style.display = 'none';
                }} 
              />
            </div>
            <div className="brand-text">
              <div className="brand-title">Task Management System</div>
              <div className="brand-subtitle">Система управления задачами</div>
            </div>
          </Link>
          <div className="header-actions flex-shrink-0">
            <span className="pill pill--accent pill--public">
              🌐 Публичная доска
            </span>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Войти
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{board.title}</h1>
              {board.description && (
                <p className="text-sm text-gray-600 mt-1.5">{board.description}</p>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="board-filters">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Поиск задач..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
              />
            </div>
            <div className="board-filter-item">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
                className="input-modern"
              >
                <option value="">Все статусы</option>
                <option value="todo">К выполнению</option>
                <option value="in_progress">В работе</option>
                <option value="done">Выполнено</option>
              </select>
            </div>
            <div className="board-filter-item">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
                className="input-modern"
              >
                <option value="">Все приоритеты</option>
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>
          </div>

          {/* Kanban Board */}
          {board && (
            <div className="flex-1 min-h-0">
              <KanbanBoard
                boardId={boardId}
                searchQuery={searchQuery}
                statusFilter={statusFilter || undefined}
                priorityFilter={priorityFilter || undefined}
                initialTasks={board.tasks}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

