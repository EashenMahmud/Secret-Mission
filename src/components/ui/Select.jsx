import React from 'react';
import ReactSelect from 'react-select';
import { useField } from 'formik';
import { cn } from '../../lib/utils';

const Select = ({ label, labelClassName, options = [], helperText, className, placeholder, required, menuPortalTarget, ...props }) => {
    const [field, meta, helpers] = useField(props);
    const isError = meta.touched && meta.error;

    const customStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: 'var(--bg-card)',
            borderColor: state.isFocused ? 'var(--primary-color, #4f46e5)' : isError ? '#ef4444' : 'var(--border-main)',
            boxShadow: state.isFocused ? '0 0 0 1px var(--primary-color, #4f46e5)' : 'none',
            borderRadius: '0.375rem',
            padding: '1px',
            fontSize: '0.875rem',
            minHeight: '38px',
            transition: 'all 0.2s ease',
            '&:hover': {
                borderColor: state.isFocused ? 'var(--primary-color, #4f46e5)' : 'var(--border-main)',
            },
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: 'var(--bg-card)',
            zIndex: 9999,
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid var(--border-main)',
            overflow: 'hidden',
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? 'var(--primary-color, #4f46e5)' : state.isFocused ? 'var(--bg-app)' : 'var(--bg-card)',
            color: state.isSelected ? 'white' : 'var(--text-main)',
            '&:active': {
                backgroundColor: 'var(--primary-color, #4f46e5)',
            },
        }),
        placeholder: (base) => ({
            ...base,
            color: 'var(--text-muted)',
        }),
        singleValue: (base) => ({
            ...base,
            color: 'var(--text-main)',
        }),
    };

    const handleChange = (selectedOption) => {
        helpers.setValue(selectedOption ? selectedOption.value : '');
    };

    const currentValue = options.find(option => option.value === field.value) || null;

    return (
        <div className={cn('flex flex-col gap-1 w-full', className)}>
            {label && (
                <label
                    htmlFor={props.id || props.name}
                    className={cn("block text-sm font-medium leading-6 text-[var(--text-main)]", labelClassName)}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
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
                    menuPortalTarget={menuPortalTarget}
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
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{helperText}</p>
                )
            }
        </div >
    );
};

export default Select;
