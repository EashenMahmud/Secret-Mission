import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    isLoading = false
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            showCloseButton={!isLoading}
        >
            <div className="flex flex-col items-center text-center">
                <div className={cn(
                    'p-3 rounded-full mb-4',
                    variant === 'danger' 
                        ? 'bg-red-500/20 text-red-500 dark:bg-red-500/30 dark:text-red-400' 
                        : 'bg-yellow-500/20 text-yellow-500 dark:bg-yellow-500/30 dark:text-yellow-400'
                )}>
                    <AlertTriangle className="h-6 w-6" />
                </div>

                <p className="text-[var(--text-main)] mb-8">{message}</p>

                <div className="flex items-center gap-3 w-full">
                    <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant}
                        className="flex-1"
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
