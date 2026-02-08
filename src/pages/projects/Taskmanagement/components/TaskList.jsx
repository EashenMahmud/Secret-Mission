import React from 'react';
import { Calendar, User2, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { TaskStatusBadge, TaskPriorityBadge } from './TaskStatusBadge';
import { cn } from '../../../../lib/utils';

const TaskList = ({
    tasks = [],
    onTaskClick,
    isLoading = false,
    sortBy = 'created_at',
    sortOrder = 'desc',
    onSort
}) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const handleSort = (field) => {
        if (onSort) {
            const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
            onSort(field, newOrder);
        }
    };

    const SortableHeader = ({ field, children }) => (
        <button
            onClick={() => handleSort(field)}
            className={cn(
                "flex items-center gap-1 text-xs font-medium uppercase tracking-wider",
                sortBy === field ? 'text-[var(--primary-color)]' : 'text-[var(--text-muted)]',
                "hover:text-[var(--primary-color)] transition-colors"
            )}
        >
            {children}
            <ArrowUpDown className="w-3 h-3" />
        </button>
    );

    if (isLoading) {
        return (
            <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-main)] overflow-hidden">
                <div className="p-4 border-b border-[var(--border-main)]">
                    <div className="h-4 w-32 bg-[var(--bg-skeleton)] rounded animate-pulse" />
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 border-b border-[var(--border-main)]">
                        <div className="h-6 w-full bg-[var(--bg-skeleton)] rounded animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-main)] p-12 text-center">
                <p className="text-[var(--text-muted)]">No tasks found</p>
            </div>
        );
    }

    return (
        <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-main)] overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[var(--bg-app)] border-b border-[var(--border-main)]">
                <div className="col-span-4">
                    <SortableHeader field="title">Task</SortableHeader>
                </div>
                <div className="col-span-2">
                    <SortableHeader field="status">Status</SortableHeader>
                </div>
                <div className="col-span-1">
                    <SortableHeader field="priority">Priority</SortableHeader>
                </div>
                <div className="col-span-2">
                    <SortableHeader field="progress">Progress</SortableHeader>
                </div>
                <div className="col-span-2">
                    <SortableHeader field="deadline">Deadline</SortableHeader>
                </div>
                <div className="col-span-1">
                    <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                        Assignees
                    </span>
                </div>
            </div>

            {/* Table Rows */}
            {tasks.map((task) => {
                const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed';
                const progress = task.progress || 0;

                return (
                    <div
                        key={task.id}
                        onClick={() => onTaskClick?.(task)}
                        className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-[var(--border-main)] hover:bg-[var(--bg-app)] cursor-pointer transition-colors group"
                    >
                        {/* Task title */}
                        <div className="col-span-4">
                            <p className="text-sm font-medium text-[var(--text-main)] group-hover:text-[var(--primary-color)] transition-colors line-clamp-1">
                                {task.title}
                            </p>
                            {task.description && (
                                <p className="text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">
                                    {task.description}
                                </p>
                            )}
                        </div>

                        {/* Status */}
                        <div className="col-span-2 flex items-center">
                            <TaskStatusBadge status={task.status} showDot={true} />
                        </div>

                        {/* Priority */}
                        <div className="col-span-1 flex items-center">
                            <TaskPriorityBadge priority={task.priority} />
                        </div>

                        {/* Progress */}
                        <div className="col-span-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-[var(--bg-skeleton)] rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-all',
                                        progress === 100 ? 'bg-green-500' : 'bg-indigo-500'
                                    )}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-xs font-medium text-[var(--text-muted)] w-8">
                                {progress}%
                            </span>
                        </div>

                        {/* Deadline */}
                        <div className="col-span-2 flex items-center">
                            <div className={cn(
                                "flex items-center gap-1 text-sm",
                                isOverdue ? 'text-red-500' : 'text-[var(--text-muted)]'
                            )}>
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(task.deadline)}
                            </div>
                        </div>

                        {/* Assignees */}
                        <div className="col-span-1 flex items-center">
                            {task.assignees?.length > 0 ? (
                                <div className="flex -space-x-2">
                                    {task.assignees.slice(0, 3).map((assignee, i) => (
                                        <div
                                            key={i}
                                            className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium border-2 border-[var(--bg-card)]"
                                            title={assignee.name || assignee.user_name}
                                        >
                                            {(assignee.name || assignee.user_name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    ))}
                                    {task.assignees.length > 3 && (
                                        <div className="w-6 h-6 rounded-full bg-[var(--bg-app)] flex items-center justify-center text-[var(--text-muted)] text-xs font-medium border-2 border-[var(--bg-card)]">
                                            +{task.assignees.length - 3}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <User2 className="w-4 h-4 text-[var(--text-muted)]" />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TaskList;
