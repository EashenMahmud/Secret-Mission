import React, { useState, useMemo } from 'react';
import {
    useGetApiQuery,
    useDeleteApiMutation
} from '../../store/api/commonApi';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Plus, Edit, Trash2, Users, Building2, Mail, Phone, Globe, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import ClientForm from './VendorForm';
import ClientProfile from './ClientProfile';
import Tooltip from '../../components/ui/Tooltip';
import { Card, CardBody } from '../../components/ui/Card';

const ClientList = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [clientToView, setClientToView] = useState(null);
    const [page, setPage] = useState(0);

    // Fetch vendors
    const { data: response, isLoading, refetch } = useGetApiQuery({
        url: '/vendors',
        params: { page: page + 1 }
    });
    const [deleteVendor, { isLoading: isDeleting }] = useDeleteApiMutation();

    // Data handling based on common structure
    const clients = response?.data?.data || [];
    const paginationData = response?.data || {};

    const handleEdit = (client) => {
        setSelectedClient(client);
        setIsFormOpen(true);
    };

    const handleView = (client) => {
        setClientToView(client);
        setIsProfileModalOpen(true);
    };

    const handleDeleteClick = (client) => {
        setClientToDelete(client);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteVendor({ end_point: `/vendors/${clientToDelete.id}` }).unwrap();
            toast.success('Client deleted successfully');
            setIsDeleteModalOpen(false);
            setClientToDelete(null);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to delete client');
        }
    };

    const columns = useMemo(() => [
        {
            header: 'Client Name',
            accessorKey: 'name',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-500">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{row.original.name}</span>
                        <span className="text-xs text-slate-500">{row.original.company_name}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Contact Info',
            id: 'contact',
            cell: ({ row }) => (
                <div className="space-y-1">
                    {row.original.email && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Mail className="h-3 w-3 text-indigo-500" />
                            {row.original.email}
                        </div>
                    )}
                    {row.original.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Phone className="h-3 w-3 text-emerald-500" />
                            {row.original.phone}
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Location',
            id: 'location',
            cell: ({ row }) => (
                <div className="text-xs">
                    <div className="font-medium text-slate-900">{row.original.city || 'N/A'}</div>
                    <div className="text-slate-500">{row.original.country || ''}</div>
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
                    <Tooltip content="View Profile">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-1.5 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => handleView(row.original)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Edit Client">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={() => handleEdit(row.original)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Delete Client">
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
                    <h1 className="text-2xl font-bold text-white">Clients</h1>
                    <p className="text-slate-500 text-sm italic">Manage external partners and client accounts.</p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedClient(null);
                        setIsFormOpen(true);
                    }}
                    leftIcon={<Plus className="h-4 w-4" />}
                >
                    Add New Client
                </Button>
            </div>

            <Card>
                <CardBody className="p-3">
                    <Table
                        columns={columns}
                        data={clients}
                        isLoading={isLoading}
                        manualPagination={true}
                        pageCount={paginationData.last_page || 0}
                        currentPage={page}
                        onPageChange={setPage}
                        pageSize={paginationData.per_page || 10}
                    />
                </CardBody>
            </Card>

            <ClientProfile
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                client={clientToView}
            />

            <ClientForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                vendor={selectedClient}
                onSuccess={refetch}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Client"
                message={`Are you sure you want to delete ${clientToDelete?.name}? This action cannot be undone.`}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default ClientList;
