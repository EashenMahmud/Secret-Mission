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
import ProjectGanttCustom from './planning/ProjectGanttCustom';
import ProjectModuleKanban from './modules/ProjectModuleKanban';
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
                    <p className="text-[var(--text-muted)]">Loading project details...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="card text-center py-12">
                <h2 className="text-2xl font-bold text-[var(--text-main)] mb-2">Project not found</h2>
                <p className="text-[var(--text-muted)] mb-6">The project you're looking for doesn't exist.</p>
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
                    className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
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

            {/* Top: Project details + Manpower (50/50) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project details - compact with fixed height */}
                <div className="card overflow-hidden flex flex-col h-[240px]">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/20">
                            <FolderKanban className="h-5 w-5 text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-[var(--text-main)] truncate mb-1.5">{project.name}</h1>
                            <div className="flex items-center gap-2 flex-wrap mb-2">
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
                            {project.description && (
                                <p className="text-[var(--text-muted)] text-xs leading-relaxed line-clamp-2 mb-3">
                                    {project.description}
                                </p>
                            )}
                        </div>
                        <div className="flex-shrink-0 w-32">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-[var(--text-muted)]">Progress</span>
                                <span className="text-sm font-bold text-[var(--text-main)]">{project.progress ?? 0}%</span>
                            </div>
                            <div className="w-full bg-[var(--bg-app)] rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${project.progress ?? 0}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Meta row: vendor, type, dates, created - compact */}
                    <div className="mt-auto pt-3 border-t border-[var(--border-main)]/50 grid grid-cols-2 gap-2 text-xs">
                        {project.vendor && (
                            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                                <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                                <span className="truncate" title={project.vendor.name}>{project.vendor.name}</span>
                            </div>
                        )}
                        {project.project_type && (
                            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                                <TrendingUp className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                                <span className="truncate">{project.project_type.name}</span>
                            </div>
                        )}
                        {(project.start_date || project.end_date) && (
                            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                                <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                                <span className="truncate">
                                    {project.start_date && <DateTime date={project.start_date} variant="dateOnly" />}
                                    {project.start_date && project.end_date && ' – '}
                                    {project.end_date && <DateTime date={project.end_date} variant="dateOnly" />}
                                </span>
                            </div>
                        )}
                        {project.created_by && (
                            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                                <User className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                                <span className="truncate">
                                    {project.created_by.name || project.created_by.email || `User #${project.created_by.id ?? project.created_by}`}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Manpower - fixed height */}
                <div className="card overflow-hidden flex flex-col h-[240px]">
                    <ProjectManpowerSection projectId={id} onRefresh={refetch} compact />
                </div>
            </div>

            {/* Planning + Gantt (20/80): sidebar list + timeline */}
            <div className="card overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                    {/* Planning sidebar (20%) */}
                    <div className="min-w-0 lg:col-span-1 lg:border-r border-[var(--border-main)] lg:pr-6">
                        <ProjectPlanningSection
                            projectId={id}
                            projectStart={project.start_date}
                            projectEnd={project.end_date}
                            onRefresh={refetch}
                            showGantt={false}
                            compact
                            scrollHeightClass="h-[420px]"
                        />
                    </div>

                    {/* Gantt (80%) */}
                    <div className="min-w-0 pt-6 lg:pt-0 lg:pl-6 lg:col-span-4">
                        <ProjectGanttCustom
                            projectId={id}
                            projectStart={project.start_date}
                            projectEnd={project.end_date}
                            minHeight={420}
                        />
                    </div>
                </div>
            </div>

            {/* Project Modules Kanban Board */}
            <ProjectModuleKanban projectId={id} onRefresh={refetch} />

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
