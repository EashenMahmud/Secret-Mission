import React from 'react';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useGetApiWithIdQuery } from '../../store/api/commonApi';
import { Calendar, Building2, TrendingUp, User, Clock, Archive } from 'lucide-react';
import DateTime from '../../components/ui/DateTime';

const ProjectDetailModal = ({ isOpen, onClose, projectId }) => {
    const { data: response, isLoading } = useGetApiWithIdQuery(
        { url: '/projects', id: projectId },
        { skip: !isOpen || !projectId }
    );

    const project = response?.data;

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'error';
            case 'medium':
                return 'warning';
            case 'low':
                return 'success';
            default:
                return 'gray';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'success';
            case 'in_progress':
                return 'info';
            case 'pending':
                return 'warning';
            case 'on_hold':
                return 'error';
            default:
                return 'gray';
        }
    };

    if (isLoading) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Project Details" size="lg">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                    <div className="h-20 bg-slate-700 rounded"></div>
                </div>
            </Modal>
        );
    }

    if (!project) {
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Project Details" size="lg">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{project.name}</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getStatusColor(project.status)}>
                            {project.status?.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getPriorityColor(project.priority)}>
                            {project.priority} Priority
                        </Badge>
                        {project.is_archived && (
                            <Badge variant="gray">
                                <Archive className="w-3 h-3 mr-1 inline" />
                                Archived
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Description */}
                {project.description && (
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{project.description}</p>
                    </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Vendor */}
                    {project.vendor_id && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <Building2 className="w-5 h-5 text-slate-500 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Vendor</p>
                                <p className="text-sm font-medium text-slate-900">Vendor ID: {project.vendor_id}</p>
                            </div>
                        </div>
                    )}

                    {/* Project Type */}
                    {project.project_type_id && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-slate-500 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Project Type</p>
                                <p className="text-sm font-medium text-slate-900">Type ID: {project.project_type_id}</p>
                            </div>
                        </div>
                    )}

                    {/* Start Date */}
                    {project.start_date && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Start Date</p>
                                <DateTime date={project.start_date} variant="dateOnly" className="text-sm font-medium text-slate-900" />
                            </div>
                        </div>
                    )}

                    {/* End Date */}
                    {project.end_date && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-500 mb-1">End Date</p>
                                <DateTime date={project.end_date} variant="dateOnly" className="text-sm font-medium text-slate-900" />
                            </div>
                        </div>
                    )}

                    {/* On Hold Date */}
                    {project.onhold_postponed_date && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <Clock className="w-5 h-5 text-slate-500 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-500 mb-1">On Hold/Postponed Date</p>
                                <DateTime date={project.onhold_postponed_date} variant="dateOnly" className="text-sm font-medium text-slate-900" />
                            </div>
                        </div>
                    )}

                    {/* Created By */}
                    {project.created_by && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <User className="w-5 h-5 text-slate-500 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Created By</p>
                                <p className="text-sm font-medium text-slate-900">User ID: {project.created_by}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Progress */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-slate-700">Progress</h3>
                        <span className="text-sm font-medium text-slate-900">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress || 0}%` }}
                        ></div>
                    </div>
                </div>

                {/* Timestamps */}
                <div className="pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
                        <div>
                            <span className="font-medium">Created:</span>{' '}
                            <DateTime date={project.created_at} variant="full" />
                        </div>
                        <div>
                            <span className="font-medium">Updated:</span>{' '}
                            <DateTime date={project.updated_at} variant="full" />
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ProjectDetailModal;
