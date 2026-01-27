import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import TextArea from '../../../components/ui/TextArea';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Checkbox from '../../../components/ui/Checkbox';
import { usePostApiMutation } from '../../../store/api/commonApi';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
    planning_type_id: Yup.number().nullable().required('Planning type is required'),
    description: Yup.string(),
    start_date: Yup.string().required('Start date is required'),
    end_date: Yup.string().required('End date is required'),
    exclude_weekends: Yup.boolean(),
    exclude_holidays: Yup.boolean(),
    progress: Yup.number().min(0).max(100),
    status: Yup.string(),
});

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
];

const ProjectPlanningFormModal = ({ isOpen, onClose, projectId, planningTypes = [], onSuccess, editItem = null }) => {
    const isEdit = !!editItem;
    const [postApi, { isLoading }] = usePostApiMutation();

    const planningTypeOptions = (planningTypes || []).map((t) => ({ value: t.id, label: t.name || t.title }));

    const initialValues = isEdit
        ? {
              planning_type_id: editItem.planning_type_id ?? null,
              description: editItem.description ?? '',
              start_date: editItem.start_date ? new Date(editItem.start_date).toISOString().split('T')[0] : '',
              end_date: editItem.end_date ? new Date(editItem.end_date).toISOString().split('T')[0] : '',
              exclude_weekends: editItem.exclude_weekends ?? true,
              exclude_holidays: editItem.exclude_holidays ?? true,
              progress: editItem.progress != null ? Number(editItem.progress) : 0,
              status: editItem.status ?? 'pending',
          }
        : {
              planning_type_id: null,
              description: '',
              start_date: '',
              end_date: '',
              exclude_weekends: true,
              exclude_holidays: true,
              progress: 0,
              status: 'pending',
          };

    const buildPayload = (values) => ({
        project_id: String(projectId),
        planning_type_id: values.planning_type_id != null ? String(values.planning_type_id) : '',
        description: String(values.description ?? ''),
        start_date: values.start_date,
        end_date: values.end_date,
        exclude_weekends: !!values.exclude_weekends,
        exclude_holidays: !!values.exclude_holidays,
        progress: String(values.progress ?? 0),
        status: values.status ?? 'pending',
    });

    const handleSubmit = async (values) => {
        try {
            const body = buildPayload(values);
            if (isEdit) {
                await postApi({
                    end_point: `/update-project-planning/${editItem.id}`,
                    body,
                }).unwrap();
                toast.success('Planning item updated');
            } else {
                await postApi({
                    end_point: '/add-project-planning',
                    body,
                }).unwrap();
                toast.success('Planning item added');
            }
            onSuccess?.();
            onClose();
        } catch (e) {
            toast.error(e?.data?.message || (isEdit ? 'Failed to update' : 'Failed to add'));
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit planning' : 'Add planning item'} size="lg">
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4">
                        <Select
                            name="planning_type_id"
                            label="Planning type"
                            options={planningTypeOptions}
                            placeholder="Select type"
                            required
                        />
                        <TextArea
                            name="description"
                            label="Description"
                            placeholder="Describe this phase or milestone"
                            rows={2}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input name="start_date" label="Start date" type="date" required />
                            <Input name="end_date" label="End date" type="date" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                name="progress"
                                label="Progress (%)"
                                type="number"
                                min={0}
                                max={100}
                            />
                            <Select
                                name="status"
                                label="Status"
                                options={STATUS_OPTIONS}
                                placeholder="Status"
                            />
                        </div>
                        <div className="flex gap-6">
                            <Checkbox name="exclude_weekends" label="Exclude weekends" />
                            <Checkbox name="exclude_holidays" label="Exclude holidays" />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" isLoading={isSubmitting || isLoading}>
                                {isEdit ? 'Update' : 'Add'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default ProjectPlanningFormModal;
