import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
    Plus,
    Search,
    MoreHorizontal,
    Trash2,
    Edit,
    ExternalLink
} from 'lucide-react';

import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Checkbox from '../../components/ui/Checkbox';
import Radio from '../../components/ui/Radio';
import Switch from '../../components/ui/Switch';
import FileUpload from '../../components/ui/FileUpload';
import ImageUpload from '../../components/ui/ImageUpload';
import DateTime from '../../components/ui/DateTime';
import Tooltip from '../../components/ui/Tooltip';
import ProgressBar from '../../components/ui/ProgressBar';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import Table from '../../components/ui/Table';
import BackButton from '../../components/ui/BackButton';

const ComponentLibrary = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Table Data
    const columns = [
        {
            header: 'Name',
            accessorKey: 'name',
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'Active' ? 'success' : 'warning'}>
                    {row.original.status}
                </Badge>
            ),
        },
        {
            header: 'Date Created',
            accessorKey: 'createdAt',
            cell: ({ row }) => <DateTime date={row.original.createdAt} variant="dateOnly" />,
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: () => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="p-1"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="p-1 text-red-500"><Trash2 className="h-4 w-4" /></Button>
                </div>
            ),
        },
    ];

    const data = [
        { id: 1, name: 'Project Alpha', status: 'Active', createdAt: '2023-10-01T10:00:00Z' },
        { id: 2, name: 'Module Beta', status: 'Pending', createdAt: '2023-11-15T14:30:00Z' },
        { id: 3, name: 'System Gamma', status: 'Active', createdAt: '2023-12-05T09:15:00Z' },
        { id: 4, name: 'Dashboard Delta', status: 'Pending', createdAt: '2024-01-20T16:45:00Z' },
    ];

    const initialValues = {
        username: '',
        description: '',
        notifications: true,
        role: 'user',
        agree: false,
        profilePic: null,
        resume: null,
    };

    const validationSchema = Yup.object({
        username: Yup.string().required('Required'),
        description: Yup.string().min(10, 'Too short'),
        role: Yup.string().required('Required'),
        agree: Yup.boolean().oneOf([true], 'Must agree'),
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 bg-[var(--bg-app)] min-h-screen">
            <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)]">UI Component Library</h1>
                    <p className="text-[var(--text-muted)]">Centralized UI components documentation and preview.</p>
                </div>
                <BackButton />
            </div>

            {/* Buttons */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-l-4 border-indigo-600 pl-3">Buttons & Badges</h2>
                <Card>
                    <CardBody className="flex flex-wrap gap-4 items-center">
                        <Button variant="primary">Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="danger">Danger</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="primary" isLoading>Loading</Button>
                        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>With Icon</Button>
                        <div className="h-8 w-px bg-[var(--border-main)] mx-2" />
                        <Badge variant="success">Success</Badge>
                        <Badge variant="error">Error</Badge>
                        <Badge variant="warning">Warning</Badge>
                        <Badge variant="info">Info</Badge>
                        <Badge variant="gray">Gray</Badge>
                    </CardBody>
                </Card>
            </section>

            {/* Alerts */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-l-4 border-indigo-600 pl-3">Alerts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Alert variant="success" title="Success Alert">Task completed successfully.</Alert>
                    <Alert variant="error" title="Error Alert">Something went wrong!</Alert>
                    <Alert variant="info" title="Info Alert">Documentation updated.</Alert>
                    <Alert variant="warning" title="Warning Alert" onClose={() => { }}>Please review settings.</Alert>
                </div>
            </section>

            {/* Formik Form */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-l-4 border-indigo-600 pl-3">Forms (Formik Integration)</h2>
                <Card>
                    <CardBody>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={(values) => console.log(values)}
                        >
                            <Form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Username" name="username" placeholder="Type here..." />
                                <Radio
                                    label="User Role"
                                    name="role"
                                    options={[
                                        { label: 'Admin', value: 'admin' },
                                        { label: 'User', value: 'user' },
                                    ]}
                                />
                                <TextArea label="Description" name="description" className="md:col-span-2" />
                                <div className="flex gap-10 items-center">
                                    <Switch label="Enable Notifications" name="notifications" />
                                    <Checkbox label="I agree to terms" name="agree" />
                                </div>
                                <ImageUpload label="Profile Picture" name="profilePic" />
                                <FileUpload label="Resume" name="resume" />
                                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                    <Button type="reset" variant="secondary">Reset</Button>
                                    <Button type="submit">Submit Form</Button>
                                </div>
                            </Form>
                        </Formik>
                    </CardBody>
                </Card>
            </section>

            {/* Utilities */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-l-4 border-indigo-600 pl-3">Utilities & Data</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader title="Dates & Progress" />
                        <CardBody className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <p className="text-sm text-[var(--text-muted)]">DateTime Formatting:</p>
                                <div className="flex gap-4">
                                    <DateTime date={new Date()} variant="full" />
                                    <DateTime date={new Date()} variant="relative" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-[var(--text-muted)]">Progress Indicators:</p>
                                <ProgressBar value={65} showValue variant="primary" />
                                <ProgressBar value={40} variant="success" />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-[var(--text-muted)]">Hover for info:</span>
                                <Tooltip content="This is a helpful tooltip message!">
                                    <ExternalLink className="h-4 w-4 text-primary-500" />
                                </Tooltip>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Modals & Dialogs" />
                        <CardBody className="flex gap-4">
                            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
                            <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>Open Confirm</Button>
                        </CardBody>
                    </Card>
                </div>
            </section>

            {/* Table */}
            <section className="space-y-4 pb-20">
                <h2 className="text-xl font-semibold border-l-4 border-indigo-600 pl-3">Data Tables</h2>
                <Card>
                    <Table columns={columns} data={data} />
                </Card>
            </section>

            {/* Modals */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Sample Modal"
            >
                <p>This is a portal-based modal without framer-motion. It handles body scroll locking and has a responsive design.</p>
                <div className="mt-6 flex justify-end">
                    <Button onClick={() => setIsModalOpen(false)}>Close</Button>
                </div>
            </Modal>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={() => {
                    alert('Confirmed!');
                    setIsConfirmOpen(false);
                }}
                message="Are you sure you want to delete this item? This action cannot be undone."
            />
        </div>
    );
};

export default ComponentLibrary;
