import React from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Calendar, FileText, Settings } from 'lucide-react';

const PlanningTypeDetailsModal = ({ isOpen, onClose, planningType }) => {
    if (!planningType) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Planning Type Details"
            size="lg"
        >
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex items-center gap-4 p-4 bg-[var(--bg-app)] rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Settings className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold text-[var(--text-main)]">{planningType.name}</h3>
                        <p className="text-[var(--text-muted)]">{planningType.slug}</p>
                        <div className="mt-2">
                            <Badge variant={planningType.is_active ? 'success' : 'error'}>
                                {planningType.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {/* Description */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-[var(--text-main)] border-b border-[var(--border-main)] pb-2">Description</h4>
                        <div className="flex items-start gap-3">
                            <FileText className="h-4 w-4 text-[var(--text-muted)] mt-1" />
                            <div>
                                <p className="text-[var(--text-main)]">{planningType.description || 'No description provided'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-[var(--text-main)] border-b border-[var(--border-main)] pb-2">Timeline Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {planningType.created_at && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
                                    <span className="text-[var(--text-muted)]">Created:</span>
                                    <span className="font-medium text-[var(--text-main)]">
                                        {new Date(planningType.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            {planningType.updated_at && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
                                    <span className="text-[var(--text-muted)]">Updated:</span>
                                    <span className="font-medium text-[var(--text-main)]">
                                        {new Date(planningType.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-[var(--text-main)] border-b border-[var(--border-main)] pb-2">Additional Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-[var(--text-muted)]">ID:</span>
                                <span className="font-medium text-[var(--text-main)] ml-2">{planningType.id}</span>
                            </div>
                            <div>
                                <span className="text-[var(--text-muted)]">Slug:</span>
                                <span className="font-medium text-[var(--text-main)] ml-2">{planningType.slug}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-main)] mt-6">
                <Button variant="primary" onClick={onClose}>
                    Close
                </Button>
            </div>
        </Modal>
    );
};

export default PlanningTypeDetailsModal;