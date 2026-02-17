import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetApiWithIdQuery, useGetApiQuery, useDeleteApiMutation } from '../../store/api/commonApi';
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
import ProjectPlanningFormModal from './planning/ProjectPlanningFormModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import ProjectManpowerSection from './planning/ProjectManpowerSection';
import ProjectGanttCustom from './planning/ProjectGanttCustom';
import ProjectModuleKanban from './modules/ProjectModuleKanban';
import DateTime from '../../components/ui/DateTime';
import ProgressBar from '../../components/ui/ProgressBar';
import { toast } from 'react-toastify';

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Planning state
    const [addPlanningModalOpen, setAddPlanningModalOpen] = useState(false);
    const [editPlanningItem, setEditPlanningItem] = useState(null);
    const [deletePlanningItem, setDeletePlanningItem] = useState(null);
    const [deletePlanning, { isLoading: isDeletingPlanning }] = useDeleteApiMutation();

    const { data: response, isLoading, refetch } = useGetApiWithIdQuery({
        url: '/projects',
        id: id,
    });

    const { data: planningRes, refetch: refetchPlanning } = useGetApiWithIdQuery(
        { url: '/project-planning-list', id: id },
        { skip: !id }
    );

    // Planning types for the modal
    const { data: planningTypesRes } = useGetApiQuery(
        { url: '/planning-type-list' },
        { skip: !id }
    );

    const planningList = planningRes?.data?.data ?? planningRes?.data ?? [];
    const planningTypes = planningTypesRes?.data?.data ?? planningTypesRes?.data ?? [];

    const handlePlanningDelete = async () => {
        if (!deletePlanningItem) return;
        try {
            await deletePlanning({ end_point: `/delete-project-planning/${deletePlanningItem.id}` }).unwrap();
            toast.success('Planning item removed');
            setDeletePlanningItem(null);
            refetchPlanning();
        } catch (e) {
            toast.error(e?.data?.message || 'Failed to delete');
        }
    };

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

            {/* Unified Project Hero Card */}
            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                    {/* Left: Info & Manpower */}
                    <div className="flex items-start gap-3 flex-1 min-w-0 h-full">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/20 shadow-inner">
                            <FolderKanban className="h-5 w-5 text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                            <div className="space-y-1.5">
                                <div>
                                    <h1 className="text-lg font-bold text-[var(--text-main)] truncate leading-tight">{project.name}</h1>
                                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-muted)] mt-0.5">
                                        {project.created_by && (
                                            <span>Created by {project.created_by.name || project.created_by.email}</span>
                                        )}
                                        {project.vendor && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]/50"></span>
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" /> {project.vendor.name}
                                                </span>
                                            </>
                                        )}
                                        {project.project_type && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]/50"></span>
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3" /> {project.project_type.name}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                                    <Badge variant={getStatusColor(project.status)} className="px-2 py-0.5 text-[10px] uppercase tracking-wide">
                                        {project.status?.replace('_', ' ')}
                                    </Badge>
                                    <Badge variant={getPriorityColor(project.priority)} className="px-2 py-0.5 text-[10px] uppercase tracking-wide">
                                        {project.priority}
                                    </Badge>
                                    {project.is_archived && (
                                        <Badge variant="gray" className="px-2 py-0.5 text-[10px]">
                                            <Archive className="w-3 h-3 mr-1 inline" />
                                            Archived
                                        </Badge>
                                    )}
                                </div>

                                {project.description && (
                                    <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-2xl pt-1">
                                        {project.description}
                                    </p>
                                )}
                            </div>

                            {/* Integrated Manpower Section - Moved Here */}
                            <div className="pt-1">
                                <ProjectManpowerSection projectId={id} onRefresh={refetch} />
                            </div>
                        </div>
                    </div>

                    {/* Right: Progress & Stats - Compact */}
                    <div className="w-full md:w-80 bg-[var(--bg-app)]/50 rounded-lg p-3 border border-[var(--border-main)] flex flex-col justify-center flex-shrink-0">
                        <div className="flex justify-between items-end mb-1.5">
                            <span className="text-xs font-medium text-[var(--text-muted)]">Completion</span>
                            <span className="text-lg font-bold text-[var(--text-main)]">{project.progress ?? 0}%</span>
                        </div>
                        <ProgressBar
                            value={project.progress ?? 0}
                            variant={getStatusColor(project.status)}
                            className="h-2"
                        />
                        <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-2 text-[11px] text-[var(--text-muted)]">
                            {project.start_date && (
                                <div className="flex flex-col">
                                    <span className="leading-none opacity-80">Start Date</span>
                                    <span className="font-medium text-[var(--text-main)] mt-0.5">
                                        <DateTime date={project.start_date} variant="dateOnly" />
                                    </span>
                                </div>
                            )}
                            {project.end_date && (
                                <div className="flex flex-col text-right">
                                    <span className="leading-none opacity-80">Due Date</span>
                                    <span className="font-medium text-[var(--text-main)] mt-0.5">
                                        <DateTime date={project.end_date} variant="dateOnly" />
                                    </span>
                                </div>
                            )}
                            {project.start_date && project.end_date && (
                                <div className="flex flex-col border-t border-[var(--border-main)]/50 pt-1.5 col-span-1">
                                    <span className="leading-none opacity-80 flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> Duration</span>
                                    <span className="font-medium text-[var(--text-main)] mt-0.5">
                                        {Math.ceil((new Date(project.end_date) - new Date(project.start_date)) / (1000 * 60 * 60 * 24))} days
                                    </span>
                                </div>
                            )}
                            <div className="flex flex-col border-t border-[var(--border-main)]/50 pt-1.5 col-span-1 text-right">
                                <span className="leading-none opacity-80 flex items-center gap-1 justify-end"><Clock className="w-2.5 h-2.5" /> Updated</span>
                                <span className="font-medium text-[var(--text-main)] mt-0.5">
                                    <DateTime date={project.created_at} variant="dateOnly" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Planning + Gantt (Full Width) */}
            <div className="card overflow-hidden">
                <ProjectGanttCustom
                    projectId={id}
                    items={planningList}
                    projectStart={project.start_date}
                    projectEnd={project.end_date}
                    minHeight={500}
                    onAdd={() => {
                        setEditPlanningItem(null);
                        setAddPlanningModalOpen(true);
                    }}
                    onEdit={(item) => {
                        setEditPlanningItem(item);
                        setAddPlanningModalOpen(true);
                    }}
                    onDelete={(item) => setDeletePlanningItem(item)}
                />
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

            <ProjectPlanningFormModal
                isOpen={addPlanningModalOpen}
                onClose={() => {
                    setAddPlanningModalOpen(false);
                    setEditPlanningItem(null);
                }}
                projectId={id}
                planningTypes={planningTypes}
                editItem={editPlanningItem}
                onSuccess={() => {
                    refetchPlanning();
                    refetch(); // Update project progress if needed
                }}
            />

            <ConfirmationModal
                isOpen={!!deletePlanningItem}
                onClose={() => setDeletePlanningItem(null)}
                onConfirm={handlePlanningDelete}
                title="Remove planning item"
                message={`Remove "${deletePlanningItem?.description || deletePlanningItem?.title || deletePlanningItem?.name || 'this item'}"?`}
                isLoading={isDeletingPlanning}
            />
        </div>
    );
};

export default ProjectDetail;
