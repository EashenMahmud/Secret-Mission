import React from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Switch from '../../components/ui/Switch';
import Button from '../../components/ui/Button';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import {
    usePostApiMutation
} from '../../store/api/commonApi';

const planningTypeSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    is_active: Yup.boolean()
});

const PlanningTypeModal = ({ isOpen, onClose, planningType, onSuccess }) => {
    const isEditing = !!planningType;
    const [createType, { isLoading: isCreating }] = usePostApiMutation();
    const [updateType, { isLoading: isUpdating }] = usePostApiMutation();

    const initialValues = {
        name: planningType?.name || '',
        description: planningType?.description || '',
        is_active: planningType?.is_active ?? true
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            if (isEditing) {
                await updateType({
                    end_point: `/update-planning-types/${planningType.id}`,
                    body: values
                }).unwrap();
                toast.success('Planning type updated successfully');
            } else {
                await createType({
                    end_point: '/add-planning-types',
                    body: values
                }).unwrap();
                toast.success('Planning type created successfully');
            }
            
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to save planning type');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit Planning Type' : 'Add New Planning Type'}
            size="md"
        >
            <Formik
                initialValues={initialValues}
                validationSchema={planningTypeSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4">
                        <Input
                            label="Type Name"
                            name="name"
                            placeholder="Enter planning type name"
                            required
                        />
                        
                        <TextArea
                            label="Description"
                            name="description"
                            placeholder="Enter description"
                            rows={3}
                            required
                        />

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Active Status</span>
                            <Switch name="is_active" />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                type="button"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={isSubmitting || isCreating || isUpdating}
                            >
                                {isEditing ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default PlanningTypeModal;