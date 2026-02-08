import React from 'react';
import TaskCard from './TaskCard';
import { getStatusConfig } from './TaskStatusBadge';
import { cn } from '../../../../lib/utils';
import { Plus } from 'lucide-react';

const TaskBoard = ({
    tasks = [],
    onTaskClick,
    onAddTask,
    isLoading = false
}) => {
    const statusConfig = getStatusConfig();
    const statuses = Object.keys(statusConfig);

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
        <div className="overflow-x-auto pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-w-[1200px]">
                {statuses.map((status) => {
                    const config = statusConfig[status];
                    const statusTasks = getTasksByStatus(status);

                    return (
                        <div
                            key={status}
                            className={cn(
                                'bg-[var(--bg-app)] rounded-lg border-t-4 flex flex-col',
                                getColumnColor(status)
                            )}
                        >
                            {/* Column Header */}
                            <div className="p-3 border-b border-[var(--border-main)]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            'w-2 h-2 rounded-full',
                                            config.dotColor
                                        )} />
                                        <h3 className="text-sm font-semibold text-[var(--text-main)]">
                                            {config.label}
                                        </h3>
                                        <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-card)] px-2 py-0.5 rounded-full">
                                            {statusTasks.length}
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
                            <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-320px)]">
                                {statusTasks.length === 0 ? (
                                    <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                                        No tasks
                                    </div>
                                ) : (
                                    statusTasks.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onClick={onTaskClick}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TaskBoard;
