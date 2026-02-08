import React, { useState } from 'react';
import { X, Edit2, Calendar, Clock, Flag, BarChart3, CheckCircle2, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useGetApiWithIdQuery, usePostApiMutation } from '../../../../store/api/commonApi';
import { TaskStatusBadge, TaskPriorityBadge } from './TaskStatusBadge';
import TaskAssignees from './TaskAssignees';
import TaskSubtasks from './TaskSubtasks';
import TaskDiscussions from './TaskDiscussions';
import Button from '../../../../components/ui/Button';
import DateTime from '../../../../components/ui/DateTime';
import { toast } from 'react-toastify';
import { cn } from '../../../../lib/utils';

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'in_review', label: 'In Review' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' },
];

const TaskDetailModal = ({
    isOpen,
    onClose,
    taskId,
    projectId,
    onEdit,
    onUpdate
}) => {
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [progress, setProgress] = useState(0);

    const { data: taskData, isLoading, refetch } = useGetApiWithIdQuery(
        { url: '/task-details', id: taskId },
        { skip: !isOpen || !taskId }
    );

    const [postApi, { isLoading: isUpdating }] = usePostApiMutation();

    const task = taskData?.data || taskData;

    React.useEffect(() => {
        if (task?.progress !== undefined) {
            setProgress(task.progress);
        }
    }, [task?.progress]);

    const handleStatusChange = async (newStatus) => {
        try {
            await postApi({
                end_point: `/update-progress-status/${taskId}`,
                body: {
                    task_id: String(taskId),
                    status: newStatus,
                    progress: progress,
                },
            }).unwrap();

            toast.success('Status updated');
            setShowStatusDropdown(false);
            refetch();
            onUpdate?.();
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to update status');
        }
    };

    const handleProgressUpdate = async () => {
        try {
            await postApi({
                end_point: `/update-progress-status/${taskId}`,
                body: {
                    task_id: String(taskId),
                    status: task?.status || 'draft',
                    progress: progress,
                },
            }).unwrap();

            toast.success('Progress updated');
            refetch();
            onUpdate?.();
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to update progress');
        }
    };

    const handleMarkComplete = async () => {
        try {
            await postApi({
                end_point: `/mark-task-completed/${taskId}`,
                body: {},
            }).unwrap();

            toast.success('Task marked as completed!');
            refetch();
            onUpdate?.();
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to mark task as completed');
        }
    };



    const isOverdue = task?.deadline && new Date(task.deadline) < new Date() && task?.status !== 'completed';

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Slide-over panel */}
            <div className="relative w-full max-w-2xl bg-[var(--bg-card)] shadow-2xl animate-slide-in-right overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-main)]">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-[var(--text-main)]">Task Details</h2>
                        {task && <TaskStatusBadge status={task.status} />}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit?.(task)}
                            disabled={!task}
                        >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                        </Button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[var(--bg-app)] rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-[var(--text-muted)]" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="w-8 h-8 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : task ? (
                        <>
                            {/* Title */}
                            <div>
                                <h1 className="text-2xl font-bold text-[var(--text-main)] mb-2">
                                    {task.title}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <TaskPriorityBadge priority={task.priority} />
                                    {isOverdue && (
                                        <span className="flex items-center gap-1 text-xs text-red-500">
                                            <AlertCircle className="w-3 h-3" />
                                            Overdue
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-[var(--bg-app)] rounded-lg p-4">
                                <h3 className="text-sm font-medium text-[var(--text-main)] mb-2">Description</h3>
                                <p className="text-sm text-[var(--text-muted)] whitespace-pre-wrap">
                                    {task.description || 'No description provided.'}
                                </p>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex flex-wrap gap-2">
                                {/* Status dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                        className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg hover:border-[var(--primary-color)] transition-colors text-sm"
                                    >
                                        <Flag className="w-4 h-4 text-[var(--text-muted)]" />
                                        Change Status
                                    </button>
                                    {showStatusDropdown && (
                                        <div className="absolute top-full left-0 mt-1 w-48 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg shadow-xl z-10 overflow-hidden">
                                            {STATUS_OPTIONS.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => handleStatusChange(option.value)}
                                                    className={cn(
                                                        'w-full px-4 py-2 text-left text-sm hover:bg-[var(--bg-app)] transition-colors',
                                                        task.status === option.value
                                                            ? 'text-[var(--primary-color)] bg-[var(--primary-color)]/10'
                                                            : 'text-[var(--text-main)]'
                                                    )}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {task.status !== 'completed' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleMarkComplete}
                                        disabled={isUpdating}
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                                        Mark Complete
                                    </Button>
                                )}
                            </div>

                            {/* Details grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[var(--bg-app)] rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-xs font-medium">Start Date</span>
                                    </div>
                                    <DateTime
                                        date={task.start_date}
                                        variant="dateOnly"
                                        className="text-sm text-[var(--text-main)]"
                                    />
                                </div>
                                <div className={cn(
                                    "rounded-lg p-4",
                                    isOverdue ? 'bg-red-500/10 border border-red-500/20' : 'bg-[var(--bg-app)]'
                                )}>
                                    <div className={cn(
                                        "flex items-center gap-2 mb-1",
                                        isOverdue ? 'text-red-500' : 'text-[var(--text-muted)]'
                                    )}>
                                        <Clock className="w-4 h-4" />
                                        <span className="text-xs font-medium">Deadline</span>
                                    </div>
                                    <DateTime
                                        date={task.deadline}
                                        variant="dateOnly"
                                        className={cn(
                                            "text-sm",
                                            isOverdue ? 'text-red-500 font-medium' : 'text-[var(--text-main)]'
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="bg-[var(--bg-app)] rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                        <BarChart3 className="w-4 h-4" />
                                        <span className="text-sm font-medium">Progress</span>
                                    </div>
                                    <span className="text-lg font-bold text-[var(--text-main)]">{progress}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={progress}
                                    onChange={(e) => setProgress(Number(e.target.value))}
                                    className="w-full h-2 bg-[var(--bg-skeleton)] rounded-lg appearance-none cursor-pointer slider"
                                />
                                {progress !== task.progress && (
                                    <div className="flex justify-end mt-2">
                                        <Button
                                            size="sm"
                                            onClick={handleProgressUpdate}
                                            disabled={isUpdating}
                                            isLoading={isUpdating}
                                        >
                                            Save Progress
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Subtasks */}
                            <div className="bg-[var(--bg-app)] rounded-lg p-4">
                                <TaskSubtasks
                                    taskId={taskId}
                                    onUpdate={() => {
                                        refetch();
                                        onUpdate?.();
                                    }}
                                />
                            </div>

                            {/* Assignees */}
                            <div className="bg-[var(--bg-app)] rounded-lg p-4">
                                <TaskAssignees
                                    taskId={taskId}
                                    assignments={task.assignments || []}
                                    projectId={projectId}
                                    onUpdate={() => {
                                        refetch();
                                        onUpdate?.();
                                    }}
                                />
                            </div>

                            {/* Discussions */}
                            <div className="bg-[var(--bg-app)] rounded-lg p-4">
                                <TaskDiscussions taskId={taskId} />
                            </div>

                            {/* Activity Log */}
                            {task.activityLog?.length > 0 && (
                                <div className="bg-[var(--bg-app)] rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-[var(--text-main)] mb-3">Activity</h3>
                                    <div className="space-y-2">
                                        {task.activityLog.slice(0, 5).map((log, index) => (
                                            <div key={index} className="flex items-start gap-2 text-xs">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)] mt-1.5" />
                                                <div>
                                                    <p className="text-[var(--text-main)]">{log.action}</p>
                                                    <p className="text-[var(--text-muted)]">
                                                        {log.user} • {new Date(log.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-center text-[var(--text-muted)]">Task not found</p>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

// Add CSS for slide animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slide-in-right {
        from {
            transform: translateX(100%);
        }
        to {
            transform: translateX(0);
        }
    }
    .animate-slide-in-right {
        animation: slide-in-right 0.3s ease-out;
    }
    .slider::-webkit-slider-thumb {
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--primary-color, #6366f1);
        cursor: pointer;
    }
    .slider::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--primary-color, #6366f1);
        cursor: pointer;
        border: none;
    }
`;
if (typeof document !== 'undefined' && !document.getElementById('task-detail-styles')) {
    style.id = 'task-detail-styles';
    document.head.appendChild(style);
}

export default TaskDetailModal;
