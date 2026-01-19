import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useBoardsStore } from '@/stores/boardsStore';
import { useUIStore } from '@/stores/uiStore';
import { CreateBoardModal } from '@/components/modals/CreateBoardModal';
import { statsService } from '@/services/stats.service';
import { DashboardStats } from '@/types';
import { FiGrid, FiCheckCircle, FiRefreshCw, FiCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import ru from 'date-fns/locale/ru';

export const DashboardPage: React.FC = () => {
  const { boards, fetchBoards, loading } = useBoardsStore();
  const { openModal, modals } = useUIStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchBoards();
    loadStats();
  }, [fetchBoards]);

  const loadStats = async () => {
    try {
      const data = await statsService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      // Устанавливаем null чтобы показать fallback значения
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading || statsLoading) {
    return (
      <Layout>
        <Loader fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" data-qa="dashboard-page">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }} data-qa="dashboard-title">Панель управления</h1>
          <Button
            variant="primary"
            onClick={() => openModal('createBoard')}
            data-qa="dashboard-create-board-button"
          >
            Создать доску
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4" data-qa="dashboard-stats">
          <Card className="stat-card" data-qa="dashboard-stat-total-boards">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Всего досок</p>
                <p className="stat-value" data-qa="dashboard-stat-total-boards-value">
                  {stats?.total_boards || boards.length}
                </p>
              </div>
              <FiGrid style={{ width: '32px', height: '32px', color: 'var(--accent)' }} />
            </div>
          </Card>
          <Card className="stat-card" data-qa="dashboard-stat-total-tasks">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Всего задач</p>
                <p className="stat-value" data-qa="dashboard-stat-total-tasks-value">
                  {stats?.total_tasks || 0}
                </p>
              </div>
              <FiCheckCircle style={{ width: '32px', height: '32px', color: 'var(--good)' }} />
            </div>
          </Card>
          <Card className="stat-card" data-qa="dashboard-stat-in-progress">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">В работе</p>
                <p className="stat-value" data-qa="dashboard-stat-in-progress-value">
                  {stats?.tasks_by_status?.in_progress || 0}
                </p>
              </div>
              <FiRefreshCw style={{ width: '32px', height: '32px', color: 'var(--warn)' }} />
            </div>
          </Card>
          <Card className="stat-card" data-qa="dashboard-stat-done">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Выполнено</p>
                <p className="stat-value" data-qa="dashboard-stat-done-value">
                  {stats?.tasks_by_status?.done || 0}
                </p>
              </div>
              <FiCircle style={{ width: '32px', height: '32px', color: 'var(--good)' }} />
            </div>
          </Card>
        </div>

        {/* Recent Boards */}
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)', marginBottom: '16px' }}>
            Последние доски
          </h2>
          {boards.length === 0 ? (
            <Card>
              <EmptyState
                title="Нет досок"
                message="Создайте свою первую доску для начала работы"
                action={
                  <Button
                    variant="primary"
                    onClick={() => openModal('createBoard')}
                    data-qa="dashboard-empty-create-board-button"
                  >
                    Создать доску
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {boards.slice(0, 6).map((board) => (
                <Card key={board.id} hover onClick={() => {}}>
                  <Link to={`/boards/${board.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="text-base font-semibold" style={{ color: 'var(--text)', marginBottom: '8px' }}>
                      {board.title}
                    </h3>
                    {board.description && (
                      <p className="text-sm text-muted" style={{ marginBottom: '16px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {board.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      <span>
                        {format(new Date(board.created_at), 'dd MMM yyyy', {
                          locale: ru,
                        })}
                      </span>
                      {board.public && (
                        <span className="pill pill--accent pill--public">
                          Публичная
                        </span>
                      )}
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {modals.createBoard && <CreateBoardModal />}
    </Layout>
  );
};

