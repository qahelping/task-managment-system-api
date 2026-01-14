import { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/utils/cn';
import { TaskStatus } from '@/types';

interface KanbanColumnProps {
  column: { id: TaskStatus; title: string };
  children: ReactNode;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const columnClassMap = {
    todo: 'kanban-column--todo',
    in_progress: 'kanban-column--in-progress',
    done: 'kanban-column--done',
  };

  const titleClassMap = {
    todo: 'kanban-column-title--todo',
    in_progress: 'kanban-column-title--in-progress',
    done: 'kanban-column-title--done',
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'kanban-column',
        columnClassMap[column.id],
        isOver && 'is-over'
      )}
      data-qa={`kanban-column-${column.id}`}
    >
      <h3 className={cn('kanban-column-title', titleClassMap[column.id])} data-qa={`kanban-column-title-${column.id}`}>
        {column.title}
      </h3>
      <div className="kanban-column-tasks" data-qa={`kanban-column-tasks-${column.id}`}>
        {children}
      </div>
    </div>
  );
};

