import { useState, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { useGetApiWithIdQuery, usePostApiMutation, useDeleteApiMutation } from '../../../store/api/commonApi';
import { toast } from 'react-toastify';
import Button from '../../../components/ui/Button';
import ProjectModuleFormModal from './ProjectModuleFormModal';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import Badge from '../../../components/ui/Badge';

const STATUS_COLUMNS = [
    { id: 'pending', label: 'Pending', color: 'warning' },
    { id: 'in_progress', label: 'In Progress', color: 'info' },
    { id: 'completed', label: 'Completed', color: 'success' },
    { id: 'on_hold', label: 'On Hold', color: 'error' },
];

const ModuleCard = ({ module, onEdit, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: module.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg p-3 mb-2.5 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group touch-none"
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[var(--text-main)] mb-1 truncate">{module.name}</h4>
                    {module.description && (
                        <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-2">{module.description}</p>
                    )}
                </div>
                <div
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                    <GripVertical className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
            </div>

            <div className="flex items-center justify-between mb-3">
                {module.estimated_days && (
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <Clock className="w-3 h-3" />
                        <span>{module.estimated_days} {module.estimated_days === 1 ? 'day' : 'days'}</span>
                    </div>
                )}
                {module.status && (
                    <Badge variant={STATUS_COLUMNS.find(col => col.id === module.status)?.color || 'gray'}>
                        {STATUS_COLUMNS.find(col => col.id === module.status)?.label || module.status}
                    </Badge>
                )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-main)]">
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent drag start
                        onEdit(module);
                    }}
                    onPointerDown={(e) => e.stopPropagation()} // Extra safety for dnd-kit
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-[var(--text-muted)] hover:text-primary-500 hover:bg-primary-500/10 rounded transition-colors"
                >
                    <Edit2 className="w-3 h-3" />
                    Edit
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent drag start
                        onDelete(module);
                    }}
                    onPointerDown={(e) => e.stopPropagation()} // Extra safety for dnd-kit
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                >
                    <Trash2 className="w-3 h-3" />
                    Delete
                </button>
            </div>
        </div>
    );
};

const KanbanColumn = ({ column, modules, onEdit, onDelete }) => {
    const moduleIds = modules.map(m => String(m.id));
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    });

    return (
        <div className="flex-1 min-w-[280px] flex flex-col h-full">
            {/* Column Header - Fixed */}
            <div className="mb-3 px-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[var(--text-main)] text-sm">{column.label}</h3>
                    <Badge variant="gray" className="text-xs">
                        {modules.length}
                    </Badge>
                </div>
            </div>
            
            {/* Column Content - Scrollable if needed */}
            <div
                ref={setNodeRef}
                className={`overflow-y-auto custom-scrollbar-thin bg-[var(--bg-app)]/50 rounded-lg p-3 border-2 transition-colors ${
                    isOver
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-[var(--border-main)]/50'
                }`}
                style={{ 
                    maxHeight: 'calc(800px - 3rem)', // Constraint based on max board height
                    minHeight: '260px', // Approx 2 cards
                    height: 'auto' 
                }}
            >
                <SortableContext items={moduleIds} strategy={verticalListSortingStrategy}>
                    {modules.length === 0 ? (
                        <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                            <div className="text-[var(--text-muted)]/50 mb-2">Drop modules here</div>
                        </div>
                    ) : (
                        modules.map((module) => (
                            <ModuleCard
                                key={module.id}
                                module={module}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))
                    )}
                </SortableContext>
            </div>
        </div>
    );
};

const ProjectModuleKanban = ({ projectId, onRefresh }) => {
    const [activeId, setActiveId] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);

    const { data: modulesResponse, isLoading, refetch } = useGetApiWithIdQuery(
        { url: '/project-module-list', id: projectId },
        { skip: !projectId }
    );

    const [updateModule] = usePostApiMutation();
    const [deleteModule] = useDeleteApiMutation();

    const modules = modulesResponse?.data?.data || modulesResponse?.data || [];

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent drag on simple clicks
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Group modules by status
    const modulesByStatus = useMemo(() => {
        const grouped = {};
        STATUS_COLUMNS.forEach(col => {
            grouped[col.id] = modules.filter(m => m.status === col.id);
        });
        return grouped;
    }, [modules]);

    const restrictToBoard = ({ transform, draggingNodeRect, windowRect }) => {
        const boardElement = document.getElementById('kanban-board');
        if (!boardElement || !draggingNodeRect) {
            return transform;
        }

        const boardRect = boardElement.getBoundingClientRect();
        
        const value = {
            ...transform,
        };

        // Clamp x
        if (draggingNodeRect.left + transform.x < boardRect.left) {
            value.x = boardRect.left - draggingNodeRect.left;
        } else if (draggingNodeRect.right + transform.x > boardRect.right) {
            value.x = boardRect.right - draggingNodeRect.right;
        }

        // Clamp y
        if (draggingNodeRect.top + transform.y < boardRect.top) {
            value.y = boardRect.top - draggingNodeRect.top;
        } else if (draggingNodeRect.bottom + transform.y > boardRect.bottom) {
            value.y = boardRect.bottom - draggingNodeRect.bottom;
        }

        return value;
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        let newStatus;
        
        // Check if dropped on a column directly
        if (STATUS_COLUMNS.some(col => col.id === overId)) {
            newStatus = overId;
        } else {
            // Dropped on another module - find its status
            const overModule = modules.find(m => String(m.id) === String(overId));
            if (overModule) {
                newStatus = overModule.status;
            } else {
                // Drop on unknown element
                return;
            }
        }

        // Find the active module
        const module = modules.find(m => String(m.id) === String(activeId));
        if (!module || module.status === newStatus) return;

        try {
            // Update module status via POST
            const payload = {
                name: module.name,
                description: module.description || '',
                estimated_days: module.estimated_days || 0,
                status: newStatus,
                is_completed: newStatus === 'completed',
                completed_at: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null,
            };

            await updateModule({
                end_point: `/update-project-module/${module.id}`,
                body: payload,
            }).unwrap();

            toast.success('Module status updated');
            refetch();
            onRefresh?.();
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to update module status');
        }
    };

    const handleAdd = () => {
        setSelectedModule(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (module) => {
        setSelectedModule(module);
        setIsFormModalOpen(true);
    };

    const handleDelete = (module) => {
        setSelectedModule(module);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedModule) return;

        try {
            await deleteModule({
                end_point: `/delete-project-module/${selectedModule.id}`,
            }).unwrap();

            toast.success('Module deleted');
            setIsDeleteModalOpen(false);
            setSelectedModule(null);
            refetch();
            onRefresh?.();
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to delete module');
        }
    };

    const activeModule = activeId ? modules.find(m => String(m.id) === String(activeId)) : null;

    if (isLoading) {
        return (
            <div className="card">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
                        <p className="text-[var(--text-muted)] text-sm">Loading modules...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card overflow-hidden">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-[var(--text-main)] mb-1">Project Modules</h2>
                    <p className="text-sm text-[var(--text-muted)]">Drag and drop to update status</p>
                </div>
                <Button onClick={handleAdd} leftIcon={<Plus className="w-4 h-4" />}>
                    Add Module
                </Button>
            </div>

            {/* Kanban Board - Dynamic Height with Limits */}
            <div 
                id="kanban-board"
                style={{ 
                    maxHeight: '800px', 
                    minHeight: '280px', // Approx for 2 cards + padding
                    height: 'auto',
                    overflow: 'hidden' // Scrolling is handled inside columns
                }}
            >
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToBoard]}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" style={{ height: 'auto' }}>
                        {STATUS_COLUMNS.map((column) => (
                            <div
                                key={column.id}
                                data-status={column.id}
                                className="flex-1 min-w-[280px]"
                                style={{ height: 'auto' }}
                            >
                                <KanbanColumn
                                    column={column}
                                    modules={modulesByStatus[column.id] || []}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </div>
                        ))}
                    </div>

                <DragOverlay>
                    {activeModule ? (
                        <div className="bg-[var(--bg-card)] border border-primary-500 rounded-lg p-4 shadow-lg opacity-95">
                            <h4 className="font-semibold text-[var(--text-main)] mb-1">{activeModule.name}</h4>
                            {activeModule.description && (
                                <p className="text-sm text-[var(--text-muted)] line-clamp-2">{activeModule.description}</p>
                            )}
                        </div>
                    ) : null}
                </DragOverlay>
                </DndContext>
            </div>

            <ProjectModuleFormModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setSelectedModule(null);
                }}
                projectId={projectId}
                module={selectedModule}
                onSuccess={() => {
                    refetch();
                    onRefresh?.();
                }}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedModule(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Module"
                message={`Are you sure you want to delete "${selectedModule?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default ProjectModuleKanban;
