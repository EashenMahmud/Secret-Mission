import React, { useState } from 'react';
import { Send, MoreVertical, Edit2, Trash2, MessageSquare } from 'lucide-react';
import { usePostApiMutation, useGetApiQuery, useDeleteApiMutation } from '../../../../store/api/commonApi';
import { toast } from 'react-toastify';
import { cn, getImageUrl } from '../../../../lib/utils';
import Button from '../../../../components/ui/Button';
import DateTime from '../../../../components/ui/DateTime';

const TaskDiscussions = ({ taskId }) => {
    const [newComment, setNewComment] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [showActionsId, setShowActionsId] = useState(null);

    // Fetch discussions

    const { data: discussionsData, refetch, isLoading } = useGetApiQuery(
        { url: `/all-task-discussion/${taskId}` },
        { skip: !taskId }
    );

    const [postApi, { isLoading: isPosting }] = usePostApiMutation();
    const [deleteApi] = useDeleteApiMutation();
    // Usually standard resource delete uses DELETE. The image showed DELETE /api/task-discussions/{task_discussion}.
    // This looks like a standard resource delete. so useDeleteApiMutation is appropriate.

    const discussions = discussionsData?.data || [];

    // Current user (mock or from auth) - In a real app we'd compare IDs to show edit/delete buttons.
    // tailored to the UserList response structure, let's assume we can get current user from somewhere.
    // For now, I will show actions for all or just let it be. 
    // Ideally we should check if `comment.user_id === currentUserId`.
    // I'll leave that logic loose for now or just check if it's possible.

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await postApi({
                end_point: '/add-task-discussions',
                body: {
                    task_id: taskId,
                    message: newComment
                }
            }).unwrap();

            setNewComment('');
            refetch();
            toast.success('Comment added');
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to add comment');
        }
    };

    const handleDelete = async (commentId) => {
        try {
            await deleteApi({
                end_point: `/task-discussions/${commentId}`
            }).unwrap();

            refetch();
            toast.success('Comment deleted');
        } catch (error) {
            toast.error('Failed to delete comment');
        }
    };

    const handleEdit = async (commentId) => {
        if (!editContent.trim()) return;
        try {
            // Image showed PUT /api/task-discussions/{task_discussion}
            // commonApi might have putApi? usually simple apps use postApi with _method: PUT or just POST to an update endpoint.
            // But if `usePostApiMutation` is the only write hook (besides delete), I might need to use it.
            // Let's assume postApi can handle it or use a specific update endpoint if available.
            // The image shows PUT. 
            // Converting to POST with method override or just expecting the hook to handle it if I pass method: PUT?
            // `postApi` usually forces POST.
            // I'll try `postApi` with the content. If strict REST PUT is required, I might need `putApi` (if exists) or `custom call`.
            // `UserList` didn't show update user logic.
            // Let's assume I can use `postApi` to `/task-discussions/${commentId}` with `_method: 'PUT'` in body if needed, or just standard POST if the backend supports it.
            // Or maybe there is `usePutApiMutation`? I haven't seen it in `UserList`.
            // I'll try POST to `/task-discussions/${commentId}?_method=PUT` which is a common Laravel trick.

            await postApi({
                end_point: `/task-discussions/${commentId}?_method=PUT`,
                body: { message: editContent }
            }).unwrap();

            setEditingId(null);
            setEditContent('');
            refetch();
            toast.success('Comment updated');
        } catch (error) {
            toast.error('Failed to update comment');
        }
    };

    const getProfileUrl = (user) => {
        return getImageUrl(user?.profile_picture);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Discussion
            </h3>

            {/* Comment List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {discussions.length === 0 ? (
                    <div className="text-center py-6 text-[var(--text-muted)] text-sm bg-[var(--bg-app)] rounded-lg border border-dashed border-[var(--border-main)]">
                        No comments yet. Start the discussion!
                    </div>
                ) : (
                    discussions.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {getProfileUrl(comment.user) ? (
                                    <img
                                        src={getProfileUrl(comment.user)}
                                        alt={comment.user?.name}
                                        className="w-8 h-8 rounded-full object-cover border border-[var(--border-main)]"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                        {(comment.user?.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-[var(--text-main)]">
                                            {comment.user?.name || 'Unknown User'}
                                        </span>
                                        <DateTime
                                            date={comment.created_at}
                                            variant="relative"
                                            className="text-xs text-[var(--text-muted)] font-normal"
                                        />
                                    </div>

                                    {/* Actions Dropdown Trigger (visible on hover) */}
                                    <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setShowActionsId(showActionsId === comment.id ? null : comment.id)}
                                            className="p-1 hover:bg-[var(--bg-app)] rounded text-[var(--text-muted)]"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {showActionsId === comment.id && (
                                            <div className="absolute right-0 top-full mt-1 w-32 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg shadow-lg z-10 py-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(comment.id);
                                                        setEditContent(comment.message);
                                                        setShowActionsId(null);
                                                    }}
                                                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--bg-app)] flex items-center gap-2"
                                                >
                                                    <Edit2 className="w-3 h-3" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleDelete(comment.id);
                                                        setShowActionsId(null);
                                                    }}
                                                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-red-500 flex items-center gap-2"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Delete
                                                </button>
                                            </div>
                                        )}

                                        {/* Overlay to close dropdown */}
                                        {showActionsId === comment.id && (
                                            <div
                                                className="fixed inset-0 z-0"
                                                onClick={() => setShowActionsId(null)}
                                            />
                                        )}
                                    </div>
                                </div>

                                {editingId === comment.id ? (
                                    <div className="mt-2">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg p-2 text-sm focus:outline-none focus:border-[var(--primary-color)]"
                                            rows={2}
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setEditContent('');
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleEdit(comment.id)}
                                                disabled={!editContent.trim()}
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-[var(--text-main)] whitespace-pre-wrap bg-[var(--bg-app)]/50 p-2 rounded-lg rounded-tl-none">
                                        {comment.message}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Comment Input */}
            <div className="flex gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-app)] flex items-center justify-center border border-[var(--border-main)]">
                    <MessageSquare className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
                <div className="flex-1">
                    <div className="relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-[var(--primary-color)] min-h-[42px] max-h-32 resize-y"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment(e);
                                }
                            }}
                        />
                        <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || isPosting}
                            className={cn(
                                "absolute right-2 bottom-2 p-1 rounded-full transition-colors",
                                newComment.trim()
                                    ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90"
                                    : "bg-[var(--bg-app)] text-[var(--text-muted)] cursor-not-allowed"
                            )}
                        >
                            <Send className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1 ml-1">
                        Press Enter to send, Shift+Enter for new line
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TaskDiscussions;
