import React, { useState } from 'react';
import { UserPlus, X, User2, Crown, Hand } from 'lucide-react';
import { usePostApiMutation, useGetApiQuery } from '../../../../store/api/commonApi';
import { toast } from 'react-toastify';
import { cn } from '../../../../lib/utils';
import Button from '../../../../components/ui/Button';

const TaskAssignees = ({ taskId, assignees = [], onUpdate, projectId }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [instructions, setInstructions] = useState('');

    const [postApi, { isLoading }] = usePostApiMutation();

    // Fetch project members
    const { data: membersData } = useGetApiQuery(
        { url: `/project-manpower-list/${projectId}` },
        { skip: !projectId || !showDropdown }
    );

    const members = membersData?.data || [];
    const assignedUserIds = assignees.map(a => a.user_id || a.id);

    const handleAssignMember = async (isPrimary = false) => {
        if (!selectedUserId) {
            toast.error('Please select a member');
            return;
        }

        try {
            await postApi({
                end_point: '/assign-member-to-task',
                body: {
                    task_id: String(taskId),
                    user_id: String(selectedUserId),
                    instructions: instructions,
                    is_primary: isPrimary,
                },
            }).unwrap();

            toast.success('Member assigned successfully');
            setSelectedUserId('');
            setInstructions('');
            setShowDropdown(false);
            onUpdate?.();
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to assign member');
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            await postApi({
                end_point: '/remove-member-from-task',
                body: {
                    task_id: String(taskId),
                    user_id: String(userId),
                    instructions: '',
                    is_primary: false,
                },
            }).unwrap();

            toast.success('Member removed successfully');
            onUpdate?.();
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to remove member');
        }
    };

    const handleAssignSelf = async () => {
        try {
            await postApi({
                end_point: '/assign-self-to-task',
                body: {
                    task_id: Number(taskId),
                    is_primary: false,
                    instructions: '',
                },
            }).unwrap();

            toast.success('You have been assigned to this task');
            onUpdate?.();
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to assign yourself');
        }
    };

    const availableMembers = members.filter(m => !assignedUserIds.includes(m.user_id || m.id));

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-[var(--text-main)]">Assignees</h4>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAssignSelf}
                        disabled={isLoading}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 rounded transition-colors"
                    >
                        <Hand className="w-3 h-3" />
                        Assign to me
                    </button>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-[var(--primary-color)] text-white rounded hover:bg-[var(--primary-color)]/90 transition-colors"
                    >
                        <UserPlus className="w-3 h-3" />
                        Add
                    </button>
                </div>
            </div>

            {/* Assignees list */}
            <div className="space-y-2">
                {assignees.length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)] py-2">No assignees yet</p>
                ) : (
                    assignees.map((assignee) => (
                        <div
                            key={assignee.user_id || assignee.id}
                            className="flex items-center justify-between p-2 bg-[var(--bg-app)] rounded-lg group"
                        >
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                                    {(assignee.name || assignee.user_name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[var(--text-main)] flex items-center gap-1">
                                        {assignee.name || assignee.user_name || 'Unknown'}
                                        {assignee.is_primary && (
                                            <Crown className="w-3 h-3 text-amber-500" />
                                        )}
                                    </p>
                                    {assignee.instructions && (
                                        <p className="text-xs text-[var(--text-muted)]">{assignee.instructions}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleRemoveMember(assignee.user_id || assignee.id)}
                                className="p-1 text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Add member dropdown */}
            {showDropdown && (
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg space-y-3 animate-fade-in">
                    {/* Member select */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-main)] mb-1">
                            Select Member
                        </label>
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg text-sm text-[var(--text-main)] focus:ring-2 focus:ring-[var(--primary-color)]"
                        >
                            <option value="">Select a member...</option>
                            {availableMembers.map((member) => (
                                <option key={member.user_id || member.id} value={member.user_id || member.id}>
                                    {member.name || member.user_name || `User ${member.user_id || member.id}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Instructions */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-main)] mb-1">
                            Instructions (optional)
                        </label>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="Add instructions for this assignee..."
                            rows={2}
                            className="w-full px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--primary-color)]"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDropdown(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignMember(true)}
                            disabled={!selectedUserId || isLoading}
                        >
                            <Crown className="w-3 h-3 mr-1" />
                            Add as Primary
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleAssignMember(false)}
                            disabled={!selectedUserId || isLoading}
                            isLoading={isLoading}
                        >
                            Add Member
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskAssignees;
