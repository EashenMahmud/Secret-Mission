import { useState } from 'react';
import { useGetApiWithIdQuery, usePostApiMutation } from '../../../store/api/commonApi';
import { Users, Plus, X, ChevronUp } from 'lucide-react';
import Button from '../../../components/ui/Button';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import AddUserToProjectModal from './AddUserToProjectModal';
import { toast } from 'react-toastify';
import { cn, getImageUrl } from '../../../lib/utils';
import Tooltip from '../../../components/ui/Tooltip';

const ProjectManpowerSection = ({ projectId, onRefresh, compact = false }) => {
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [userToRemove, setUserToRemove] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const { data: manpowerRes, refetch } = useGetApiWithIdQuery(
        { url: '/project-manpower-list', id: projectId },
        { skip: !projectId }
    );
    const [removeUser, { isLoading: isRemoving }] = usePostApiMutation();

    const manpower = manpowerRes?.data?.data ?? manpowerRes?.data ?? [];
    const assignedIds = manpower.map((m) => (typeof m === 'object' && m.user_id != null ? m.user_id : m.id ?? m)).filter(Boolean);

    const handleRemove = async () => {
        if (!userToRemove) return;
        const userId = userToRemove.user_id ?? userToRemove.id;
        try {
            await removeUser({
                end_point: '/remove-user-from-project',
                body: { project_id: Number(projectId), user_id: userId },
            }).unwrap();
            toast.success('User removed from project');
            setUserToRemove(null);
            refetch();
            onRefresh?.();
        } catch (e) {
            toast.error(e?.data?.message || 'Failed to remove user');
        }
    };

    const displayUser = (entry) => {
        const u = entry.user ?? entry;
        return {
            id: u.id ?? entry.user_id ?? entry.id,
            name: u.name || u.email || `User #${u.id}`,
            email: u.email,
            avatar: u.profile_picture,
        };
    };

    const MAX_DISPLAY = 5;
    const remainingCount = Math.max(0, manpower.length - MAX_DISPLAY);

    // items to show based on state
    const visibleUsers = isExpanded ? manpower : manpower.slice(0, MAX_DISPLAY);

    const UserAvatar = ({ entry }) => {
        const u = displayUser(entry);
        return (
            <Tooltip
                id={`user-manpower-${u.id}`}
                place="top"
                className="z-10 hover:z-50"
                content={
                    <div className="flex flex-col gap-1">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-[var(--text-main)] truncate">{u.name}</p>
                                <p className="text-[10px] text-[var(--text-muted)] truncate">{u.email}</p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setUserToRemove(entry);
                                }}
                                className="text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 p-1 rounded transition-colors flex-shrink-0"
                                title="Remove User"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                }
            >
                {/* Avatar Circle */}
                <div className={cn(
                    "relative h-9 w-9 rounded-full ring-2 ring-[var(--bg-card)] flex items-center justify-center overflow-hidden transition-all duration-200 cursor-pointer",
                    "hover:ring-primary-500 hover:scale-105"
                )}>
                    {u.avatar ? (
                        <img src={getImageUrl(u.avatar)} alt={u.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full bg-[var(--bg-app)] flex items-center justify-center text-[var(--text-main)] font-semibold text-xs border border-[var(--border-main)]">
                            {u.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            </Tooltip>
        );
    };

    if (manpower.length === 0) {
        return (
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="flex items-center gap-2 font-semibold text-[var(--text-main)] text-sm uppercase tracking-wider">
                        <Users className="h-4 w-4 text-primary-400" />
                        Manpower (0)
                    </h2>
                </div>
                <button
                    onClick={() => setAddModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-dashed border-[var(--border-main)] text-xs text-[var(--text-muted)] hover:text-primary-400 hover:border-primary-500/50 hover:bg-primary-500/5 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Member</span>
                </button>
                <AddUserToProjectModal
                    isOpen={addModalOpen}
                    onClose={() => setAddModalOpen(false)}
                    projectId={projectId}
                    assignedUserIds={assignedIds}
                    onSuccess={() => { refetch(); onRefresh?.(); }}
                />
            </div>
        );
    }

    return (
        <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold text-[var(--text-main)] text-sm uppercase tracking-wider">
                    <Users className="h-4 w-4 text-primary-400" />
                    Manpower ({manpower.length})
                </h2>
                {isExpanded && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsExpanded(false)}
                        className="h-6 w-6 p-0 rounded-full"
                        title="Collapse"
                    >
                        <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            <div className={cn(
                "flex items-center transition-all duration-300",
                isExpanded ? "flex-wrap gap-3" : "-space-x-2"
            )}>
                {visibleUsers.map((entry, idx) => (
                    <UserAvatar key={displayUser(entry).id ?? idx} entry={entry} />
                ))}

                {/* Counter / Expand Button */}
                {!isExpanded && remainingCount > 0 && (
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="relative h-9 w-9 rounded-full ring-2 ring-[var(--bg-card)] bg-[var(--bg-app)] hover:bg-[var(--bg-card)] flex items-center justify-center z-0 hover:z-10 transition-colors cursor-pointer"
                        title="Show all"
                    >
                        <span className="text-xs font-semibold text-[var(--text-muted)]">+{remainingCount}</span>
                    </button>
                )}

                {/* Add Button - Circle style in flow */}
                <button
                    onClick={() => setAddModalOpen(true)}
                    className={cn(
                        "relative h-9 w-9 rounded-full border border-dashed border-[var(--border-main)] flex items-center justify-center text-[var(--text-muted)] hover:text-primary-400 hover:border-primary-500/50 hover:bg-primary-500/5 transition-colors z-0",
                        !isExpanded && "ml-2"
                    )}
                    title="Add Member"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            <AddUserToProjectModal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                projectId={projectId}
                assignedUserIds={assignedIds}
                onSuccess={() => {
                    refetch();
                    onRefresh?.();
                }}
            />

            <ConfirmationModal
                isOpen={!!userToRemove}
                onClose={() => setUserToRemove(null)}
                onConfirm={handleRemove}
                title="Remove user from project"
                message={`Remove "${userToRemove ? displayUser(userToRemove).name : ''}" from this project?`}
                isLoading={isRemoving}
            />
        </section>
    );
};

export default ProjectManpowerSection;
