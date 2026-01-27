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
    Loader2,
    FolderKanban,
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ProjectFormModal from './ProjectFormModal';
import ProjectPlanningSection from './planning/ProjectPlanningSection';
import ProjectManpowerSection from './planning/ProjectManpowerSection';
import DateTime from '../../components/ui/DateTime';

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { data: response, isLoading, refetch } = useGetApiWithIdQuery({
        url: '/projects',
        id: id,
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
            {/* Top bar */}
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

            {/* Intro: project dashboard header */}
            <div className="card overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/20">
                                <FolderKanban className="h-6 w-6 text-primary-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white truncate">{project.name}</h1>
                                <div className="flex items-center gap-2 flex-wrap mt-1">
                                    <Badge variant={getStatusColor(project.status)}>
                                        {project.status?.replace('_', ' ')}
                                    </Badge>
                                    <Badge variant={getPriorityColor(project.priority)}>
                                        {project.priority}
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
                        {project.description && (
                            <p className="text-slate-300 text-sm leading-relaxed mt-2 line-clamp-2">
                                {project.description}
                            </p>
                        )}
                    </div>
                    <div className="flex-shrink-0 md:w-48">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-medium text-slate-400">Progress</span>
                            <span className="text-lg font-bold text-white">{project.progress ?? 0}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-primary-500 to-primary-400 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${project.progress ?? 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Meta row: vendor, type, dates, created */}
                <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    {project.vendor && (
                        <div className="flex items-center gap-2 text-slate-400">
                            <Building2 className="h-4 w-4 flex-shrink-0 text-slate-500" />
                            <span className="truncate" title={project.vendor.name}>{project.vendor.name}</span>
                        </div>
                    )}
                    {project.project_type && (
                        <div className="flex items-center gap-2 text-slate-400">
                            <TrendingUp className="h-4 w-4 flex-shrink-0 text-slate-500" />
                            <span className="truncate">{project.project_type.name}</span>
                        </div>
                    )}
                    {(project.start_date || project.end_date) && (
                        <div className="flex items-center gap-2 text-slate-400">
                            <Calendar className="h-4 w-4 flex-shrink-0 text-slate-500" />
                            <span className="truncate">
                                {project.start_date && <DateTime date={project.start_date} variant="dateOnly" />}
                                {project.start_date && project.end_date && ' – '}
                                {project.end_date && <DateTime date={project.end_date} variant="dateOnly" />}
                            </span>
                        </div>
                    )}
                    {project.created_by && (
                        <div className="flex items-center gap-2 text-slate-400">
                            <User className="h-4 w-4 flex-shrink-0 text-slate-500" />
                            <span className="truncate">
                                {project.created_by.name || project.created_by.email || `User #${project.created_by.id ?? project.created_by}`}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Planning phase: Gantt + list + add/edit/delete */}
            <div className="card">
                <ProjectPlanningSection
                    projectId={id}
                    projectStart={project.start_date}
                    projectEnd={project.end_date}
                    onRefresh={refetch}
                />
            </div>

            {/* Manpower: add/remove users */}
            <div className="card">
                <ProjectManpowerSection projectId={id} onRefresh={refetch} />
            </div>

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
