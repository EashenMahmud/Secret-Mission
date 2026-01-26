import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetApiWithIdQuery } from '../../store/api/commonApi';
import { 
    ArrowLeft, 
    Edit, 
    Calendar, 
    Building2, 
    TrendingUp, 
    User, 
    Clock, 
    Archive,
    Loader2
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ProjectFormModal from './ProjectFormModal';
import { format } from 'date-fns';

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { data: response, isLoading, refetch } = useGetApiWithIdQuery({
        url: '/projects',
        id: id
    });

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
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Loading project details...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="card text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-2">Project not found</h2>
                <p className="text-slate-400 mb-6">The project you're looking for doesn't exist.</p>
                <Button onClick={() => navigate('/projects')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Projects
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/projects')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Projects
                </button>
                <Button
                    onClick={() => setIsEditModalOpen(true)}
                    leftIcon={<Edit className="w-4 h-4" />}
                >
                    Edit Project
                </Button>
            </div>

            {/* Project Header Card */}
            <div className="card">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white mb-3">{project.name}</h1>
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
                </div>

                {/* Description */}
                {project.description && (
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-slate-400 mb-2">Description</h3>
                        <p className="text-slate-300 leading-relaxed">{project.description}</p>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-slate-400">Progress</h3>
                        <span className="text-lg font-bold text-white">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-4 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress || 0}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Vendor */}
                {project.vendor && (
                    <div className="card">
                        <div className="flex items-start gap-3">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Building2 className="w-6 h-6 text-blue-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-500 mb-1">Vendor</p>
                                <p className="text-lg font-semibold text-white">{project.vendor.name}</p>
                                {project.vendor.company_name && (
                                    <p className="text-sm text-slate-400">{project.vendor.company_name}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Project Type */}
                {project.project_type && (
                    <div className="card">
                        <div className="flex items-start gap-3">
                            <div className="p-3 bg-purple-500/10 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-purple-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-500 mb-1">Project Type</p>
                                <p className="text-lg font-semibold text-white">{project.project_type.name}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Created By */}
                {project.created_by && (
                    <div className="card">
                        <div className="flex items-start gap-3">
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <User className="w-6 h-6 text-green-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-500 mb-1">Created By</p>
                                <p className="text-lg font-semibold text-white">
                                    {project.created_by.name || `User #${project.created_by}`}
                                </p>
                                {project.created_by.email && (
                                    <p className="text-sm text-slate-400">{project.created_by.email}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Dates Card */}
            <div className="card">
                <h2 className="text-xl font-semibold text-white mb-4">Timeline</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Start Date */}
                    {project.start_date && (
                        <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg">
                            <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Start Date</p>
                                <p className="text-sm font-medium text-white">
                                    {format(new Date(project.start_date), 'MMMM dd, yyyy')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* End Date */}
                    {project.end_date && (
                        <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg">
                            <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-500 mb-1">End Date</p>
                                <p className="text-sm font-medium text-white">
                                    {format(new Date(project.end_date), 'MMMM dd, yyyy')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* On Hold/Postponed Date */}
                    {project.onhold_postponed_date && (
                        <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg">
                            <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-500 mb-1">On Hold/Postponed</p>
                                <p className="text-sm font-medium text-white">
                                    {format(new Date(project.onhold_postponed_date), 'MMMM dd, yyyy')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Metadata Card */}
            <div className="card">
                <h2 className="text-xl font-semibold text-white mb-4">Metadata</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-slate-500">Created:</span>{' '}
                        <span className="text-slate-300">
                            {project.created_at && format(new Date(project.created_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500">Last Updated:</span>{' '}
                        <span className="text-slate-300">
                            {project.updated_at && format(new Date(project.updated_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500">Project ID:</span>{' '}
                        <span className="text-slate-300">{project.id}</span>
                    </div>
                    <div>
                        <span className="text-slate-500">Status:</span>{' '}
                        <span className="text-slate-300 capitalize">{project.is_archived ? 'Archived' : 'Active'}</span>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <ProjectFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                projectId={id}
                mode="edit"
                onSuccess={refetch}
            />
        </div>
    );
};

export default ProjectDetail;

