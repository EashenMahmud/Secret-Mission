import React from 'react';
import { Calendar, Clock, User2 } from 'lucide-react';
import { TaskStatusBadge, TaskPriorityBadge } from './TaskStatusBadge';
import { cn } from '../../../../lib/utils';

const TaskCard = ({ task, onClick, className }) => {
    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed';
    const progress = task.progress || 0;

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div
            onClick={() => onClick?.(task)}
            className={cn(
                'bg-[var(--bg-card)] rounded-lg border border-[var(--border-main)] p-4 cursor-pointer',
                'hover:border-[var(--primary-color)] hover:shadow-lg transition-all duration-200',
                'group relative',
                className
            )}
        >
            {/* Priority indicator line */}
            <div className={cn(
                'absolute top-0 left-0 right-0 h-1 rounded-t-lg',
                task.priority === 'High' && 'bg-red-500',
                task.priority === 'Medium' && 'bg-amber-500',
                task.priority === 'Low' && 'bg-green-500'
            )} />

            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3 pt-1">
                <h4 className="text-sm font-medium text-[var(--text-main)] line-clamp-2 group-hover:text-[var(--primary-color)] transition-colors">
                    {task.title}
                </h4>
                <TaskPriorityBadge priority={task.priority} />
            </div>

            {/* Description preview */}
            {task.description && (
                <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3">
                    {task.description}
                </p>
            )}

            {/* Progress bar */}
            <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--text-muted)]">Progress</span>
                    <span className="text-xs font-medium text-[var(--text-main)]">{progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-skeleton)]">
                    <div
                        className={cn(
                            'h-full transition-all duration-300 ease-out rounded-full',
                            progress === 100 ? 'bg-green-500' : 'bg-indigo-500'
                        )}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <TaskStatusBadge status={task.status} showDot={false} />

                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                    {/* Deadline */}
                    {task.deadline && (
                        <div className={cn(
                            'flex items-center gap-1',
                            isOverdue && 'text-red-500'
                        )}>
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(task.deadline)}</span>
                        </div>
                    )}

                    {/* Assignees count */}
                    {task.assignees?.length > 0 && (
                        <div className="flex items-center gap-1">
                            <User2 className="w-3 h-3" />
                            <span>{task.assignees.length}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
