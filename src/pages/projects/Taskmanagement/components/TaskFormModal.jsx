import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Modal from '../../../../components/ui/Modal';
import Input from '../../../../components/ui/Input';
import TextArea from '../../../../components/ui/TextArea';
import Select from '../../../../components/ui/Select';
import Button from '../../../../components/ui/Button';
import { usePostApiMutation } from '../../../../store/api/commonApi';
import { toast } from 'react-toastify';

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'in_review', label: 'In Review' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' },
];

const PRIORITY_OPTIONS = [
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
];

const validationSchema = Yup.object({
    title: Yup.string().required('Title is required').max(255, 'Title is too long'),
    description: Yup.string(),
    status: Yup.string().required('Status is required'),
    priority: Yup.string().required('Priority is required'),
    start_date: Yup.string(),
    deadline: Yup.string(),
    progress: Yup.number().min(0, 'Progress must be at least 0').max(100, 'Progress cannot exceed 100'),
});

const TaskFormModal = ({
    isOpen,
    onClose,
    projectId,
    projectModuleId,
    task = null,
    onSuccess
}) => {
    const isEdit = !!task;
    const [postApi, { isLoading }] = usePostApiMutation();

    const initialValues = isEdit
        ? {
            title: task.title || '',
            description: task.description || '',
            status: task.status || 'draft',
            priority: task.priority || 'Medium',
            start_date: task.start_date ? new Date(task.start_date).toISOString().split('T')[0] : '',
            deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
            progress: task.progress ?? 0,
        }
        : {
            title: '',
            description: '',
            status: 'draft',
            priority: 'Medium',
            start_date: '',
            deadline: '',
            progress: 0,
        };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const payload = {
                project_id: String(projectId),
                project_module_id: String(projectModuleId),
                title: values.title,
                description: values.description || '',
                status: values.status,
                priority: values.priority,
                start_date: values.start_date || '',
                deadline: values.deadline || '',
                progress: Number(values.progress) || 0,
            };

            if (isEdit) {
                await postApi({
                    end_point: `/update-task/${task.id}`,
                    body: payload,
                }).unwrap();
                toast.success('Task updated successfully');
            } else {
                await postApi({
                    end_point: '/add-task',
                    body: payload,
                }).unwrap();
                toast.success('Task created successfully');
            }
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Task form error:', error);
            toast.error(error?.data?.message || (isEdit ? 'Failed to update task' : 'Failed to create task'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Edit Task' : 'Create New Task'}
            size="lg"
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-5">
                        {/* Title */}
                        <Input
                            name="title"
                            label="Task Title"
                            placeholder="Enter task title..."
                            required
                        />

                        {/* Description */}
                        <TextArea
                            name="description"
                            label="Description"
                            placeholder="Describe the task in detail..."
                            rows={4}
                        />

                        {/* Status and Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                name="status"
                                label="Status"
                                options={STATUS_OPTIONS}
                                placeholder="Select status"
                                required
                            />
                            <Select
                                name="priority"
                                label="Priority"
                                options={PRIORITY_OPTIONS}
                                placeholder="Select priority"
                                required
                            />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                name="start_date"
                                label="Start Date"
                                type="date"
                            />
                            <Input
                                name="deadline"
                                label="Deadline"
                                type="date"
                            />
                        </div>

                        {/* Progress */}
                        <Input
                            name="progress"
                            label="Progress (%)"
                            type="number"
                            min={0}
                            max={100}
                            placeholder="0"
                        />

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-main)]">
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
                                {isEdit ? 'Update Task' : 'Create Task'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default TaskFormModal;
