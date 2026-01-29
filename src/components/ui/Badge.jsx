import React from 'react';
import { cn } from '../../lib/utils';

const Badge = ({
    children,
    variant = 'info',
    className,
    ...props
}) => {
    const variants = {
        success: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
        error: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
        warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
        info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        gray: 'bg-[var(--bg-app)] text-[var(--text-muted)] border-[var(--border-main)]',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};

export default Badge;
