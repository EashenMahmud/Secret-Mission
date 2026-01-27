import { useState } from 'react';
import { useGetApiWithIdQuery, usePostApiMutation } from '../../../store/api/commonApi';
import { UserPlus, Users, UserMinus } from 'lucide-react';
import Button from '../../../components/ui/Button';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import AddUserToProjectModal from './AddUserToProjectModal';
import { toast } from 'react-toastify';
import { cn, getImageUrl } from '../../../lib/utils';

const ProjectManpowerSection = ({ projectId, onRefresh, compact = false }) => {
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [userToRemove, setUserToRemove] = useState(null);

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

    return (
        <section className={`${compact ? 'space-y-2' : 'space-y-4'} flex flex-col h-full`}>
            <div className="flex items-center justify-between gap-2">
                <h2 className={`flex items-center gap-2 font-semibold text-white ${compact ? 'text-sm' : 'text-xl'}`}>
                    <Users className={compact ? 'h-4 w-4 text-primary-400' : 'h-5 w-5 text-primary-400'} />
                    Manpower
                </h2>
                <Button
                    size={compact ? 'sm' : 'md'}
                    leftIcon={<UserPlus className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
                    onClick={() => setAddModalOpen(true)}
                    className={compact ? '!px-2.5 !py-1.5 text-xs' : ''}
                >
                    Add user
                </Button>
            </div>

            <div className={`rounded-lg border border-dark-700 bg-dark-900/50 overflow-hidden flex-1 flex flex-col ${compact ? 'min-h-0' : ''}`}>
                <div className={`border-b border-dark-700 bg-dark-800/50 text-slate-300 font-medium flex-shrink-0 ${compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'}`}>
                    Team on this project
                </div>
                {!manpower.length ? (
                    <div className={`flex flex-col items-center justify-center gap-1.5 text-slate-400 text-center flex-1 ${compact ? 'p-5' : 'p-8'}`}>
                        <Users className={compact ? 'h-10 w-10 text-slate-600' : 'h-12 w-12 text-slate-600'} />
                        <p className={compact ? 'text-xs' : ''}>No users assigned yet.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-dark-700/80 flex-1 overflow-y-auto custom-scrollbar-thin">
                        {manpower.map((entry, idx) => {
                            const u = displayUser(entry);
                            return (
                                <li
                                    key={u.id ?? idx}
                                    className={cn(
                                        'flex items-center justify-between gap-2 hover:bg-slate-800/30',
                                        compact ? 'px-3 py-2' : 'px-4 py-3'
                                    )}
                                >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <div className={cn('flex-shrink-0 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-600', compact ? 'h-8 w-8' : 'h-10 w-10')}>
                                            {u.avatar ? (
                                                <img src={getImageUrl(u.avatar)} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <Users className={compact ? 'h-4 w-4 text-slate-400' : 'h-5 w-5 text-slate-400'} />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={cn('font-medium text-white truncate', compact && 'text-xs')}>{u.name}</p>
                                            {u.email && <p className="text-xs text-slate-400 truncate">{u.email}</p>}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setUserToRemove(entry)}
                                        className={cn(
                                            'flex items-center gap-1 rounded-lg font-medium transition-colors text-slate-400 hover:bg-red-500/10 hover:text-red-400 flex-shrink-0',
                                            compact ? 'p-1.5 text-xs' : 'px-3 py-2 text-sm'
                                        )}
                                        title="Remove from project"
                                    >
                                        <UserMinus className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                                        {!compact && 'Remove'}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
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
