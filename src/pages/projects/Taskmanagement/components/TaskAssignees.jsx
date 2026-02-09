import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, X, Crown, Hand, Clock, Mail, Phone, ChevronDown, Search, Check } from 'lucide-react';
import { usePostApiMutation, useGetApiQuery } from '../../../../store/api/commonApi';
import { toast } from 'react-toastify';
import { cn, getImageUrl } from '../../../../lib/utils';
import Button from '../../../../components/ui/Button';
import DateTime from '../../../../components/ui/DateTime';
import Tooltip from '../../../../components/ui/Tooltip';

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
            toast.error(error?.data?.errors || error?.data?.message || 'Failed to assign yourself');
        }
    };



    // Member Avatar Component
    const MemberAvatar = ({ user, assignment, onRemove }) => {
        const profileUrl = getImageUrl(user?.profile_picture);

        return (
            <div className="group relative flex-shrink-0">
                <Tooltip
                    content={
                        <div className="flex flex-col gap-0.5 p-1 min-w-[120px]">
                            <span className="font-bold text-sm tracking-tight">{user?.name || 'Unknown'}</span>
                            <span className="text-[10px] text-[var(--text-muted)] font-medium">{user?.email || 'No email provided'}</span>
                            <span className="text-[10px] opacity-60 mt-0.5">{user?.user_type || 'Member'}</span>
                            <div className="mt-2 pt-2 border-t border-[var(--border-main)]/30">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove(assignment);
                                    }}
                                    className="w-full text-red-500 hover:text-red-400 text-left text-[10px] font-bold uppercase tracking-wider transition-colors"
                                >
                                    Remove from Task
                                </button>
                            </div>
                        </div>
                    }
                    place="top"
                >
                    <div className="relative cursor-pointer transition-transform hover:scale-110">
                        {profileUrl ? (
                            <img
                                src={profileUrl}
                                alt={user?.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-[var(--bg-card)] shadow-sm"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className={cn(
                                "w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 items-center justify-center text-white text-sm font-semibold border-2 border-[var(--bg-card)] shadow-sm",
                                profileUrl ? "hidden" : "flex"
                            )}
                        >
                            {(user?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        {assignment?.is_primary && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center shadow-sm border border-[var(--bg-card)]">
                                <Crown className="w-2 h-2 text-white" />
                            </div>
                        )}
                    </div>
                </Tooltip>
            </div>
        );
    };

    return (
        <div className="relative">
            {/* Assignees horizontal row */}
            <div className="flex items-center flex-wrap gap-2">
                {assignments.map((assignment) => (
                    <MemberAvatar
                        key={assignment.id}
                        user={assignment.user || {}}
                        assignment={assignment}
                        onRemove={handleRemoveMember}
                    />
                ))}

                {/* Circular Plus Button */}
                <Tooltip content="Add Member" place="top">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm border-2 border-dashed",
                            showDropdown
                                ? "bg-[var(--primary-color)] text-white border-transparent rotate-45"
                                : "bg-[var(--bg-app)] text-[var(--text-muted)] border-[var(--border-main)] hover:border-[var(--primary-color)] hover:text-[var(--primary-color)]"
                        )}
                    >
                        <UserPlus className="w-5 h-5" />
                    </button>
                </Tooltip>

                {/* Assign to me - Optional/Compact */}
                {!assignments.some(a => (a.user_id || a.user?.id) === (/* Should ideally get current user ID from state/context */ null)) && (
                    <Tooltip content="Assign to me" place="top">
                        <button
                            onClick={handleAssignSelf}
                            disabled={isLoading}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-app)] text-[var(--text-muted)] border-2 border-[var(--border-main)] border-dashed transition-all hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] shadow-sm"
                        >
                            <Hand className="w-5 h-5" />
                        </button>
                    </Tooltip>
                )}
            </div>

            {/* Add member dropdown - Positioned below the row */}
            {showDropdown && (
                <div className="absolute top-full left-0 mt-3 w-80 p-4 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl space-y-4 animate-fade-in shadow-2xl z-50">
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
