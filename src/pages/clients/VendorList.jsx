import React, { useState, useMemo } from 'react';
import {
    useGetApiQuery,
    useDeleteApiMutation
} from '../../store/api/commonApi';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Plus, Edit, Trash2, Users, Building2, Mail, Phone, Globe } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import VendorForm from './VendorForm';
import { Card, CardBody } from '../../components/ui/Card';

const VendorList = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [vendorToDelete, setVendorToDelete] = useState(null);
    const [page, setPage] = useState(0);

    // Fetch vendors
    const { data: response, isLoading, refetch } = useGetApiQuery({
        url: '/vendors',
        params: { page: page + 1 }
    });
    const [deleteVendor, { isLoading: isDeleting }] = useDeleteApiMutation();

    // Data handling based on common structure
    const vendors = response?.data?.data || [];
    const paginationData = response?.data?.meta || response || {};

    const handleEdit = (vendor) => {
        setSelectedVendor(vendor);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (vendor) => {
        setVendorToDelete(vendor);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteVendor({ end_point: `/vendors/${vendorToDelete.id}` }).unwrap();
            toast.success('Vendor deleted successfully');
            setIsDeleteModalOpen(false);
            setVendorToDelete(null);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to delete vendor');
        }
    };

    const columns = useMemo(() => [
        {
            header: 'Vendor Name',
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
                <Badge variant={row.original.is_active ? 'success' : 'gray'}>
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
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        onClick={() => handleEdit(row.original)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50"
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
                    <h1 className="text-2xl font-bold text-slate-900">Clients & Vendors</h1>
                    <p className="text-slate-500 text-sm italic">Manage external partners and vendor accounts.</p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedVendor(null);
                        setIsFormOpen(true);
                    }}
                    leftIcon={<Plus className="h-4 w-4" />}
                >
                    Add New Client
                </Button>
            </div>

            <Card>
                <CardBody className="p-0">
                    <Table
                        columns={columns}
                        data={vendors}
                        isLoading={isLoading}
                        manualPagination={true}
                        pageCount={paginationData.last_page || 0}
                        currentPage={page}
                        onPageChange={setPage}
                        pageSize={paginationData.per_page || 10}
                    />
                </CardBody>
            </Card>

            <VendorForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                vendor={selectedVendor}
                onSuccess={refetch}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Vendor"
                message={`Are you sure you want to delete ${vendorToDelete?.name}? This action cannot be undone.`}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default VendorList;
