import { useEffect, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useBoardsStore } from '@/stores/boardsStore';
import { useTasksStore } from '@/stores/tasksStore';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { Loader } from '@/components/ui/Loader';

interface KanbanBoardProps {
  boardId: number;
  searchQuery?: string;
  statusFilter?: TaskStatus;
  priorityFilter?: TaskPriority;
  initialTasks?: Task[];
}

const columns: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'К выполнению' },
  { id: 'in_progress', title: 'В работе' },
  { id: 'done', title: 'Выполнено' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  boardId,
  searchQuery = '',
  statusFilter,
  priorityFilter,
  initialTasks,
}) => {
  const { fetchBoard } = useBoardsStore();
  const { tasks, fetchTasks, updateTaskStatus, loading, setTasks } = useTasksStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    if (initialTasks) {
      setTasks(initialTasks);
    } else {
      fetchTasks(boardId, statusFilter, priorityFilter);
    }
  }, [boardId, statusFilter, priorityFilter, fetchTasks, initialTasks, setTasks]);

  const displayTasks = initialTasks !== undefined && tasks.length === 0 ? initialTasks : tasks;

  // Filter tasks by search query, status and priority
  const filteredTasks = displayTasks.filter((task) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !task.title.toLowerCase().includes(query) &&
        !task.description?.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (statusFilter && task.status !== statusFilter) return false;
    if (priorityFilter && task.priority !== priorityFilter) return false;
    return true;
  });

  // Group tasks by status
  const tasksByStatus = columns.reduce((acc, column) => {
    acc[column.id] = filteredTasks.filter((task) => task.status === column.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = displayTasks.find((t) => t.id === parseInt(active.id as string));
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = parseInt(active.id as string);
    const newStatus = over.id as TaskStatus;

    const task = displayTasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    try {
      await updateTaskStatus(taskId, newStatus);
      // Refresh board to get updated task order
      await fetchBoard(boardId);
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  if (!initialTasks && loading) {
    return <Loader fullScreen />;
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-3 gap-4 h-[calc(100vh-250px)]" data-qa="kanban-board">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column}>
            <SortableContext
              items={tasksByStatus[column.id].map((t) => t.id.toString())}
              strategy={verticalListSortingStrategy}
            >
              {tasksByStatus[column.id].map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </SortableContext>
          </KanbanColumn>
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
};

