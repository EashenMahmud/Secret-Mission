import { useState } from 'react';
import { useGetApiQuery, useGetApiWithIdQuery, usePostApiMutation, useDeleteApiMutation } from '../../../store/api/commonApi';
import { Calendar, Plus, Edit, Trash2, GanttChart } from 'lucide-react';
import Button from '../../../components/ui/Button';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import ProjectGantt from './ProjectGantt';
import ProjectPlanningFormModal from './ProjectPlanningFormModal';
import DateTime from '../../../components/ui/DateTime';
import { toast } from 'react-toastify';

const ProjectPlanningSection = ({ projectId, projectStart, projectEnd, onRefresh }) => {
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);

    // Planning types – no pagination, fetch all
    const { data: typesRes } = useGetApiQuery(
        { url: '/planning-type-list' },
        { skip: !projectId }
    );
    const { data: planningRes, refetch } = useGetApiWithIdQuery(
        { url: '/project-planning-list', id: projectId },
        { skip: !projectId }
    );
    const [deletePlanning, { isLoading: isDeleting }] = useDeleteApiMutation();

    const planningTypes = typesRes?.data?.data ?? typesRes?.data ?? [];
    const planningList = planningRes?.data?.data ?? planningRes?.data ?? [];

    const handleDelete = async () => {
        if (!deleteItem) return;
        try {
            await deletePlanning({ end_point: `/delete-project-planning/${deleteItem.id}` }).unwrap();
            toast.success('Planning item removed');
            setDeleteItem(null);
            refetch();
            onRefresh?.();
        } catch (e) {
            toast.error(e?.data?.message || 'Failed to delete');
        }
    };

    const handleModalSuccess = () => {
        refetch();
        onRefresh?.();
    };

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                    <GanttChart className="h-5 w-5 text-primary-400" />
                    Planning phase
                </h2>
                <Button
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => {
                        setEditItem(null);
                        setAddModalOpen(true);
                    }}
                >
                    Add planning
                </Button>
            </div>

            <ProjectGantt
                items={planningList}
                projectStart={projectStart}
                projectEnd={projectEnd}
                className="mb-4"
            />

            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 overflow-hidden">
                <div className="border-b border-slate-700/50 bg-slate-800/30 px-4 py-3 text-sm font-medium text-slate-300">
                    Planning items
                </div>
                {!planningList.length ? (
                    <div className="p-8 text-center text-slate-400">
                        No planning items yet. Add one to define phases or milestones.
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-800/50">
                        {planningList.map((item) => (
                            <li key={item.id} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-800/30">
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-white truncate">{item.description || item.title || item.name || 'Untitled'}</p>
                                    <p className="text-xs text-slate-400">
                                        {item.start_date && <DateTime date={item.start_date} variant="dateOnly" />}
                                        {item.start_date && item.end_date && ' → '}
                                        {item.end_date && <DateTime date={item.end_date} variant="dateOnly" />}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditItem(item);
                                            setAddModalOpen(true);
                                        }}
                                        className="p-2 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
                                        title="Edit"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteItem(item)}
                                        className="p-2 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                        title="Remove"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <ProjectPlanningFormModal
                isOpen={addModalOpen}
                onClose={() => {
                    setAddModalOpen(false);
                    setEditItem(null);
                }}
                projectId={projectId}
                planningTypes={planningTypes}
                editItem={editItem}
                onSuccess={handleModalSuccess}
            />

            <ConfirmationModal
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={handleDelete}
                title="Remove planning item"
                message={`Remove "${deleteItem?.description || deleteItem?.title || deleteItem?.name || 'this item'}"?`}
                isLoading={isDeleting}
            />
        </section>
    );
};

export default ProjectPlanningSection;
