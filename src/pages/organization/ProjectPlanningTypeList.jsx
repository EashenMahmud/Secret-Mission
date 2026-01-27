import React, { useState, useMemo } from 'react';
import { useGetApiQuery, usePostApiMutation } from '../../store/api/commonApi';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Plus, Edit, Eye, Trash2 } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import PlanningTypeModal from './PlanningTypeModal';
import PlanningTypeDetailsModal from './PlanningTypeDetailsModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { toast } from 'react-toastify';

const ProjectPlanningTypeList = () => {
    const [page, setPage] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [typeToView, setTypeToView] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState(null);

    // Fetch project planning types
    const { data: response, isLoading, refetch } = useGetApiQuery({
        url: '/planning-type-list',
        params: { page: page + 1 }
    });

    const [deleteType, { isLoading: isDeleting }] = usePostApiMutation();

    const planningTypes = response?.data || [];
    const paginationData = response || {};

    const handleEdit = (type) => {
        setSelectedType(type);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedType(null);
        setIsModalOpen(true);
    };

    const handleView = (type) => {
        setTypeToView(type);
        setIsDetailsModalOpen(true);
    };

    const handleDeleteClick = (type) => {
        setTypeToDelete(type);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteType({
                end_point: `/delete-planning-types/${typeToDelete.id}`,
                body: {}
            }).unwrap();
            toast.success('Planning type deleted successfully');
            setIsDeleteModalOpen(false);
            setTypeToDelete(null);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to delete planning type');
        }
    };

    const columns = useMemo(() => [
        {
            header: 'Type Name',
            accessorKey: 'name',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{row.original.name}</span>
                    {row.original.description && (
                        <span className="text-xs text-slate-500">{row.original.description}</span>
                    )}
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
            header: 'Created',
            accessorKey: 'created_at',
            cell: ({ row }) => (
                <div className="text-sm text-slate-600">
                    {row.original.created_at ? 
                        new Date(row.original.created_at).toLocaleDateString() : 
                        'N/A'
                    }
                </div>
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
                        className="p-1.5 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => handleView(row.original)}
                        title="View Details"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-1.5"
                        onClick={() => handleEdit(row.original)}
                        title="Edit Type"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDeleteClick(row.original)}
                        title="Delete Type"
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
                    <h1 className="text-2xl font-bold text-white">Project Planning Types</h1>
                    <p className="text-slate-500 text-sm italic">Manage different types of project planning methodologies.</p>
                </div>
                <Button
                    onClick={handleAdd}
                    leftIcon={<Plus className="h-4 w-4" />}
                >
                    Add New Type
                </Button>
            </div>

            <Card>
                <CardBody className="p-3">
                    <Table
                        columns={columns}
                        data={planningTypes}
                        isLoading={isLoading}
                        manualPagination={true}
                        pageCount={paginationData.last_page || 0}
                        currentPage={page}
                        onPageChange={setPage}
                        pageSize={paginationData.per_page || 10}
                    />
                </CardBody>
            </Card>

            {/* Details Modal */}
            <PlanningTypeDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                planningType={typeToView}
            />

            {/* Create/Edit Modal */}
            <PlanningTypeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                planningType={selectedType}
                onSuccess={refetch}
            />

            {/* Delete Confirmation */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Planning Type"
                message={`Are you sure you want to delete "${typeToDelete?.name}"? This action cannot be undone.`}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default ProjectPlanningTypeList;