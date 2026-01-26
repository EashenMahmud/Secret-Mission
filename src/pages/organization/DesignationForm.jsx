import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Switch from '../../components/ui/Switch';
import Button from '../../components/ui/Button';
import { usePostApiMutation } from '../../store/api/commonApi';
import { Briefcase } from 'lucide-react';
import { toast } from 'react-toastify';

const designationSchema = Yup.object().shape({
    name: Yup.string().required('Designation name is required'),
    code: Yup.string().required('Designation code is required'),
});

const DesignationForm = ({ isOpen, onClose, designation, onSuccess }) => {
    const isEditing = !!designation;
    const [saveDesignation, { isLoading }] = usePostApiMutation();

    const initialValues = {
        name: designation?.name || '',
        code: designation?.code || '',
        is_active: designation?.is_active ?? true,
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const body = {
                ...values,
                is_active: values.is_active ? 1 : 0
            };

            if (isEditing) {
                await saveDesignation({
                    end_point: `/update-designation/${designation.id}`,
                    body: body
                }).unwrap();
                toast.success('Designation updated successfully');
            } else {
                await saveDesignation({
                    end_point: '/add-designation',
                    body: body
                }).unwrap();
                toast.success('Designation created successfully');
            }
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to save designation');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit Designation' : 'Add New Designation'}
            size="md"
        >
            <Formik
                initialValues={initialValues}
                validationSchema={designationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-6 pt-2">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 border border-emerald-100">
                                <Briefcase className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Designation Details</h3>
                            <p className="text-xs text-slate-500 text-center mt-1">
                                Define the role title and identification code.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Designation Name"
                                name="name"
                                placeholder="e.g. Senior Developer, HR Manager"
                                required
                            />

                            <Input
                                label="Designation Code"
                                name="code"
                                placeholder="e.g. BBDEG001"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-900">Active Status</span>
                                <span className="text-xs text-slate-500">Enable or disable this role</span>
                            </div>
                            <Switch name="is_active" />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 -mx-6 px-6 -mb-6 pb-6 bg-slate-50 rounded-b-xl">
                            <Button variant="ghost" onClick={onClose} type="button">Discard</Button>
                            <Button type="submit" isLoading={isSubmitting || isLoading} className="px-8">
                                {isEditing ? 'Update Designation' : 'Create Designation'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default DesignationForm;
