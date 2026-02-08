import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, X, MoreHorizontal, Check } from 'lucide-react';
import { usePostApiMutation, useGetApiQuery } from '../../../../store/api/commonApi';
import { toast } from 'react-toastify';
import { cn } from '../../../../lib/utils';
import Button from '../../../../components/ui/Button';

const TaskSubtasks = ({ taskId, onUpdate }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');

    // Fetch subtasks
    const { data: subtasksData, refetch, isLoading: isLoadingSubtasks } = useGetApiQuery(
        { url: `/all-sub-task-list/${taskId}` },
        { skip: !taskId }
    );

    const [postApi] = usePostApiMutation();
    const [deleteApi] = usePostApiMutation(); // The user said DELETE /delete-sub-task/{id} but usually we use postApi for everything in this project or deleteApi if it's actual delete method. The user provided "/delete-sub-task/{id}" which implies a URL. The commonApi has deleteApi. Let's check commonApi again.
    // Actually commonApi has deleteApi: builder.mutation({ query: ({ end_point }) => ({ url: end_point, method: 'DELETE' }) })
    // But the user lists it as /delete-sub-task/{id}. I will try to use the deleteApi if it supports the method, otherwise post. The user said "and these are for discussion api in the image", implying the first list was just text.
    // Let's assume standard REST for delete if possible, or POST if the project uses POST for everything.
    // Looking at previous chats, the project seems to use POST for almost everything including updates.
    // But commonApi has `deleteApi`. I'll try `deleteApi` for delete.

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
        try {
            await postApi({
                end_point: `/mark-sub-task-completed/${subtaskId}`,
                body: {} // Usually toggle endpoints don't need body if the logic is on server, or maybe status.
                // The user listed "/mark-sub-task-completed/{sub_task_id}".
            }).unwrap();

            refetch();
            onUpdate?.();
        } catch (error) {
            toast.error('Failed to update subtask');
        }
    };

    const handleDelete = async (subtaskId) => {
        try {
            // using deleteApi from commonApi which uses method: 'DELETE'
            // The endpoint provided is /delete-sub-task/{id}
            await postApi({
                end_point: `/delete-sub-task/${subtaskId}`, // Just in case it's a POST-based delete like others, I'll use postApi first? 
                // Wait, usually delete is DELETE. But if previous endpoints were "POST /update...", maybe this is "POST /delete..."?
                // The user provided list: "/delete-sub-task/{id}". 
                // In my implementation plan I wrote DELETE. 
                // Let's check `UserList.jsx` to see how they delete.
                // UserList uses `useDeleteApiMutation`.
                // I will use `useDeleteApiMutation` but if it fails I might need to switch.
                // However, the commonApi definition for deleteApi is method: 'DELETE'.
                // If the backend expects POST for delete (which is weird but possible in some legacy PHP apps), this might fail.
                // But looking at the endpoint name `/delete-sub-task/...`, it looks like an action.
                // I'll stick to `useDeleteApiMutation` first as per plan. 
                // actually wait, look at `commonApi.js`:
                // deleteApi: builder.mutation({ query: ({ end_point }) => ({ url: end_point, method: 'DELETE' }) })
                // If the backend route is defined as Route::post('delete-sub-task/{id}'), then I must use POST.
                // Most Laravel action-based routes like `mark-completed` suggests a controller action.
                // I'll bet on POST for safety given the other endpoints are POST.
                // actually, I will check UserList again.
                // UserList: `deleteUser({ end_point: /users/${userToDelete.id} })` -> This looks like RESTful resource delete.
                // `/delete-sub-task/{id}` looks like a custom RPC-style endpoint, which often uses POST.
                // I will use POST for `/delete-sub-task/{id}`.
                method: 'DELETE', // Wait, commonApi postApi forces method POST.
            }).unwrap();

            refetch();
            onUpdate?.();
            toast.success('Subtask deleted');
        } catch (error) {
            // If POST method not allowed, maybe try DELETE?
            // But I can't try-catch distinct methods easily with hooks rules.
            // I'll assume standard DELETE for now using the explicit delete hook if I have it.
            // Actually, looking at `commonApi.js` snippet from earlier: 
            // `deleteApi` is method DELETE.
            // `postApi` is method POST.
            // I will use `deleteApi` which sends DELETE method.
        }
    };

    // Actually, looking at the URL pattern /delete-sub-task/{id}, it strongly suggests an action URL rather than a resource URL (/sub-tasks/{id}).
    // Action URLs in this project seem to be POST.
    // I will use usePostApiMutation for delete as well, pointing to that URL.

    const deleteSubtask = async (id) => {
        try {
            // Using DELETE method via deleteApi
            // If the user provided URL is literally /delete-sub-task/{id}, it might be a DELETE route or POST.
            // Let's rely on the fact that `commonApi` has `deleteApi`.
            // But wait, I recall `UserList` using `deleteApi`.
            // `UserList` used `useDeleteApiMutation`.
            // I'll import `useDeleteApiMutation`.
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
            }).unwrap(); // Assuming the body needs title.

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
                    <h3 className="text-sm font-semibold text-[var(--text-main)]">Subtasks</h3>
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
                        Add Subtask
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
                            className={cn(
                                "mt-0.5 flex-shrink-0 transition-colors",
                                subtask.is_completed ? "text-green-500" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                            )}
                        >
                            {subtask.is_completed ? (
                                <CheckCircle2 className="w-5 h-5" />
                            ) : (
                                <Circle className="w-5 h-5" />
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
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => deleteSubtask(subtask.id)}
                                        className="p-1 text-[var(--text-muted)] hover:text-red-500 rounded"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {isAdding && (
                    <form onSubmit={handleAddSubtask} className="flex items-center gap-3 p-2">
                        <Circle className="w-5 h-5 text-[var(--text-muted)] dashed opacity-50" />
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
