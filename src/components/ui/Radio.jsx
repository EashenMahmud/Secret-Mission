import React from 'react';
import { useField } from 'formik';
import { cn } from '../../lib/utils';

const Radio = ({ label, options = [], helperText, className, required, ...props }) => {
    const [field, meta] = useField(props);
    const isError = meta.touched && meta.error;

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            {label && (
                <label className="text-sm font-medium leading-6 text-gray-900">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="space-y-2">
                {options.map((option) => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                        <input
                            {...field}
                            {...props}
                            type="radio"
                            value={option.value}
                            checked={field.value === option.value}
                            className={cn(
                                'h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600 transition-all cursor-pointer',
                                isError && 'border-red-500 focus:ring-red-500'
                            )}
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                            {option.label}
                        </span>
                    </label>
                ))}
            </div>
            {isError && (
                <p className="mt-1 text-xs text-red-600">{meta.error}</p>
            )}
            {helperText && !isError && (
                <p className="mt-1 text-xs text-gray-500">{helperText}</p>
            )}
        </div>
    );
};

export default Radio;
