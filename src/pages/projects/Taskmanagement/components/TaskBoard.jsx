import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
    MeasuringStrategy,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import DraggableTaskCard from './DraggableTaskCard';
import { getStatusConfig } from './TaskStatusBadge';
import { cn } from '../../../../lib/utils';
import { Plus } from 'lucide-react';
import { usePostApiMutation } from '../../../../store/api/commonApi';
import { toast } from 'react-toastify';

const TaskBoard = ({
    tasks = [],
    onTaskClick,
    onAddTask,
    onStatusChange,
    isLoading = false
}) => {
    const statusConfig = getStatusConfig();
    const statuses = Object.keys(statusConfig);
    const [activeTask, setActiveTask] = useState(null);
    const [postApi] = usePostApiMutation();

    // Smoother pointer sensor with minimal activation distance
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Start drag after 5px movement
            },
        }),
        useSensor(KeyboardSensor)
    );

    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };

    const getColumnColor = (status) => {
        const colors = {
            draft: 'border-t-slate-500',
            pending: 'border-t-amber-500',
            in_progress: 'border-t-blue-500',
            in_review: 'border-t-purple-500',
            completed: 'border-t-green-500',
            blocked: 'border-t-red-500',
        };
        return colors[status] || 'border-t-slate-500';
    };

    const handleDragStart = (event) => {
        const { active } = event;
        const task = tasks.find(t => t.id === active.id);
        setActiveTask(task);
        document.body.style.cursor = 'grabbing';
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveTask(null);
        document.body.style.cursor = '';

        if (!over) return;

        const taskId = active.id;
        const task = tasks.find(t => t.id === taskId);

        if (!task) return;

        // Get the target status from the droppable container
        let targetStatus = over.id;

        // If dropped over another task, get that task's status
        if (!statuses.includes(targetStatus)) {
            const overTask = tasks.find(t => t.id === over.id);
            if (overTask) {
                targetStatus = overTask.status;
            } else {
                return;
            }
        }

        // Don't do anything if dropped on same status
        if (task.status === targetStatus) return;

        try {
            // Call API to update status
            await postApi({
                end_point: `/update-progress-status/${taskId}`,
                body: {
                    task_id: String(taskId),
                    status: targetStatus,
                    progress: targetStatus === 'completed' ? 100 : task.progress || 0,
                },
            }).unwrap();

            toast.success(`Task moved to ${statusConfig[targetStatus]?.label || targetStatus}`);
            onStatusChange?.();
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to update task status');
        }
    };

    const handleDragCancel = () => {
        setActiveTask(null);
        document.body.style.cursor = '';
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statuses.map((status) => (
                    <div
                        key={status}
                        className="bg-[var(--bg-app)] rounded-lg p-4 border-t-4 border-[var(--border-main)]"
                    >
                        <div className="h-6 w-24 bg-[var(--bg-skeleton)] rounded animate-pulse mb-4" />
                        <div className="space-y-3">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-32 bg-[var(--bg-skeleton)] rounded-lg animate-pulse" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            measuring={{
                droppable: {
                    strategy: MeasuringStrategy.Always,
                },
            }}
        >
            <div className="overflow-x-auto pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-w-[1200px]">
                    {statuses.map((status) => {
                        const config = statusConfig[status];
                        const statusTasks = getTasksByStatus(status);

                        return (
                            <DroppableColumn
                                key={status}
                                status={status}
                                config={config}
                                tasks={statusTasks}
                                columnColor={getColumnColor(status)}
                                onTaskClick={onTaskClick}
                                onAddTask={onAddTask}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Drag Overlay - follows cursor smoothly without elastic effect */}
            <DragOverlay
                dropAnimation={null}
                style={{ cursor: 'grabbing' }}
            >
                {activeTask ? (
                    <div className="shadow-2xl rounded-lg" style={{ width: '280px' }}>
                        <TaskCard task={activeTask} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

// Droppable Column Component
const DroppableColumn = ({ status, config, tasks, columnColor, onTaskClick, onAddTask }) => {
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'bg-[var(--bg-app)] rounded-lg border-t-4 flex flex-col transition-colors duration-200',
                columnColor,
                isOver && 'bg-[var(--primary-color)]/5 ring-2 ring-[var(--primary-color)] ring-inset'
            )}
        >
            {/* Column Header */}
            <div className="p-3 border-b border-[var(--border-main)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={cn('w-2 h-2 rounded-full', config.dotColor)} />
                        <h3 className="text-sm font-semibold text-[var(--text-main)]">
                            {config.label}
                        </h3>
                        <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-card)] px-2 py-0.5 rounded-full">
                            {tasks.length}
                        </span>
                    </div>
                    {status === 'draft' && (
                        <button
                            onClick={() => onAddTask?.(status)}
                            className="p-1 hover:bg-[var(--bg-card)] rounded transition-colors"
                        >
                            <Plus className="w-4 h-4 text-[var(--text-muted)]" />
                        </button>
                    )}
                </div>
            </div>

            {/* Tasks */}
            <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-320px)] min-h-[100px]">
                <SortableContext
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.length === 0 ? (
                        <div className={cn(
                            "text-center py-8 text-xs text-[var(--text-muted)] border-2 border-dashed rounded-lg transition-all duration-200",
                            isOver
                                ? "border-[var(--primary-color)] bg-[var(--primary-color)]/10 text-[var(--primary-color)]"
                                : "border-[var(--border-main)]"
                        )}>
                            {isOver ? 'Drop here' : 'No tasks'}
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <DraggableTaskCard
                                key={task.id}
                                task={task}
                                onClick={onTaskClick}
                            />
                        ))
                    )}
                </SortableContext>
            </div>
        </div>
    );
};

export default TaskBoard;
