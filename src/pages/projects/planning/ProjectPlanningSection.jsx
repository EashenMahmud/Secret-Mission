import { useState } from 'react';
import { useGetApiQuery, useGetApiWithIdQuery, usePostApiMutation, useDeleteApiMutation } from '../../../store/api/commonApi';
import { Calendar, Plus, Edit, Trash2, GanttChart } from 'lucide-react';
import Button from '../../../components/ui/Button';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import ProjectGantt from './ProjectGantt';
import ProjectPlanningFormModal from './ProjectPlanningFormModal';
import DateTime from '../../../components/ui/DateTime';
import { toast } from 'react-toastify';

const ProjectPlanningSection = ({ projectId, projectStart, projectEnd, onRefresh, showGantt = true, compact = false }) => {
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
        <section className={compact ? 'space-y-2' : 'space-y-4'}>
            <div className="flex items-center justify-between gap-2">
                <h2 className={`flex items-center gap-2 font-semibold text-white ${compact ? 'text-sm' : 'text-xl'}`}>
                    <GanttChart className={compact ? 'h-4 w-4 text-primary-400' : 'h-5 w-5 text-primary-400'} />
                    Planning
                </h2>
                <Button
                    size={compact ? 'sm' : undefined}
                    leftIcon={<Plus className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
                    onClick={() => {
                        setEditItem(null);
                        setAddModalOpen(true);
                    }}
                    className={compact ? '!px-2.5 !py-1.5 text-xs' : ''}
                >
                    Add
                </Button>
            </div>

            {showGantt && (
                <ProjectGantt
                    items={planningList}
                    projectStart={projectStart}
                    projectEnd={projectEnd}
                    className="mb-4"
                />
            )}

            <div className={`rounded-lg border border-dark-700 bg-dark-900/50 overflow-hidden ${compact ? 'min-h-[160px]' : ''}`}>
                <div className={`border-b border-dark-700 bg-dark-800/50 px-3 py-2 text-slate-300 font-medium ${compact ? 'text-xs' : 'text-sm px-4 py-3'}`}>
                    Planning items
                </div>
                {!planningList.length ? (
                    <div className={compact ? 'p-5 text-center text-slate-500 text-xs h-[320px] flex items-center justify-center' : 'p-8 text-center text-slate-400'}>
                        No items yet. Add one.
                    </div>
                ) : (
                    <ul className="divide-y divide-dark-700/80 h-[320px] overflow-y-auto custom-scrollbar-thin">
                        {planningList.map((item) => (
                            <li key={item.id} className={`flex items-center justify-between gap-2 hover:bg-slate-800/30 ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
                                <div className="min-w-0 flex-1">
                                    <p className={`font-medium text-white truncate ${compact ? 'text-xs' : ''}`}>{item.description || item.title || item.name || 'Untitled'}</p>
                                    <p className="text-xs text-slate-400">
                                        {item.start_date && <DateTime date={item.start_date} variant="dateOnly" />}
                                        {item.start_date && item.end_date && ' → '}
                                        {item.end_date && <DateTime date={item.end_date} variant="dateOnly" />}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditItem(item);
                                            setAddModalOpen(true);
                                        }}
                                        className="p-1.5 rounded text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
                                        title="Edit"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteItem(item)}
                                        className="p-1.5 rounded text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                        title="Remove"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
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
