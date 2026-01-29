import React from 'react';
import { cn } from '../../lib/utils';

const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    ...props
}, ref) => {
    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm focus-visible:ring-primary-500',
        secondary: 'bg-[var(--bg-card)] text-[var(--text-main)] ring-1 ring-inset ring-[var(--border-main)] hover:bg-[var(--bg-app)] focus-visible:ring-primary-500',
        outline: 'bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-500/10 focus-visible:ring-primary-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-500',
        ghost: 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-app)] hover:text-[var(--text-main)] focus-visible:ring-primary-500',
    };

    const sizes = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3.5 py-2 text-sm font-semibold',
        lg: 'px-5 py-3 text-base font-semibold',
    };

    return (
        <button
            ref={ref}
            disabled={disabled || isLoading}
            className={cn(
                'inline-flex items-center justify-center rounded-md gap-2 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {!isLoading && leftIcon && <span className="flex items-center">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="flex items-center">{rightIcon}</span>}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
