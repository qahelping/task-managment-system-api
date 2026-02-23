import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import ru from 'date-fns/locale/ru';
import { FiEdit2 } from 'react-icons/fi';
import { useUIStore } from '@/stores/uiStore';
import { useTasksStore } from '@/stores/tasksStore';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging }) => {
  const { setNodeRef, attributes, listeners, transform, transition } = useSortable({
    id: task.id.toString(),
  });
  const { openModal } = useUIStore();
  const { setCurrentTask } = useTasksStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const openEditModal = () => {
    setCurrentTask(task);
    openModal('editTask');
  };

  return (
    <div ref={setNodeRef} style={style} data-qa={`task-card-${task.id}`}>
      <Card
        className={cn(
          'task-card cursor-move',
          isDragging && 'task-card--dragging'
        )}
      >
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

