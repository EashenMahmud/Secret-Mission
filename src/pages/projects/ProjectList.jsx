import { useState } from 'react';
import { useGetApiQuery, useDeleteApiMutation } from '../../store/api/commonApi';
import { Link, useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, Building2, Calendar, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';
import ProjectFormModal from './ProjectFormModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-toastify';
import DateTime from '../../components/ui/DateTime';





const ProjectList = () => {
    const navigate = useNavigate();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [page, setPage] = useState(1);

    // Fetch projects from API
    const { data: response, isLoading, refetch } = useGetApiQuery({
        url: '/projects',
        params: { page }
    });

    const [deleteProject, { isLoading: isDeleting }] = useDeleteApiMutation();

    const projects = response?.data?.data || [];
    const paginationData = response?.data || {};



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

    const handleView = (e, projectId) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/projects/${projectId}`);
    };

    const handleEdit = (e, projectId) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedProjectId(projectId);
        setFormMode('edit');
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (e, project) => {
        e.preventDefault();
        e.stopPropagation();
        setProjectToDelete(project);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteProject({ 
                end_point: `/projects/${projectToDelete.id}` 
            }).unwrap();
            toast.success('Project deleted successfully');
            setIsDeleteModalOpen(false);
            setProjectToDelete(null);
            refetch();
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to delete project');
        }
    };


    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
                    <p className="text-slate-400">Manage your projects and track progress</p>
                </div>
                <button 
                    className="btn-primary flex items-center gap-2"
                    onClick={() => {
                        setFormMode('create');
                        setSelectedProjectId(null);
                        setIsFormModalOpen(true);
                    }}
                >
                    <Plus className="w-5 h-5" />
                    New Project
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card animate-pulse">
                            <div className="h-32 bg-slate-700 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <div className="card text-center py-12">
                    <FolderKanban className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
                    <p className="text-slate-400 mb-4">Get started by creating your first project</p>
                    <button 
                        className="btn-primary inline-flex items-center gap-2"
                        onClick={() => {
                            setFormMode('create');
                            setSelectedProjectId(null);
                            setIsFormModalOpen(true);
                        }}
                    >
                        <Plus className="w-5 h-5" />
                        Create Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            to={`/projects/${project.id}`}
                            className="card card-hover group relative"
                        >
                            {/* Action Buttons - Always Visible */}
                            <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
                                <button
                                    onClick={(e) => handleView(e, project.id)}
                                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg"
                                    title="View Details"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => handleEdit(e, project.id)}
                                    className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors shadow-lg"
                                    title="Edit Project"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteClick(e, project)}
                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg"
                                    title="Delete Project"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <FolderKanban className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-white mb-1 truncate">
                                        {project.name}
                                    </h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant={getStatusColor(project.status)}>
                                            {project.status?.replace('_', ' ')}
                                        </Badge>
                                        <Badge variant={getPriorityColor(project.priority)}>
                                            {project.priority}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                                {project.description || 'No description provided'}
                            </p>

                            <div className="space-y-3">
                                {/* Vendor Info */}
                                {project.vendor && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building2 className="w-4 h-4 text-slate-500" />
                                        <span className="text-slate-400 truncate">
                                            {project.vendor.name}
                                        </span>
                                    </div>
                                )}

                                {/* Project Type */}
                                {project.project_type && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <TrendingUp className="w-4 h-4 text-slate-500" />
                                        <span className="text-slate-400 truncate">
                                            {project.project_type.name}
                                        </span>
                                    </div>
                                )}

                                {/* Dates */}
                                {project.start_date && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-slate-500" />
                                        <span className="text-slate-400">
                                            <DateTime date={project.start_date} variant="dateOnly" className="text-slate-400" />
                                            {project.end_date && (
                                                <> - <DateTime date={project.end_date} variant="dateOnly" className="text-slate-400" /></>
                                            )}
                                        </span>
                                    </div>
                                )}

                                {/* Progress */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Progress</span>
                                        <span className="text-slate-300 font-medium">
                                            {project.progress || 0}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${project.progress || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {paginationData.last_page > 1 && (
                <div className="flex justify-center gap-2">
                    <button
                        className="btn-secondary"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </button>
                    <span className="flex items-center px-4 text-slate-400">
                        Page {page} of {paginationData.last_page}
                    </span>
                    <button
                        className="btn-secondary"
                        onClick={() => setPage(p => Math.min(paginationData.last_page, p + 1))}
                        disabled={page === paginationData.last_page}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Project Form Modal (Create/Edit) */}
            <ProjectFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                projectId={selectedProjectId}
                mode={formMode}
                onSuccess={refetch}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Project"
                message={`Are you sure you want to delete "${projectToDelete?.name}"? This action cannot be undone.`}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default ProjectList;

