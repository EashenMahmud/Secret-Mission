import React from 'react';
import ReactSelect from 'react-select';
import { useField } from 'formik';
import { cn } from '../../lib/utils';

const Select = ({ label, options = [], helperText, className, placeholder, ...props }) => {
    const [field, meta, helpers] = useField(props);
    const isError = meta.touched && meta.error;

    const customStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: 'white',
            borderColor: state.isFocused ? '#4f46e5' : isError ? '#ef4444' : '#d1d5db',
            boxShadow: state.isFocused ? '0 0 0 1px #4f46e5' : 'none',
            borderRadius: '0.375rem',
            padding: '1px',
            fontSize: '0.875rem',
            minHeight: '38px',
            transition: 'all 0.2s ease',
            '&:hover': {
                borderColor: state.isFocused ? '#4f46e5' : '#9ca3af',
            },
        }),
        menu: (base) => ({
            ...base,
            zIndex: 50,
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px border-slate-200',
            overflow: 'hidden',
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#f5f7ff' : 'white',
            color: state.isSelected ? 'white' : '#1e293b',
            '&:active': {
                backgroundColor: '#4f46e5',
            },
        }),
        placeholder: (base) => ({
            ...base,
            color: '#9ca3af',
        }),
        singleValue: (base) => ({
            ...base,
            color: '#1e293b',
        }),
    };

    const handleChange = (selectedOption) => {
        helpers.setValue(selectedOption ? selectedOption.value : '');
    };

    const currentValue = options.find(option => option.value === field.value) || null;

    return (
        <div className={cn('flex flex-col gap-1 w-full', className)}>
            {label && (
                <label htmlFor={props.id || props.name} className="block text-sm font-medium leading-6 text-slate-700">
                    {label}
                </label>
            )
            }
            <div className="relative">
                <ReactSelect
                    {...props}
                    options={options}
                    value={currentValue}
                    onChange={handleChange}
                    onBlur={() => helpers.setTouched(true)}
                    styles={customStyles}
                    placeholder={placeholder || 'Select...'}
                    isClearable
                    classNamePrefix="react-select"
                />
            </div>
            {
                isError && (
                    <p className="mt-1 text-xs text-red-600" id={`${props.name}-error`}>
                        {meta.error}
                    </p>
                )
            }
            {
                helperText && !isError && (
                    <p className="mt-1 text-xs text-slate-500">{helperText}</p>
                )
            }
        </div >
    );
};

export default Select;
