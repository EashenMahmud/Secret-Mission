import React from 'react';
import { cn } from '../../../../lib/utils';

const STATUS_CONFIG = {
    draft: {
        label: 'Draft',
        color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        dotColor: 'bg-slate-500'
    },
    pending: {
        label: 'Pending',
        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        dotColor: 'bg-amber-500'
    },
    in_progress: {
        label: 'In Progress',
        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        dotColor: 'bg-blue-500'
    },
    in_review: {
        label: 'In Review',
        color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        dotColor: 'bg-purple-500'
    },
    completed: {
        label: 'Completed',
        color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
        dotColor: 'bg-green-500'
    },
    blocked: {
        label: 'Blocked',
        color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
        dotColor: 'bg-red-500'
    }
};

const PRIORITY_CONFIG = {
    High: {
        label: 'High',
        color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
    },
    Medium: {
        label: 'Medium',
        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    },
    Low: {
        label: 'Low',
        color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
    }
};

export const TaskStatusBadge = ({ status, showDot = true, className }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors',
            config.color,
            className
        )}>
            {showDot && <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />}
            {config.label}
        </span>
    );
};

export const TaskPriorityBadge = ({ priority, className }) => {
    const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;

    return (
        <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors',
            config.color,
            className
        )}>
            {config.label}
        </span>
    );
};

export const getStatusConfig = () => STATUS_CONFIG;
export const getPriorityConfig = () => PRIORITY_CONFIG;

export default TaskStatusBadge;
