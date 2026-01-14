import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useBoardsStore } from '@/stores/boardsStore';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { CreateBoardModal } from '@/components/modals/CreateBoardModal';
import { DeleteBoardModal } from '@/components/modals/DeleteBoardModal';
import { FiSearch, FiPlus, FiMoreVertical, FiStar, FiArrowUp } from 'react-icons/fi';
import { cn } from '@/utils/cn';

export const BoardsPage: React.FC = () => {
  const { boards, fetchBoards, loading } = useBoardsStore();
  const { openModal, modals } = useUIStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyPublic, setShowOnlyPublic] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const filteredBoards = boards
    .filter((board) => {
      const matchesSearch = board.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPublicFilter = !showOnlyPublic || board.public;
      return matchesSearch && matchesPublicFilter;
    })
    .sort((a, b) => {
      const comparison = a.title.localeCompare(b.title, 'ru');
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleDeleteClick = (e: React.MouseEvent, boardId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setBoardToDelete(boardId);
    openModal('deleteBoard');
  };

  const isOwnerOrAdmin = (board: typeof boards[0]) => {
    return user?.role === 'admin' || board.created_by === user?.id;
  };

  return (
    <Layout>
      <div className="boards-page" data-qa="boards-page">
        {/* Header */}
        <div className="boards-page-header">
          <h1 className="boards-page-title" data-qa="boards-page-title">Доски</h1>
          <Button
            variant="primary"
            onClick={() => openModal('createBoard')}
            data-qa="boards-create-board-button"
          >
            <FiPlus className="icon-sm" />
            <span>Создать доску</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="boards-filters" data-qa="boards-filters">
          <div className="boards-search-container">
            <FiSearch className="boards-search-icon" />
            <Input
              type="text"
              placeholder="Поиск досок"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="boards-search-input"
              data-qa="boards-search-input"
            />
          </div>
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="public-only"
              checked={showOnlyPublic}
              onChange={(e) => setShowOnlyPublic(e.target.checked)}
              className="checkbox"
              data-qa="boards-public-only-checkbox"
            />
            <label htmlFor="public-only" className="checkbox-label" data-qa="boards-public-only-label">
              Только публичные
            </label>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <Loader fullScreen />
        ) : filteredBoards.length === 0 ? (
          <div className="boards-empty">
            <EmptyState
              title={searchQuery ? 'Ничего не найдено' : 'Нет досок'}
              message={
                searchQuery
                  ? 'Попробуйте изменить поисковый запрос'
                  : 'Создайте свою первую доску для начала работы'
              }
              action={
                !searchQuery && (
                  <Button
                    variant="primary"
                    onClick={() => openModal('createBoard')}
                  >
                    Создать доску
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <div className="boards-table-container">
            <table className="boards-table" data-qa="boards-table">
              <thead>
                <tr>
                  <th className="boards-table-header boards-table-header--name">
                    <button
                      className="boards-table-sort-btn"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      <FiStar className="icon-sm" />
                      <span>Название</span>
                      <FiArrowUp className={cn('icon-sm', 'boards-table-sort-icon', sortOrder === 'desc' && 'boards-table-sort-icon--desc')} />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBoards.map((board) => (
                  <tr key={board.id} className="boards-table-row" data-qa={`board-row-${board.id}`}>
                    <td className="boards-table-cell">
                      <div className="boards-table-row-content">
                        <button className="boards-table-star-btn" aria-label="Добавить в избранное">
                          <FiStar className="icon-sm" />
                        </button>
                        <Link
                          to={`/boards/${board.id}`}
                          className="boards-table-board-link"
                          data-qa={`board-link-${board.id}`}
                        >
                          <span className="boards-table-board-name" data-qa={`board-title-${board.id}`}>
                            {board.title}
                          </span>
                        </Link>
                        {board.public && (
                          <span className="pill pill--accent pill--public boards-table-public-badge">
                            Публичная
                          </span>
                        )}
                        <div className="boards-table-row-actions">
                          {isOwnerOrAdmin(board) && (
                            <button
                              className="boards-table-action-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteClick(e, board.id);
                              }}
                              aria-label="Действия с доской"
                              data-qa={`board-actions-${board.id}`}
                            >
                              <FiMoreVertical className="icon-sm" />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modals.createBoard && <CreateBoardModal />}
      {modals.deleteBoard && boardToDelete && (
        <DeleteBoardModal boardId={boardToDelete} />
      )}
    </Layout>
  );
};

