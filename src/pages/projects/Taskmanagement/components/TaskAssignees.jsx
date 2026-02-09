import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, X, Crown, Hand, Clock, Mail, Phone, ChevronDown, Search, Check } from 'lucide-react';
import { usePostApiMutation, useGetApiQuery } from '../../../../store/api/commonApi';
import { toast } from 'react-toastify';
import { cn, getImageUrl } from '../../../../lib/utils';
import Button from '../../../../components/ui/Button';
import DateTime from '../../../../components/ui/DateTime';

const TaskAssignees = ({ taskId, assignments = [], onUpdate, projectId }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMemberPicker, setShowMemberPicker] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [instructions, setInstructions] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const pickerRef = useRef(null);

    const [postApi, { isLoading }] = usePostApiMutation();

    // Fetch project members
    const { data: membersData } = useGetApiQuery(
        { url: `/project-manpower-list/${projectId}` },
        { skip: !projectId || !showDropdown }
    );

    const members = membersData?.data || [];
    const assignedUserIds = assignments.map(a => a.user_id || a.user?.id);

    // Filter out already assigned members and apply search
    const availableMembers = members.filter(m => {
        const userId = m.user?.id || m.user_id;
        const userName = m.user?.name || m.name || '';
        const isNotAssigned = !assignedUserIds.includes(userId);
        const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase());
        return isNotAssigned && matchesSearch;
    });

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowMemberPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);



    const handleSelectMember = (member) => {
        setSelectedMember(member);
        setShowMemberPicker(false);
        setSearchTerm('');
    };

    const handleAssignMember = async (isPrimary = false) => {
        if (!selectedMember) {
            toast.error('Please select a member');
            return;
        }

        const userId = selectedMember.user?.id || selectedMember.user_id;

        try {
            await postApi({
                end_point: '/assign-member-to-task',
                body: {
                    task_id: String(taskId),
                    user_id: String(userId),
                    instructions: instructions,
                    is_primary: isPrimary,
                },
            }).unwrap();

            toast.success('Member assigned successfully');
            setSelectedMember(null);
            setInstructions('');
            setShowDropdown(false);
            onUpdate?.();
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to assign member');
        }
    };

    const handleRemoveMember = async (assignment) => {
        const userId = assignment.user_id || assignment.user?.id;
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



    // Member Avatar Component
    const MemberAvatar = ({ user, size = 'md' }) => {
        const profileUrl = getImageUrl(user?.profile_picture);
        const sizeClasses = {
            sm: 'w-8 h-8 text-xs',
            md: 'w-10 h-10 text-sm',
            lg: 'w-12 h-12 text-lg',
        };

        return (
            <div className="relative flex-shrink-0">
                {profileUrl ? (
                    <img
                        src={profileUrl}
                        alt={user?.name}
                        className={cn(sizeClasses[size], "rounded-full object-cover border-2 border-[var(--border-main)]")}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div
                    className={cn(
                        sizeClasses[size],
                        "rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 items-center justify-center text-white font-semibold border-2 border-[var(--border-main)]",
                        profileUrl ? "hidden" : "flex"
                    )}
                >
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[var(--text-main)]">
                    Assignees ({assignments.length})
                </h4>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAssignSelf}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 rounded-lg transition-colors"
                    >
                        <Hand className="w-3.5 h-3.5" />
                        Assign to me
                    </button>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--primary-color)]  rounded-lg hover:bg-[var(--primary-color)]/90 transition-colors"
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        Add Member
                    </button>
                </div>
            </div>

            {/* Assignees list */}
            <div className="space-y-3">
                {assignments.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-[var(--border-main)] rounded-lg">
                        <UserPlus className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                        <p className="text-sm text-[var(--text-muted)]">No assignees yet</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">Add team members to this task</p>
                    </div>
                ) : (
                    assignments.map((assignment) => {
                        const user = assignment.user || {};

                        return (
                            <div
                                key={assignment.id}
                                className="flex items-start gap-3 p-3 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl group hover:border-[var(--primary-color)]/30 transition-all"
                            >
                                {/* Avatar */}
                                <div className="relative">
                                    <MemberAvatar user={user} size="lg" />
                                    {assignment.is_primary && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                                            <Crown className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h5 className="text-sm font-semibold text-[var(--text-main)] truncate">
                                            {user.name || 'Unknown User'}
                                        </h5>
                                        {assignment.is_primary && (
                                            <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-600 rounded-full">
                                                Primary
                                            </span>
                                        )}
                                        <span className="px-2 py-0.5 text-xs font-medium bg-[var(--bg-app)] text-[var(--text-muted)] rounded-full">
                                            {user.user_type || 'Member'}
                                        </span>
                                    </div>

                                    {/* Contact info */}
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                                        {user.email && (
                                            <div className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                <span className="truncate max-w-[150px]">{user.email}</span>
                                            </div>
                                        )}
                                        {user.phone && (
                                            <div className="flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                <span>{user.phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Assigned at */}
                                    <div className="flex items-center gap-1 mt-2 text-xs text-[var(--text-muted)]">
                                        <Clock className="w-3 h-3" />
                                        <span>Assigned </span>
                                        <DateTime
                                            date={assignment.assigned_at || assignment.created_at}
                                            variant="full"
                                            className="text-xs text-[var(--text-muted)] font-normal"
                                        />
                                    </div>

                                    {/* Instructions */}
                                    {assignment.instructions && (
                                        <p className="mt-2 text-xs text-[var(--text-muted)] bg-[var(--bg-app)] p-2 rounded-lg">
                                            "{assignment.instructions}"
                                        </p>
                                    )}
                                </div>

                                {/* Remove button */}
                                <button
                                    onClick={() => handleRemoveMember(assignment)}
                                    className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                                    title="Remove from task"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add member dropdown */}
            {showDropdown && (
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl space-y-4 animate-fade-in shadow-lg">
                    <h5 className="text-sm font-semibold text-[var(--text-main)]">Add New Assignee</h5>

                    {/* Custom Member Picker */}
                    <div className="relative" ref={pickerRef}>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                            Select Member
                        </label>

                        {/* Selected member display / Trigger button */}
                        <button
                            type="button"
                            onClick={() => setShowMemberPicker(!showMemberPicker)}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2.5 bg-[var(--bg-app)] border rounded-lg text-sm transition-all",
                                showMemberPicker
                                    ? "border-[var(--primary-color)] ring-2 ring-[var(--primary-color)]/20"
                                    : "border-[var(--border-main)] hover:border-[var(--primary-color)]/50"
                            )}
                        >
                            {selectedMember ? (
                                <div className="flex items-center gap-3">
                                    <MemberAvatar user={selectedMember.user} size="sm" />
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-[var(--text-main)]">
                                            {selectedMember.user?.name || 'Unknown'}
                                        </p>
                                        <p className="text-xs text-[var(--text-muted)]">
                                            {selectedMember.user?.user_type || 'Member'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-[var(--text-muted)]">Select a team member...</span>
                            )}
                            <ChevronDown className={cn(
                                "w-4 h-4 text-[var(--text-muted)] transition-transform",
                                showMemberPicker && "rotate-180"
                            )} />
                        </button>

                        {/* Dropdown picker */}
                        {showMemberPicker && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg shadow-xl z-20 overflow-hidden">
                                {/* Search input */}
                                <div className="p-2 border-b border-[var(--border-main)]">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search members..."
                                            className="w-full pl-9 pr-3 py-2 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Member list */}
                                <div className="max-h-64 overflow-y-auto">
                                    {availableMembers.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-[var(--text-muted)]">
                                            {searchTerm ? 'No members found' : 'No available members'}
                                        </div>
                                    ) : (
                                        availableMembers.map((member) => {
                                            const user = member.user || {};
                                            const isSelected = selectedMember?.user?.id === user.id;

                                            return (
                                                <button
                                                    key={member.id || user.id}
                                                    type="button"
                                                    onClick={() => handleSelectMember(member)}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--bg-app)] transition-colors",
                                                        isSelected && "bg-[var(--primary-color)]/10"
                                                    )}
                                                >
                                                    <MemberAvatar user={user} size="sm" />
                                                    <div className="flex-1 text-left min-w-0">
                                                        <p className="text-sm font-medium text-[var(--text-main)] truncate">
                                                            {user.name || 'Unknown'}
                                                        </p>
                                                        <p className="text-xs text-[var(--text-muted)] truncate">
                                                            {user.email || user.user_type}
                                                        </p>
                                                    </div>
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-[var(--bg-app)] text-[var(--text-muted)] rounded-full flex-shrink-0">
                                                        {user.user_type || 'Member'}
                                                    </span>
                                                    {isSelected && (
                                                        <Check className="w-4 h-4 text-[var(--primary-color)] flex-shrink-0" />
                                                    )}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                            Instructions (optional)
                        </label>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="Add specific instructions for this assignee..."
                            rows={2}
                            className="w-full px-3 py-2.5 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-main)]">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setShowDropdown(false);
                                setSelectedMember(null);
                                setInstructions('');
                                setShowMemberPicker(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignMember(true)}
                            disabled={!selectedMember || isLoading}
                        >
                            <Crown className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                            Add as Primary
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleAssignMember(false)}
                            disabled={!selectedMember || isLoading}
                            isLoading={isLoading}
                        >
                            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                            Add Member
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskAssignees;
