import { useEffect, useState, useMemo, useRef } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
  { id: 'todo', title: 'В работу' },
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
  const { tasks, fetchTasks, updateTaskStatus, loading, setTasks } = useTasksStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const isUpdatingRef = useRef(false);

  const hasLoadedRef = useRef(false);
  const prevBoardIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Сбрасываем флаг загрузки при смене доски
    if (prevBoardIdRef.current !== boardId) {
      hasLoadedRef.current = false;
      prevBoardIdRef.current = boardId;
    }

    // Не загружаем задачи, если идет обновление или уже загружены (чтобы избежать конфликтов)
    if (isUpdatingRef.current || hasLoadedRef.current) return;

    hasLoadedRef.current = true;

    if (initialTasks) {
      setTasks(initialTasks);
    } else {
      fetchTasks(boardId, statusFilter, priorityFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, statusFilter, priorityFilter, initialTasks]);

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

  // Group tasks by status - используем useMemo для оптимизации
  const tasksByStatus = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.id] = filteredTasks.filter((task) => task.status === column.id);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [filteredTasks]);

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
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Определяем новый статус используя data.current
    let newStatus: TaskStatus | null = null;

    // Проверяем data.current для определения типа элемента
    const overData = over.data.current;

    if (overData?.type === 'column' && overData?.status) {
      // Перетаскивание над колонкой
      newStatus = overData.status as TaskStatus;
    } else if (overData?.type === 'task' && overData?.status) {
      // Перетаскивание над другой задачей - используем её статус
      newStatus = overData.status as TaskStatus;
    } else {
      // Fallback: проверяем over.id
      const validStatuses: TaskStatus[] = ['todo', 'in_progress', 'done'];
      if (validStatuses.includes(over.id as TaskStatus)) {
        newStatus = over.id as TaskStatus;
      } else {
        // Если это ID задачи - находим задачу и используем её статус
        const overTaskId = parseInt(over.id as string);
        const overTask = displayTasks.find((t) => t.id === overTaskId);
        if (overTask) {
          newStatus = overTask.status;
        }
      }
    }

    // Если не удалось определить новый статус или статус не изменился, выходим
    if (!newStatus || task.status === newStatus) return;

    try {
      isUpdatingRef.current = true;
      // updateTaskStatus уже обновляет задачу в store, не нужно вызывать fetchBoard
      await updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error('Failed to update task status:', error);
    } finally {
      // Небольшая задержка перед разрешением повторной загрузки
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 300);
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
      <div className="grid grid-cols-3 gap-4 h-full" data-qa="kanban-board">
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

