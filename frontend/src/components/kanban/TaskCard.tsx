import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, User } from '@/types';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import ru from 'date-fns/locale/ru';
import { FiEdit2, FiUser, FiMove } from 'react-icons/fi';
import { useUIStore } from '@/stores/uiStore';
import { useTasksStore } from '@/stores/tasksStore';
import { useBoardsStore } from '@/stores/boardsStore';
import { useState, useEffect, useCallback, type FC, type MouseEvent } from 'react';
import { usersService } from '@/services/users.service';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export const TaskCard: FC<TaskCardProps> = ({ task, isDragging = false }: TaskCardProps) => {
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

  const loadAssignee = useCallback(async () => {
    if (!task.assignee_id) {
      setAssignee(null);
      return;
    }
    try {
      const user = await usersService.getUserById(task.assignee_id);
      setAssignee(user);
    } catch (error) {
      console.error('Failed to load assignee:', error);
      setAssignee(null);
    }
  }, [task.assignee_id]);

  useEffect(() => {
    if (task.assignee_id) {
      loadAssignee();
    } else {
      setAssignee(null);
    }
  }, [task.assignee_id, loadAssignee]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleCardClick = (e: MouseEvent<Element>) => {
    if ((e.target as HTMLElement).closest('.task-card-edit-btn') || (e.target as HTMLElement).closest('.task-card-drag-handle')) {
      return;
    }
    setCurrentTask(task);
    openModal('editTask');
  };

  const handleEditClick = (e: MouseEvent<HTMLButtonElement>) => {
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
          'task-card',
          isDragging && 'task-card--dragging'
        )}
        onClick={handleCardClick}
        data-qa={`task-card-content-${task.id}`}
      >
        <div className="task-card-content">
          <div className="task-card-header">
            <span
              className="task-card-drag-handle"
              {...attributes}
              {...listeners}
              title="Перетащить"
              aria-label="Перетащить задачу"
              data-qa="task-card-drag-handle"
            >
              <FiMove />
            </span>
            <h4 className="task-card-title" data-qa={`task-title-${task.id}`}>
              {task.title}
            </h4>
            <button
              type="button"
              onClick={handleEditClick}
              className="task-card-edit-btn"
              data-qa="task-card-edit-btn"
              title="Редактировать задачу"
              aria-label="Редактировать задачу"
            >
              <FiEdit2 />
            </button>
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
          </div>
        </div>
      </Card>
    </div>
  );
};

