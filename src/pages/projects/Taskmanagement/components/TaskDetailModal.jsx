import React, { useState } from 'react';
import { X, Edit2, Calendar, Clock, Flag, CheckCircle2, AlertCircle, User2, List, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useGetApiWithIdQuery, usePostApiMutation } from '../../../../store/api/commonApi';
import { TaskStatusBadge, TaskPriorityBadge } from './TaskStatusBadge';
import TaskAssignees from './TaskAssignees';
import TaskSubtasks from './TaskSubtasks';
import TaskDiscussions from './TaskDiscussions';
import Button from '../../../../components/ui/Button';
import DateTime from '../../../../components/ui/DateTime';
import Tooltip from '../../../../components/ui/Tooltip';
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

    // Refs for scrolling
    const datesRef = React.useRef(null);
    const checklistRef = React.useRef(null);
    const assigneesRef = React.useRef(null);

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const STATUS_OPTIONS = [
        { value: 'draft', label: 'Draft' },
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'in_review', label: 'In Review' },
        { value: 'completed', label: 'Completed' },
        { value: 'blocked', label: 'Blocked' },
    ];

    const { data: taskData, isLoading, refetch } = useGetApiWithIdQuery(
        { url: '/task-details', id: taskId },
        { skip: !isOpen || !taskId }
    );

    const [postApi, { isLoading: isUpdating }] = usePostApiMutation();

    const task = taskData?.data || taskData;

    const handleStatusChange = async (newStatus) => {
        try {
            await postApi({
                end_point: `/update-progress-status/${taskId}`,
                body: {
                    task_id: String(taskId),
                    status: newStatus,
                    progress: task?.progress || 0,
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
                className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Slide-over panel - Increased width for 2-column layout */}
            <div className="relative w-full max-w-6xl bg-[var(--bg-card)] shadow-2xl animate-slide-in-right overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-main)]">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                        <h2 className="text-lg font-semibold text-[var(--text-main)]">Task Details</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 mr-4">
                            {task && <TaskStatusBadge status={task.status} />}
                            {task && <TaskPriorityBadge priority={task.priority} />}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit?.(task)}
                            disabled={!task}
                        >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-[var(--bg-app)]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-8 h-8 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : task ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto">

                            {/* Left Column - Task Info (Span 8) */}
                            <div className="lg:col-span-8 space-y-6">
                                {/* Title Section */}
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-[var(--text-main)] mb-2 leading-tight">
                                            {task.title}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
                                            <div className="flex items-center gap-2 bg-[var(--bg-app)] px-2.5 py-1 rounded-lg border border-[var(--border-main)]">
                                                <Calendar className="w-4 h-4 text-[var(--primary-color)]" />
                                                <span className="font-medium flex items-center gap-1">
                                                    <DateTime date={task.start_date} variant="dateOnly" className="text-sm text-[var(--text-main)]" />
                                                    <span> - </span>
                                                    <DateTime date={task.deadline} variant="dateOnly" className="text-sm text-[var(--text-main)]" />
                                                </span>
                                            </div>
                                            {isOverdue && (
                                                <span className="flex items-center gap-1.5 text-red-600 font-medium bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                                                    <AlertCircle className="w-4 h-4" />
                                                    Overdue
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Circle */}
                                    <div className="flex flex-col items-center justify-center flex-shrink-0 bg-[var(--bg-app)] p-3 rounded-xl border border-[var(--border-main)] shadow-sm">
                                        <div className="relative w-14 h-14">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle
                                                    cx="28"
                                                    cy="28"
                                                    r="24"
                                                    stroke="currentColor"
                                                    strokeWidth="5"
                                                    fill="transparent"
                                                    className="text-[var(--border-main)]/50"
                                                />
                                                <circle
                                                    cx="28"
                                                    cy="28"
                                                    r="24"
                                                    stroke="var(--primary-color)"
                                                    strokeWidth="5"
                                                    fill="transparent"
                                                    strokeDasharray={150.72}
                                                    strokeDashoffset={150.72 - ((task.progress || 0) / 100) * 150.72}
                                                    className="transition-all duration-1000 ease-out"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-sm font-bold text-[var(--text-main)]">
                                                    {task.progress || 0}%
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-[var(--text-muted)] mt-1.5 font-semibold uppercase tracking-wider">Progress</span>
                                    </div>
                                </div>

                                {/* Action Buttons Row */}
                                <div className="flex flex-wrap gap-2">
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg hover:border-[var(--primary-color)] transition-colors text-sm font-medium text-[var(--text-main)] shadow-sm"
                                        >
                                            <Flag className="w-4 h-4 text-[var(--text-muted)]" />
                                            Status
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

                                    <Tooltip
                                        content={`Start: ${new Date(task.start_date).toLocaleDateString()} - Due: ${new Date(task.deadline).toLocaleDateString()}`}
                                        place="top"
                                    >
                                        <button
                                            onClick={() => scrollToSection(datesRef)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg hover:border-[var(--primary-color)] transition-colors text-sm font-medium text-[var(--text-main)] shadow-sm"
                                        >
                                            <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                                            Dates
                                        </button>
                                    </Tooltip>

                                    <button
                                        onClick={() => scrollToSection(checklistRef)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg hover:border-[var(--primary-color)] transition-colors text-sm font-medium text-[var(--text-main)] shadow-sm"
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-[var(--text-muted)]" />
                                        Checklist
                                    </button>

                                    <button
                                        onClick={() => scrollToSection(assigneesRef)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg hover:border-[var(--primary-color)] transition-colors text-sm font-medium text-[var(--text-main)] shadow-sm"
                                    >
                                        <User2 className="w-4 h-4 text-[var(--text-muted)]" />
                                        Members
                                    </button>

                                    {task.status !== 'completed' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleMarkComplete}
                                            disabled={isUpdating}
                                            className="bg-[var(--bg-card)] ml-auto"
                                        >
                                            <Check className="w-4 h-4 mr-1 text-green-500" />
                                            Mark Complete
                                        </Button>
                                    )}
                                </div>
                                {/* Assignees Area - Redesigned as Members Row */}
                                <div ref={assigneesRef} className="space-y-3 scroll-mt-20">
                                    <h3 className="text-sm font-semibold text-[var(--text-main)]">Members</h3>
                                    <div className="flex items-center gap-2">
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
                                </div>
                                {/* Description */}
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
                                        <span className="w-6 h-6 rounded flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-main)]">
                                            <List className="w-4 h-4" /> {/* Fallback icon, maybe Description icon */}
                                        </span>
                                        Description
                                    </h3>
                                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-4 min-h-[100px] shadow-sm">
                                        <p className="text-sm text-[var(--text-main)] whitespace-pre-wrap leading-relaxed">
                                            {task.description || <span className="text-[var(--text-muted)] italic">No description provided...</span>}
                                        </p>
                                    </div>
                                </div>

                                {/* Details grid */}
                                {/* <div ref={datesRef} className="grid grid-cols-2 gap-4 scroll-mt-20">
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
                                </div> */}

                                {/* Subtasks */}
                                <div ref={checklistRef} className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-4 shadow-sm scroll-mt-20">
                                    <TaskSubtasks
                                        taskId={taskId}
                                        onUpdate={() => {
                                            refetch();
                                            onUpdate?.();
                                        }}
                                    />

                                </div>


                            </div>

                            {/* Right Column - Activity & Discussions (Span 4) */}
                            <div className="lg:col-span-4 space-y-6">
                                {/* Discussions / Comments */}
                                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl shadow-sm h-full flex flex-col">
                                    <div className="p-4 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-app)]/50 rounded-t-xl">
                                        <h3 className="text-sm font-semibold text-[var(--text-main)]">Activity</h3>
                                    </div>
                                    <div className="p-4 flex-1">
                                        <TaskDiscussions taskId={taskId} />

                                        {/* Activity Log Feed */}
                                        {task.activityLog?.length > 0 && (
                                            <div className="mt-8 pt-6 border-t border-[var(--border-main)]">
                                                <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">History</h4>
                                                <div className="space-y-4">
                                                    {task.activityLog.slice(0, 10).map((log, index) => (
                                                        <div key={index} className="flex gap-3 text-xs">
                                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--bg-app)] flex items-center justify-center border border-[var(--border-main)] text-[var(--text-muted)]">
                                                                <Clock className="w-3 h-3" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[var(--text-main)]">
                                                                    <span className="font-medium">{log.user}</span> {log.action}
                                                                </p>
                                                                <p className="text-[var(--text-muted)] mt-0.5">
                                                                    {new Date(log.timestamp).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <p className="text-center text-[var(--text-muted)] mt-10">Task not found</p>
                    )}
                </div>
            </div>
        </div >
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
