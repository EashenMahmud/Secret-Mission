import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Switch from '../../components/ui/Switch';
import Button from '../../components/ui/Button';
import { usePostApiMutation } from '../../store/api/commonApi';
import { toast } from 'react-toastify';
import { ListTodo, FileText } from 'lucide-react';

const typeSchema = Yup.object().shape({
    name: Yup.string().required('Type name is required'),
});

const ProjectTypeForm = ({ isOpen, onClose, type, onSuccess }) => {
    const isEditing = !!type;
    const [saveType, { isLoading }] = usePostApiMutation();

    const initialValues = {
        name: type?.name || '',
        is_active: type?.is_active ?? true,
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            if (isEditing) {
                await saveType({
                    end_point: `/update-project-type/${type.id}`,
                    body: values
                }).unwrap();
                toast.success('Project type updated successfully');
            } else {
                await saveType({
                    end_point: '/add-project-type',
                    body: values
                }).unwrap();
                toast.success('Project type created successfully');
            }
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to save project type');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit Project Type' : 'Add New Project Type'}
            size="md"
        >
            <Formik
                initialValues={initialValues}
                validationSchema={typeSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-6 pt-2">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4 border border-amber-100">
                                <ListTodo className="w-8 h-8 text-amber-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Type Configuration</h3>
                            <p className="text-xs text-slate-500 text-center mt-1">
                                Define the project category name and status.
                            </p>
                        </div>

                        <Input
                            label="Type Name"
                            name="name"
                            placeholder="e.g. Web Development, Maintenance"
                            required
                        />

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-900">Active Status</span>
                                <span className="text-xs text-slate-500">Enable or disable this type</span>
                            </div>
                            <Switch name="is_active" />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 -mx-6 px-6 -mb-6 pb-6 bg-slate-50 rounded-b-xl">
                            <Button variant="ghost" onClick={onClose} type="button">Discard</Button>
                            <Button type="submit" isLoading={isSubmitting || isLoading} className="px-8">
                                {isEditing ? 'Update Type' : 'Create Type'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default ProjectTypeForm;
