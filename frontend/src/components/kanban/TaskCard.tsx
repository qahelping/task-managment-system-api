import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import ru from 'date-fns/locale/ru';
import { FiEdit2, FiUser } from 'react-icons/fi';
import { useUIStore } from '@/stores/uiStore';
import { useTasksStore } from '@/stores/tasksStore';
import { useBoardsStore } from '@/stores/boardsStore';
import { useState, useEffect } from 'react';
import { usersService } from '@/services/users.service';
import { User } from '@/types';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging }) => {
  const { setNodeRef, attributes, listeners, transform, transition } = useSortable({
    id: task.id.toString(),
    data: {
      type: 'task',
      status: task.status,
    },
  });
  const { openModal } = useUIStore();
  const { setCurrentTask } = useTasksStore();
  const { currentBoard } = useBoardsStore();
  const [assignee, setAssignee] = useState<User | null>(null);

  useEffect(() => {
    if (task.assignee_id) {
      loadAssignee();
    } else {
      setAssignee(null);
    }
  }, [task.assignee_id]);

  const loadAssignee = async () => {
    if (!task.assignee_id) {
      setAssignee(null);
      return;
    }

    try {
      // Получаем информацию о пользователе по его ID
      const user = await usersService.getUserById(task.assignee_id);
      setAssignee(user);
    } catch (error) {
      console.error('Failed to load assignee:', error);
      // Если не удалось загрузить пользователя, очищаем assignee
      setAssignee(null);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const openEditModal = () => {
    setCurrentTask(task);
    openModal('editTask');
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Не открываем модальное окно, если клик был на кнопке редактирования
    if ((e.target as HTMLElement).closest('.task-card-edit-btn')) {
      return;
    }
    setCurrentTask(task);
    openModal('editTask');
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Убеждаемся, что task имеет board_id
    if (!task.board_id && currentBoard) {
      const taskWithBoardId = { ...task, board_id: currentBoard.id };
      setCurrentTask(taskWithBoardId);
    } else {
      setCurrentTask(task);
    }
    openModal('editTask');
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-qa={`task-card-${task.id}`}>
      <Card
        className={cn(
          'task-card cursor-move',
          isDragging && 'task-card--dragging'
        )}
        onClick={handleCardClick}
        data-qa={`task-card-content-${task.id}`}
      >
        <div className="task-card-content">
          <div className="task-card-header">
            <h4 className="task-card-title" data-qa={`task-title-${task.id}`}>
              {task.title}
            </h4>
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              style={{ display: 'inline-block' }}
            >
              <button
                type="button"
                onClick={handleEditClick}
                className="task-card-edit-btn"
                data-qa={`task-edit-button-${task.id}`}
                title="Редактировать задачу"
                style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
              >
                <FiEdit2 />
              </button>
            </div>
          </div>
          {task.description && (
            <p className="task-card-description">
              {task.description}
            </p>
          )}
          {assignee && (
            <div
              className="task-card-assignee"
              title={assignee.username}
            >
              <FiUser />
              <span>{assignee.username}</span>
            </div>
          )}
          <div className="task-card-footer">
            <span className={cn('task-card-priority', `task-card-priority--${task.priority}`)}>
              {task.priority === 'low' && 'Низкий'}
              {task.priority === 'medium' && 'Средний'}
              {task.priority === 'high' && 'Высокий'}
            </span>
            <span className="task-card-date">
              {format(new Date(task.created_at), 'dd MMM', { locale: ru })}
            </span>
        <div className="task-card-inner">
          <div
            className="task-card-drag-area"
            {...attributes}
            {...listeners}
            onClick={openEditModal}
          >
            <div className="task-card-content">
              <div className="task-card-header">
                <h4 className="task-card-title" data-qa={`task-title-${task.id}`}>
                  {task.title}
                </h4>
              </div>
              {task.description && (
                <p className="task-card-description">
                  {task.description}
                </p>
              )}
              <div className="task-card-footer">
                <span className={cn('task-card-priority', `task-card-priority--${task.priority}`)}>
                  {task.priority === 'low' && 'Низкий'}
                  {task.priority === 'medium' && 'Средний'}
                  {task.priority === 'high' && 'Высокий'}
                </span>
                <span className="task-card-date">
                  {format(new Date(task.created_at), 'dd MMM', { locale: ru })}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal();
            }}
            className="task-card-edit-btn"
            data-qa="task-card-edit-btn"
            aria-label="Редактировать задачу"
          >
            <FiEdit2 />
          </button>
        </div>
      </Card>
    </div>
  );
};

