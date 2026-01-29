import React from 'react';
import { useField } from 'formik';
import { cn } from '../../lib/utils';

const Checkbox = ({ label, helperText, className, ...props }) => {
    const [field, meta] = useField({ ...props, type: 'checkbox' });
    const isError = meta.touched && meta.error;

    return (
        <div className={cn('flex flex-col gap-1', className)}>
            <div className="flex items-center gap-3">
                <input
                    {...field}
                    {...props}
                    type="checkbox"
                    className={cn(
                        'h-4 w-4 rounded border-[var(--border-main)] text-primary-600 focus:ring-primary-600 focus:ring-2 transition-all cursor-pointer bg-[var(--bg-card)]',
                        'dark:border-dark-600 dark:bg-dark-800 dark:checked:bg-primary-500 dark:checked:border-primary-500',
                        isError && 'border-red-500 focus:ring-red-500 dark:border-red-500',
                        props.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                />
                {label && (
                    <label 
                        htmlFor={props.id || props.name} 
                        className="text-sm font-medium text-[var(--text-main)] cursor-pointer select-none"
                    >
                        {label}
                    </label>
                )}
            </div>
            {isError && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400 ml-7">{meta.error}</p>
            )}
            {helperText && !isError && (
                <p className="mt-1 text-xs text-[var(--text-muted)] ml-7">{helperText}</p>
            )}
        </div>
    );
};

export default Checkbox;
