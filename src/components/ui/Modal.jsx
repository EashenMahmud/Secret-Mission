import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    className,
    contentClassName,
    showCloseButton = true
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[95vw]'
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className={cn(
                'relative w-full mx-auto bg-white rounded-xl shadow-2xl flex flex-col max-h-full transition-all duration-200 transform scale-100 opacity-100',
                sizes[size],
                className
            )}>
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                                aria-label="Close modal"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className={cn('flex-1 overflow-y-auto p-6 text-gray-700', contentClassName)}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
