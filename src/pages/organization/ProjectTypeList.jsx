import React, { useState, useMemo } from 'react';
import {
    useGetApiQuery,
    useDeleteApiMutation
} from '../../store/api/commonApi';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Tooltip from '../../components/ui/Tooltip';
import { Plus, Edit, Trash2, ListTodo } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import ProjectTypeForm from './ProjectTypeForm';
import { Card, CardBody } from '../../components/ui/Card';

const ProjectTypeList = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState(null);
    const [page, setPage] = useState(0);

    // Fetch planning types (Project Types)
    const { data: response, isLoading, refetch } = useGetApiQuery({
        url: '/open/get-project-type-list',
        params: { page: page + 1 }
    });
    const [deleteType, { isLoading: isDeleting }] = useDeleteApiMutation();

    const types = response?.data || [];
    const paginationData = response?.data || {};

    const handleEdit = (type) => {
        setSelectedType(type);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (type) => {
        setTypeToDelete(type);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteType({ end_point: `/delete-planning-types/${typeToDelete.id}` }).unwrap();
            toast.success('Project type deleted successfully');
            setIsDeleteModalOpen(false);
            setTypeToDelete(null);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to delete project type');
        }
    };

    const columns = useMemo(() => [
        {
            header: 'Type Name',
            accessorKey: 'name',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100 text-amber-500">
                        <ListTodo className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{row.original.name}</span>
                        <span className="text-xs text-slate-400">ID: {row.original.id}</span>
                    </div>
                </div>
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
                    <Tooltip content="Edit Type">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={() => handleEdit(row.original)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Delete Type">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteClick(row.original)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </Tooltip>
                </div>
            )
        }
    ], []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Project Types</h1>
                    <p className="text-slate-500 text-sm italic">Define different categories for your projects.</p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedType(null);
                        setIsFormOpen(true);
                    }}
                    leftIcon={<Plus className="h-4 w-4" />}
                >
                    Add New Type
                </Button>
            </div>

            <Card>
                <CardBody className="p-3">
                    <Table
                        columns={columns}
                        data={types}
                        isLoading={isLoading}
                        manualPagination={true}
                        pageCount={paginationData.last_page || 0}
                        currentPage={page}
                        onPageChange={setPage}
                        pageSize={paginationData.per_page || 10}
                    />
                </CardBody>
            </Card>

            <ProjectTypeForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                type={selectedType}
                onSuccess={refetch}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Project Type"
                message={`Are you sure you want to delete ${typeToDelete?.name}? This action cannot be undone.`}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default ProjectTypeList;
