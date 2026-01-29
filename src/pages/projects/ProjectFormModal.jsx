import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import {
    usePostApiMutation,
    useUpdateApiJsonMutation,
    useGetApiQuery,
    useGetApiWithIdQuery
} from '../../store/api/commonApi';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
    name: Yup.string().required('Project name is required'),
    description: Yup.string(),
    project_type_id: Yup.number().required('Project type is required'),
    vendor_id: Yup.number().nullable(),
    priority: Yup.string(),
    start_date: Yup.date().nullable(),
    end_date: Yup.date().nullable(),
    onhold_postponed_date: Yup.date().nullable(),
    status: Yup.string(),
    progress: Yup.number().min(0).max(100),
    is_archived: Yup.boolean(),
});

const ProjectFormModal = ({ isOpen, onClose, projectId = null, onSuccess, mode = 'create' }) => {
    // mode can be 'create' or 'edit'
    const isEditMode = mode === 'edit' && projectId;

    // Fetch project details if in edit mode
    const { data: projectResponse, isLoading: isLoadingProject } = useGetApiWithIdQuery(
        { url: '/projects', id: projectId },
        { skip: !isOpen || !isEditMode }
    );

    // Fetch vendors and project types
    const { data: vendorsResponse, isLoading: isLoadingVendors } = useGetApiQuery(
        { url: '/vendors' },
        { skip: !isOpen }
    );
    const { data: projectTypesResponse, isLoading: isLoadingProjectTypes } = useGetApiQuery(
        { url: '/open/get-project-type-list' },
        { skip: !isOpen }
    );

    const [createProject, { isLoading: isCreating }] = usePostApiMutation();
    const [updateProject, { isLoading: isUpdating }] = useUpdateApiJsonMutation();

    const project = projectResponse?.data;
    const vendors = vendorsResponse?.data?.data || [];
    const projectTypes = (projectTypesResponse?.data || []).filter(type => type.is_active !== false);

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

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Prepare initial values - wait for project data in edit mode
    const getInitialValues = () => {
        if (isEditMode) {
            // In edit mode, only return values when project data is loaded
            if (!project) {
                return null; // Return null to indicate data is still loading
            }
            return {
                name: project.name || '',
                description: project.description || '',
                // Keep as numbers to match option values (not strings)
                project_type_id: project.project_type_id || null,
                vendor_id: project.vendor_id || null,
                priority: project.priority || 'medium',
                start_date: formatDateForInput(project.start_date),
                end_date: formatDateForInput(project.end_date),
                onhold_postponed_date: formatDateForInput(project.onhold_postponed_date),
                status: project.status || 'pending',
                progress: project.progress || 0,
                is_archived: project.is_archived || false,
            };
        }
        // Create mode - return default empty values
        return {
            name: '',
            description: '',
            project_type_id: null,
            vendor_id: null,
            priority: 'medium',
            start_date: '',
            end_date: '',
            onhold_postponed_date: '',
            status: 'pending',
            progress: 0,
            is_archived: false,
        };
    };

    const initialValues = getInitialValues();

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            // Clean up the data - remove empty strings
            const cleanedValues = Object.entries(values).reduce((acc, [key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            if (isEditMode) {
                // Update existing project
                await updateProject({
                    end_point: `/projects/${projectId}`,
                    body: cleanedValues
                }).unwrap();
                toast.success('Project updated successfully!');
            } else {
                // Create new project
                await createProject({
                    end_point: '/projects',
                    body: cleanedValues
                }).unwrap();
                toast.success('Project created successfully!');
                resetForm();
            }

            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} project`);
        } finally {
            setSubmitting(false);
        }
    };

    // Show loading state when fetching data
    const isLoadingData = isEditMode
        ? (isLoadingProject || !project || isLoadingVendors || isLoadingProjectTypes)
        : (isLoadingVendors || isLoadingProjectTypes);

    if (isLoadingData) {
        return (
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={isEditMode ? 'Edit Project' : 'Create New Project'}
                size="lg"
            >
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-[var(--bg-app)] rounded"></div>
                    <div className="h-10 bg-[var(--bg-app)] rounded"></div>
                    <div className="h-20 bg-[var(--bg-app)] rounded"></div>
                </div>
            </Modal>
        );
    }

    // Don't render form if initialValues is null (data still loading in edit mode)
    if (initialValues === null) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? 'Edit Project' : 'Create New Project'}
            size="lg"
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
                key={isEditMode ? project?.id : 'create'}
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
                                disabled={isSubmitting || isCreating || isUpdating}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={isSubmitting || isCreating || isUpdating}
                            >
                                {isEditMode ? 'Update Project' : 'Create Project'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default ProjectFormModal;
