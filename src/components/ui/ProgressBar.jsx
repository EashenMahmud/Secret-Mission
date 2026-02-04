import React from 'react';
import { cn } from '../../lib/utils';

const ProgressBar = ({
    value = 0,
    max = 100,
    showValue = false,
    variant = 'primary',
    className
}) => {
    const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

    const variants = {
        primary: 'bg-indigo-600',
        success: 'bg-green-500',
        danger: 'bg-red-500',
        warning: 'bg-yellow-500',
    };

    return (
        <div className={cn('w-full', className)}>
            <div className="flex items-center justify-between mb-1">
                {showValue && (
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                        {Math.round(percentage)}%
                    </span>
                )}
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-skeleton)] border border-[var(--border-main)]/50">
                <div
                    className={cn('h-full transition-all duration-300 ease-out', variants[variant])}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
