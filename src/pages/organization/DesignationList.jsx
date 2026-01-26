import React, { useState, useMemo } from 'react';
import {
    useGetApiQuery,
} from '../../store/api/commonApi';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Tooltip from '../../components/ui/Tooltip';
import { Plus, Edit, Trash2, Briefcase } from 'lucide-react';
import DesignationForm from './DesignationForm';
import { Card, CardBody } from '../../components/ui/Card';

const DesignationList = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDesig, setSelectedDesig] = useState(null);

    // Fetch designations
    const { data: response, isLoading, refetch } = useGetApiQuery({
        url: '/open/get-designation-list'
    });

    const desigs = response?.data || [];

    const handleEdit = (desig) => {
        setSelectedDesig(desig);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (desig) => {
        alert('Delete endpoint for designations is not documented in Swagger.');
    };

    const columns = useMemo(() => [
        {
            header: 'Designation',
            accessorKey: 'name',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-500">
                        <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{row.original.name}</span>
                        <span className="text-xs text-slate-400">ID: {row.original.id}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Code',
            accessorKey: 'code',
            cell: ({ row }) => (
                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                    {row.original.code}
                </span>
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
                    <Tooltip content="Edit Designation">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={() => handleEdit(row.original)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Delete Designation">
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
                    <h1 className="text-2xl font-bold text-white">Designations</h1>
                    <p className="text-slate-500 text-sm italic">Manage job titles and roles within the organization.</p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedDesig(null);
                        setIsFormOpen(true);
                    }}
                    leftIcon={<Plus className="h-4 w-4" />}
                >
                    Add Designation
                </Button>
            </div>

            <Card>
                <CardBody className="p-3">
                    <Table
                        columns={columns}
                        data={desigs}
                        isLoading={isLoading}
                        pagination={false}
                    />
                </CardBody>
            </Card>

            <DesignationForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                designation={selectedDesig}
                onSuccess={refetch}
            />
        </div>
    );
};

export default DesignationList;
