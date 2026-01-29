import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import TextArea from '../../../components/ui/TextArea';
import Select from '../../../components/ui/Select';
import Checkbox from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import { usePostApiMutation } from '../../../store/api/commonApi';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
    name: Yup.string().required('Module name is required'),
    description: Yup.string(),
    estimated_days: Yup.number().min(0, 'Estimated days must be 0 or greater').required('Estimated days is required'),
    status: Yup.string(),
    is_completed: Yup.boolean(),
    completed_at: Yup.string().nullable(),
});

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
];

const ProjectModuleFormModal = ({ isOpen, onClose, projectId, module = null, onSuccess }) => {
    const isEdit = !!module;
    const [postApi, { isLoading }] = usePostApiMutation();

    const initialValues = isEdit
        ? {
              name: module.name || '',
              description: module.description || '',
              estimated_days: module.estimated_days || 0,
              status: module.status || 'pending',
              is_completed: module.is_completed || false,
              completed_at: module.completed_at ? new Date(module.completed_at).toISOString().split('T')[0] : '',
          }
        : {
              name: '',
              description: '',
              estimated_days: 0,
              status: 'pending',
              is_completed: false,
              completed_at: '',
          };

    const buildPayload = (values) => {
        const payload = {
            name: String(values.name ?? ''),
            description: String(values.description ?? ''),
            estimated_days: Number(values.estimated_days ?? 0),
            status: values.status || 'pending',
            is_completed: values.is_completed || false,
        };

        // Only include completed_at if is_completed is true
        if (values.is_completed && values.completed_at) {
            payload.completed_at = values.completed_at;
        } else if (values.is_completed && !values.completed_at) {
            // If completed but no date, set today's date
            payload.completed_at = new Date().toISOString().split('T')[0];
        } else {
            payload.completed_at = null;
        }

        return payload;
    };

    const handleSubmit = async (values) => {
        try {
            const body = buildPayload(values);

            if (isEdit) {
                // Update using POST method
                await postApi({
                    end_point: `/update-project-module/${module.id}`,
                    body,
                }).unwrap();
                toast.success('Module updated successfully');
            } else {
                // Create new module
                await postApi({
                    end_point: '/add-project-module',
                    body: {
                        ...body,
                        project_id: String(projectId),
                    },
                }).unwrap();
                toast.success('Module added successfully');
            }

            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || (isEdit ? 'Failed to update module' : 'Failed to add module'));
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Module' : 'Add Module'} size="lg">
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, isSubmitting, setFieldValue }) => (
                    <Form className="space-y-4">
                        <Input
                            name="name"
                            label="Module Name"
                            placeholder="Enter module name"
                            required
                        />

                        <TextArea
                            name="description"
                            label="Description"
                            placeholder="Describe this module"
                            rows={3}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                name="estimated_days"
                                label="Estimated Days"
                                type="number"
                                min={0}
                                required
                            />
                            <Select
                                name="status"
                                label="Status"
                                options={STATUS_OPTIONS}
                                placeholder="Select status"
                            />
                        </div>

                        <div className="space-y-3">
                            <Checkbox
                                name="is_completed"
                                label="Mark as completed"
                            />
                            {values.is_completed && (
                                <Input
                                    name="completed_at"
                                    label="Completed Date"
                                    type="date"
                                />
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-main)]">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting || isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" isLoading={isSubmitting || isLoading}>
                                {isEdit ? 'Update' : 'Add'} Module
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default ProjectModuleFormModal;
