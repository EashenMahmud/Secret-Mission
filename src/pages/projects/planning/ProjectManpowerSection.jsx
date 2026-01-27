import { useState } from 'react';
import { useGetApiWithIdQuery, usePostApiMutation } from '../../../store/api/commonApi';
import { UserPlus, Users, UserMinus } from 'lucide-react';
import Button from '../../../components/ui/Button';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import AddUserToProjectModal from './AddUserToProjectModal';
import { toast } from 'react-toastify';
import { cn, getImageUrl } from '../../../lib/utils';

const ProjectManpowerSection = ({ projectId, onRefresh }) => {
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
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                    <Users className="h-5 w-5 text-primary-400" />
                    Manpower
                </h2>
                <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setAddModalOpen(true)}>
                    Add user
                </Button>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 overflow-hidden">
                <div className="border-b border-slate-700/50 bg-slate-800/30 px-4 py-3 text-sm font-medium text-slate-300">
                    Team on this project
                </div>
                {!manpower.length ? (
                    <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-slate-400">
                        <Users className="h-12 w-12 text-slate-600" />
                        <p>No users assigned yet. Add users to the project.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-800/50">
                        {manpower.map((entry, idx) => {
                            const u = displayUser(entry);
                            return (
                                <li
                                    key={u.id ?? idx}
                                    className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-800/30"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-600">
                                            {u.avatar ? (
                                                <img src={getImageUrl(u.avatar)} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <Users className="h-5 w-5 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-white truncate">{u.name}</p>
                                            {u.email && <p className="text-xs text-slate-400 truncate">{u.email}</p>}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setUserToRemove(entry)}
                                        className={cn(
                                            'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                            'text-slate-400 hover:bg-red-500/10 hover:text-red-400'
                                        )}
                                        title="Remove from project"
                                    >
                                        <UserMinus className="h-4 w-4" />
                                        Remove
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
