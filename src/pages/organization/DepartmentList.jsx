import React, { useState, useMemo } from 'react';
import {
    useGetApiQuery,
} from '../../store/api/commonApi';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Tooltip from '../../components/ui/Tooltip';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import DepartmentForm from './DepartmentForm';
import { Card, CardBody } from '../../components/ui/Card';

const DepartmentList = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);

    // Fetch departments
    const { data: response, isLoading, refetch } = useGetApiQuery({
        url: '/open/get-department-list'
    });

    const depts = response?.data || [];

    const handleEdit = (dept) => {
        setSelectedDept(dept);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (dept) => {
        alert('Delete endpoint for departments is not documented in Swagger.');
    };

    const columns = useMemo(() => [
        {
            header: 'Department',
            accessorKey: 'name',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-500">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-[var(--text-main)]">{row.original.name}</span>
                        <span className="text-xs text-[var(--text-muted)]">ID: {row.original.id}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Code',
            accessorKey: 'code',
            cell: ({ row }) => (
                <span className="font-mono text-xs bg-[var(--bg-app)] px-2 py-1 rounded text-[var(--text-main)] border border-[var(--border-main)]">
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
                    <Tooltip content="Edit Department">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={() => handleEdit(row.original)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Delete Department">
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
                    <h1 className="text-2xl font-bold text-[var(--text-main)]">Departments</h1>
                    <p className="text-[var(--text-muted)] text-sm italic">Manage your organization's structural units.</p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedDept(null);
                        setIsFormOpen(true);
                    }}
                    leftIcon={<Plus className="h-4 w-4" />}
                >
                    Add Department
                </Button>
            </div>

            <Card>
                <CardBody className="p-3">
                    <Table
                        columns={columns}
                        data={depts}
                        isLoading={isLoading}
                        pagination={false}
                    />
                </CardBody>
            </Card>

            <DepartmentForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                department={selectedDept}
                onSuccess={refetch}
            />
        </div>
    );
};

export default DepartmentList;
