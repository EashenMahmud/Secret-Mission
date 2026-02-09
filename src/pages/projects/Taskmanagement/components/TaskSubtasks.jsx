import React, { useState } from 'react';
import { Plus, CheckSquare, Square, Trash2, X, Check, Loader2, Edit2 } from 'lucide-react';
import { usePostApiMutation, useGetApiQuery, useDeleteApiMutation } from '../../../../store/api/commonApi';
import { toast } from 'react-toastify';
import { cn } from '../../../../lib/utils';
import Button from '../../../../components/ui/Button';

const TaskSubtasks = ({ taskId, onUpdate }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [loadingIds, setLoadingIds] = useState(new Set());

    // Fetch subtasks
    const { data: subtasksData, refetch, isLoading: isLoadingSubtasks } = useGetApiQuery(
        { url: `/all-sub-task-list/${taskId}` },
        { skip: !taskId }
    );

    const [postApi] = usePostApiMutation();
    const [deleteApi] = useDeleteApiMutation();

    const subtasks = subtasksData?.data || [];

    const handleAddSubtask = async (e) => {
        e.preventDefault();
        if (!newSubtaskTitle.trim()) return;

        try {
            await postApi({
                end_point: '/add-sub-task',
                body: {
                    task_id: taskId,
                    title: newSubtaskTitle
                }
            }).unwrap();

            setNewSubtaskTitle('');
            setIsAdding(false);
            refetch();
            onUpdate?.();
            toast.success('Subtask added');
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to add subtask');
        }
    };

    const handleToggleComplete = async (subtaskId, currentStatus) => {
        // Prevent multiple clicks
        if (loadingIds.has(subtaskId)) return;

        setLoadingIds(prev => new Set(prev).add(subtaskId));

        try {
            const endpoint = currentStatus
                ? `/mark-sub-task-incomplete/${subtaskId}`
                : `/mark-sub-task-completed/${subtaskId}`;

            await postApi({
                end_point: endpoint,
                body: {}
            }).unwrap();

            refetch();
            onUpdate?.();
        } catch (error) {
            toast.error('Failed to update subtask');
        } finally {
            setLoadingIds(prev => {
                const next = new Set(prev);
                next.delete(subtaskId);
                return next;
            });
        }
    };

    const deleteSubtask = async (id) => {
        try {
            await deleteApi({ end_point: `/delete-sub-task/${id}` }).unwrap();
            refetch();
            onUpdate?.();
            toast.success('Subtask deleted');
        } catch (e) {
            toast.error('Failed to delete subtask');
        }
    }

    const startEditing = (subtask) => {
        setEditingId(subtask.id);
        setEditTitle(subtask.title);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditTitle('');
    };

    const saveEditing = async () => {
        if (!editTitle.trim()) return;
        try {
            await postApi({
                end_point: `/update-sub-task/${editingId}`,
                body: { title: editTitle }
            }).unwrap();

            setEditingId(null);
            refetch();
            onUpdate?.();
            toast.success('Subtask updated');
        } catch (error) {
            toast.error('Failed to update subtask');
        }
    };

    const completedCount = subtasks.filter(t => t.is_completed).length;
    const totalCount = subtasks.length;
    const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[var(--text-main)]">Checklist</h3>
                    {totalCount > 0 && (
                        <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-app)] px-2 py-0.5 rounded-full">
                            {completedCount}/{totalCount}
                        </span>
                    )}
                </div>
                {!isAdding && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAdding(true)}
                        className="text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Item
                    </Button>
                )}
            </div>

            {/* Progress Bar */}
            {totalCount > 0 && (
                <div className="h-1.5 w-full bg-[var(--bg-skeleton)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--primary-color)] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Subtasks List */}
            <div className="space-y-1">
                {subtasks.map((subtask) => (
                    <div
                        key={subtask.id}
                        className="group flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--bg-app)] transition-colors"
                    >
                        <button
                            onClick={() => handleToggleComplete(subtask.id, subtask.is_completed)}
                            disabled={loadingIds.has(subtask.id)}
                            className={cn(
                                "mt-0.5 flex-shrink-0 transition-colors",
                                subtask.is_completed ? "text-green-500" : "text-[var(--text-muted)] hover:text-[var(--text-main)]",
                                loadingIds.has(subtask.id) && "opacity-50 cursor-wait"
                            )}
                        >
                            {loadingIds.has(subtask.id) ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : subtask.is_completed ? (
                                <CheckSquare className="w-5 h-5" />
                            ) : (
                                <Square className="w-5 h-5" />
                            )}
                        </button>

                        {editingId === subtask.id ? (
                            <div className="flex-1 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="flex-1 bg-[var(--bg-card)] border border-[var(--border-main)] rounded px-2 py-1 text-sm focus:outline-none focus:border-[var(--primary-color)]"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
                                />
                                <button
                                    onClick={saveEditing}
                                    className="p-1 text-green-500 hover:bg-green-50 rounded"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-between">
                                <span className={cn(
                                    "text-sm text-[var(--text-main)] transition-all",
                                    subtask.is_completed && "text-[var(--text-muted)] line-through"
                                )}>
                                    {subtask.title}
                                </span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => startEditing(subtask)}
                                        className="p-1 text-[var(--text-muted)] hover:text-[var(--primary-color)] rounded"
                                        title="Edit"
                                        disabled={subtask.is_completed}
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    {!subtask.is_completed && (
                                        <button
                                            onClick={() => deleteSubtask(subtask.id)}
                                            className="p-1 text-[var(--text-muted)] hover:text-red-500 rounded"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {isAdding && (
                    <form onSubmit={handleAddSubtask} className="flex items-center gap-3 p-2">
                        <Square className="w-5 h-5 text-[var(--text-muted)] dashed opacity-50" />
                        <div className="flex-1 flex items-center gap-2">
                            <input
                                type="text"
                                value={newSubtaskTitle}
                                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                className="flex-1 bg-transparent border-none text-sm focus:outline-none placeholder:text-[var(--text-muted)]"
                                autoFocus
                            />
                            <div className="flex items-center gap-1">
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={!newSubtaskTitle.trim()}
                                    className="h-7 px-2"
                                >
                                    Add
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsAdding(false)}
                                    className="h-7 px-2 text-[var(--text-muted)]"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default TaskSubtasks;
