import React, { useState, useMemo } from 'react';
import {
    useGetApiQuery,
    useDeleteApiMutation
} from '../../store/api/commonApi';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import UserForm from './UserForm';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { cn, getImageUrl } from '../../lib/utils';

const UserList = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Fetch users (using the endpoint you specified)
    const { data: response, isLoading, refetch } = useGetApiQuery({ url: '/admin/get-user-list' });
    const [deleteUser, { isLoading: isDeleting }] = useDeleteApiMutation();

    // The users array is nested in response.data.data according to your provided structure
    const users = response?.data?.data || [];

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteUser({ end_point: `/users/${userToDelete.id}` }).unwrap();
            toast.success('User deleted successfully');
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to delete user');
        }
    };

    const columns = useMemo(() => [
        {
            header: 'User',
            accessorKey: 'name',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-300">
                        {row.original.profile_picture ? (
                            <img
                                src={getImageUrl(row.original.profile_picture)}
                                alt={row.original.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <User className="h-6 w-6 text-slate-400" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{row.original.name}</span>
                        <span className="text-xs text-slate-500">{row.original.email}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'ID / Code',
            accessorKey: 'employee_code',
            cell: ({ row }) => (
                <div className="text-xs text-slate-600">
                    <div className="font-medium text-slate-900">{row.original.employee_code}</div>
                    <div className="text-slate-400">HRM: {row.original.hrm_id || 'N/A'}</div>
                </div>
            )
        },
        {
            header: 'Org Info',
            id: 'org_info',
            cell: ({ row }) => (
                <div className="text-xs">
                    <div className="font-medium text-slate-900">{row.original.department?.name || 'No Dept'}</div>
                    <div className="text-slate-500">{row.original.designation?.name || 'No Desig'}</div>
                </div>
            )
        },
        {
            header: 'Role',
            accessorKey: 'user_type',
            cell: ({ row }) => (
                <Badge variant={row.original.user_type === 'Admin' ? 'info' : 'gray'}>
                    {row.original.user_type}
                </Badge>
            )
        },
        {
            header: 'Status',
            accessorKey: 'is_active',
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? 'success' : 'error'}>
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </Badge>
            )
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-1.5"
                        onClick={() => handleEdit(row.original)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDeleteClick(row.original)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ], []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                    <p className="text-slate-500 text-sm italic">Manage system users and their permissions.</p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedUser(null);
                        setIsFormOpen(true);
                    }}
                    leftIcon={<Plus className="h-4 w-4" />}
                >
                    Add New User
                </Button>
            </div>

            <Card>
                <CardBody className="p-0">
                    <Table
                        columns={columns}
                        data={users}
                        isLoading={isLoading}
                    />
                </CardBody>
            </Card>

            {/* User Form Modal */}
            <UserForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                user={selectedUser}
                onSuccess={refetch}
            />

            {/* Delete Confirmation */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete User"
                message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default UserList;
