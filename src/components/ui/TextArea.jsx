import React from 'react';
import { useField } from 'formik';
import { cn } from '../../lib/utils';

const TextArea = ({ label, helperText, className, rows = 3, ...props }) => {
    const [field, meta] = useField(props);
    const isError = meta.touched && meta.error;

    return (
        <div className={cn('flex flex-col gap-1 w-full', className)}>
            {label && (
                <label htmlFor={props.id || props.name} className="block text-sm font-medium leading-6 text-gray-900">
                    {label}
                </label>
            )}
            <textarea
                {...field}
                {...props}
                rows={rows}
                className={cn(
                    'block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all',
                    isError && 'ring-red-500 focus:ring-red-500',
                    props.disabled && 'bg-gray-50 text-gray-400 cursor-not-allowed'
                )}
            />
            {isError && (
                <p className="mt-1 text-xs text-red-600" id={`${props.name}-error`}>
                    {meta.error}
                </p>
            )}
            {helperText && !isError && (
                <p className="mt-1 text-xs text-gray-500">{helperText}</p>
            )}
        </div>
    );
};

export default TextArea;
