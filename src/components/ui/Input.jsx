import React, { useState } from 'react';
import { useField } from 'formik';
import { cn } from '../../lib/utils';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ label, helperText, className, type = 'text', ...props }) => {
    const [field, meta] = useField(props);
    const [showPassword, setShowPassword] = useState(false);
    const isError = meta.touched && meta.error;

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={cn('flex flex-col gap-1 w-full', className)}>
            {label && (
                <label htmlFor={props.id || props.name} className="block text-sm font-medium leading-6 text-gray-900">
                    {label}
                </label>
            )}
            <div className="relative group">
                <input
                    {...field}
                    {...props}
                    type={inputType}
                    className={cn(
                        'block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all',
                        isError && 'ring-red-500 focus:ring-red-500',
                        props.disabled && 'bg-gray-50 text-gray-400 cursor-not-allowed',
                        isPassword && 'pr-10'
                    )}
                />
                {isPassword && !props.disabled && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                )}
            </div>
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

export default Input;
