import React, { useEffect } from 'react';
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

const ProjectFormModal = ({ isOpen, onClose, projectId = null, onSuccess, mode = 'create' }) => {
    // mode can be 'create' or 'edit'
    const isEditMode = mode === 'edit' && projectId;

    // Fetch project details if in edit mode
    const { data: projectResponse, isLoading: isLoadingProject } = useGetApiWithIdQuery(
        { url: '/projects', id: projectId },
        { skip: !isOpen || !isEditMode }
    );

    // Fetch vendors and project types
    const { data: vendorsResponse } = useGetApiQuery(
        { url: '/vendors' },
        { skip: !isOpen }
    );
    const { data: projectTypesResponse } = useGetApiQuery(
        { url: '/project-types' },
        { skip: !isOpen }
    );

    const [createProject, { isLoading: isCreating }] = usePostApiMutation();
    const [updateProject, { isLoading: isUpdating }] = useUpdateApiJsonMutation();

    const project = projectResponse?.data;
    const vendors = vendorsResponse?.data?.data || [];
    const projectTypes = projectTypesResponse?.data?.data || [];

    // Dummy options as fallback
    const dummyProjectTypes = [
        { id: 1, name: 'Web Application Development' },
        { id: 2, name: 'Mobile App Development' },
        { id: 3, name: 'Desktop Application' },
        { id: 4, name: 'API Development' },
        { id: 5, name: 'E-commerce Platform' },
        { id: 6, name: 'CMS Development' },
        { id: 7, name: 'SaaS Application' },
        { id: 8, name: 'Enterprise Software' },
        { id: 9, name: 'Microservices Architecture' },
        { id: 10, name: 'Cloud Infrastructure' },
    ];

    const dummyVendors = [
        { id: 1, name: 'BacBon Ltd' },
        { id: 2, name: 'Tech Solutions Inc' },
        { id: 3, name: 'Digital Innovations' },
        { id: 4, name: 'Software Partners' },
        { id: 5, name: 'Code Crafters' },
    ];

    // Use API data if available, otherwise use dummy data
    const vendorOptions = (vendors.length > 0 ? vendors : dummyVendors).map(vendor => ({
        value: vendor.id,
        label: vendor.name
    }));

    const projectTypeOptions = (projectTypes.length > 0 ? projectTypes : dummyProjectTypes).map(type => ({
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

    const initialValues = isEditMode && project ? {
        name: project.name || '',
        description: project.description || '',
        project_type_id: project.project_type_id?.toString() || '',
        vendor_id: project.vendor_id?.toString() || '',
        priority: project.priority || 'medium',
        start_date: formatDateForInput(project.start_date),
        end_date: formatDateForInput(project.end_date),
        onhold_postponed_date: formatDateForInput(project.onhold_postponed_date),
        status: project.status || 'pending',
        progress: project.progress || 0,
        is_archived: project.is_archived || false,
    } : {
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

    if (isEditMode && isLoadingProject) {
        return (
            <Modal 
                isOpen={isOpen} 
                onClose={onClose} 
                title={isEditMode ? 'Edit Project' : 'Create New Project'} 
                size="lg"
            >
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-slate-200 rounded"></div>
                    <div className="h-10 bg-slate-200 rounded"></div>
                    <div className="h-20 bg-slate-200 rounded"></div>
                </div>
            </Modal>
        );
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
                enableReinitialize
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
