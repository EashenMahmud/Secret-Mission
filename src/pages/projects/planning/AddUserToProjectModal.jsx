import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { useGetApiQuery, usePostApiMutation } from '../../../store/api/commonApi';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
    user_id: Yup.number().required('Select a user'),
});

const AddUserToProjectModal = ({ isOpen, onClose, projectId, assignedUserIds = [], onSuccess }) => {
    const [postApi, { isLoading }] = usePostApiMutation();
    const { data: usersRes } = useGetApiQuery({ url: '/admin/get-user-list', params: { per_page: 200 } }, { skip: !isOpen });

    const users = usersRes?.data?.data ?? [];
    const options = users
        .filter((u) => !assignedUserIds.includes(u.id))
        .map((u) => ({ value: u.id, label: u.name || u.email || `User #${u.id}` }));

    const handleSubmit = async (values) => {
        try {
            await postApi({
                end_point: '/add-user-to-project',
                body: { project_id: Number(projectId), user_id: values.user_id },
            }).unwrap();
            toast.success('User added to project');
            onSuccess?.();
            onClose();
        } catch (e) {
            toast.error(e?.data?.message || 'Failed to add user');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add user to project" size="md">
            <Formik
                initialValues={{ user_id: null }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4">
                        <Select
                            name="user_id"
                            label="User"
                            options={options}
                            placeholder="Select user"
                            required
                        />
                        {options.length === 0 && (
                            <p className="text-sm text-slate-400">No more users available to add.</p>
                        )}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" isLoading={isSubmitting || isLoading} disabled={options.length === 0}>
                                Add
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default AddUserToProjectModal;
