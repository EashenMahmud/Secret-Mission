import React, { useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { usePostApiMutation, useGetApiQuery } from '../../store/api/commonApi';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
    name: Yup.string().required('Project name is required'),
    description: Yup.string(),
    project_type_id: Yup.string().required('Project type is required'),
    vendor_id: Yup.string(),
    priority: Yup.string(),
    start_date: Yup.date(),
    end_date: Yup.date(),
    onhold_postponed_date: Yup.date().nullable(),
    status: Yup.string(),
    progress: Yup.number().min(0).max(100),
    is_archived: Yup.boolean(),
});

const CreateProjectModal = ({ isOpen, onClose, onSuccess }) => {
    // Fetch vendors and project types
    const { data: vendorsResponse } = useGetApiQuery(
        { url: '/vendors' },
        { skip: !isOpen }
    );
    const { data: projectTypesResponse } = useGetApiQuery(
        { url: '/project-types' },
        { skip: !isOpen }
    );

    const [createProject, { isLoading }] = usePostApiMutation();

    const vendors = vendorsResponse?.data?.data || [];
    const projectTypes = projectTypesResponse?.data?.data || [];

    const vendorOptions = vendors.map(vendor => ({
        value: vendor.id,
        label: vendor.name
    }));

    const projectTypeOptions = projectTypes.map(type => ({
        value: type.id,
        label: type.name
    }));

    const priorityOptions = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
    ];

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'on_hold', label: 'On Hold' },
    ];

    const initialValues = {
        name: '',
        description: '',
        project_type_id: '',
        vendor_id: '',
        priority: 'medium',
        start_date: '',
        end_date: '',
        onhold_postponed_date: '',
        status: 'pending',
        progress: 0,
        is_archived: false,
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            // Clean up the data - remove empty strings and format dates
            const cleanedValues = Object.entries(values).reduce((acc, [key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            await createProject({
                end_point: '/projects',
                body: cleanedValues
            }).unwrap();

            toast.success('Project created successfully!');
            resetForm();
            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to create project');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Project"
            size="lg"
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                name="name"
                                label="Project Name"
                                placeholder="Enter project name"
                                required
                            />

                            <Select
                                name="project_type_id"
                                label="Project Type"
                                options={projectTypeOptions}
                                placeholder="Select project type"
                                required
                            />
                        </div>

                        <TextArea
                            name="description"
                            label="Description"
                            placeholder="Enter project description"
                            rows={3}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                name="vendor_id"
                                label="Vendor"
                                options={vendorOptions}
                                placeholder="Select vendor"
                            />

                            <Select
                                name="priority"
                                label="Priority"
                                options={priorityOptions}
                                placeholder="Select priority"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                name="start_date"
                                label="Start Date"
                                type="date"
                            />

                            <Input
                                name="end_date"
                                label="End Date"
                                type="date"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                name="status"
                                label="Status"
                                options={statusOptions}
                                placeholder="Select status"
                            />

                            <Input
                                name="progress"
                                label="Progress (%)"
                                type="number"
                                min="0"
                                max="100"
                            />
                        </div>

                        <Input
                            name="onhold_postponed_date"
                            label="On Hold/Postponed Date"
                            type="date"
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting || isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={isSubmitting || isLoading}
                            >
                                Create Project
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default CreateProjectModal;
