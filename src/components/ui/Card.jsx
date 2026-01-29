import React from 'react';
import { cn } from '../../lib/utils';

const Card = ({ children, className, ...props }) => {
    return (
        <div
            className={cn('bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] shadow-sm overflow-hidden transition-colors duration-300', className)}
            {...props}
        >
            {children}
        </div>
    );
};

const CardHeader = ({ title, subtitle, action, className, ...props }) => {
    return (
        <div className={cn('px-6 py-4 border-b border-[var(--border-main)]/50 flex items-center justify-between', className)} {...props}>
            <div>
                {title && <h3 className="text-lg font-semibold text-[var(--text-main)] leading-none">{title}</h3>}
                {subtitle && <p className="text-sm text-[var(--text-muted)] mt-1">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
};

const CardBody = ({ children, className, ...props }) => {
    return (
        <div className={cn('p-6', className)} {...props}>
            {children}
        </div>
    );
};

const CardFooter = ({ children, className, ...props }) => {
    return (
        <div className={cn('px-6 py-4 bg-[var(--bg-app)]/50 border-t border-[var(--border-main)]', className)} {...props}>
            {children}
        </div>
    );
};

export { Card, CardHeader, CardBody, CardFooter };
