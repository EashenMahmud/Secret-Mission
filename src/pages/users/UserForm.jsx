import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Radio from '../../components/ui/Radio';
import Select from '../../components/ui/Select';
import Switch from '../../components/ui/Switch';
import ImageUpload from '../../components/ui/ImageUpload';
import Button from '../../components/ui/Button';
import {
    useGetApiQuery,
    usePostFormDataApiMutation,
    useUpdateFormDataPostApiMutation
} from '../../store/api/commonApi';
import { toast } from 'react-toastify';
import { User, Mail, Shield, MapPin, Briefcase } from 'lucide-react';

const userSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    employee_code: Yup.string().required('Employee code is required'),
    password: Yup.string().when('isEditing', {
        is: false,
        then: (schema) => schema.min(6, 'Min 6 characters').required('Password is required'),
        otherwise: (schema) => schema.min(6, 'Min 6 characters'),
    }),
    phone: Yup.string().nullable(),
    gender: Yup.string().oneOf(['male', 'female', 'other'], 'Invalid gender').nullable(),
});

const UserForm = ({ isOpen, onClose, user, onSuccess }) => {
    const isEditing = !!user;

    // Fetch departments and designations (only when modal is open)
    const { data: deptResponse } = useGetApiQuery({ url: 'open/get-department-list' }, { skip: !isOpen });
    const { data: desigResponse } = useGetApiQuery({ url: 'open/get-designation-list' }, { skip: !isOpen });

    const [createUser, { isLoading: isCreating }] = usePostFormDataApiMutation();
    const [updateUser, { isLoading: isUpdating }] = useUpdateFormDataPostApiMutation();

    const depts = deptResponse?.data?.map(d => ({ label: d.name, value: d.id })) || [];
    const desigs = desigResponse?.data?.map(d => ({ label: d.name, value: d.id })) || [];

    const initialValues = {
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        gender: user?.gender || 'male',
        employee_code: user?.employee_code || '',
        hrm_id: user?.hrm_id || '',
        department_id: user?.department_id || '',
        designation_id: user?.designation_id || '',
        wing: user?.wing || 'SFT',
        address: user?.address || '',
        user_type: user?.user_type || 'Developer',
        is_active: user?.is_active ?? true,
        profile_picture: null,
        password: '',
        isEditing: isEditing
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const body = { ...values };
            delete body.isEditing;

            // Convert is_active to 1 or 0 for backend
            body.is_active = body.is_active ? 1 : 0;

            if (isEditing && !body.password) {
                delete body.password;
            }

            // Handle file upload correctly
            if (!(body.profile_picture instanceof File)) {
                delete body.profile_picture;
            }

            if (isEditing) {
                await updateUser({
                    end_point: `/update-user/${user.id}`,
                    body: body
                }).unwrap();
                toast.success('User updated successfully');
            } else {
                await createUser({
                    end_point: '/add-new-user',
                    body: body
                }).unwrap();
                toast.success('User created successfully');
            }

            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to save user');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit User Profile' : 'Register New User'}
            size="xl"
            className="overflow-hidden"
            contentClassName="pb-2 px-2 overflow-hidden"
        >
            <Formik
                initialValues={initialValues}
                validationSchema={userSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting, values }) => (
                    <Form className="flex flex-col h-full max-h-[80vh]">
                        <div className="flex-1 overflow-y-auto p-2 ">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Left Side: Profile Picture & Secondary Info */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center">
                                        <ImageUpload
                                            label="Profile Photo"
                                            name="profile_picture"
                                            className="w-full"
                                            helperText="Upload a professional photo. Max 2MB."
                                        />
                                        <div className="mt-6 flex items-center justify-between w-full p-3 bg-white rounded-xl border border-slate-200">
                                            <span className="text-sm font-medium text-slate-600">Account Active</span>
                                            <Switch name="is_active" />
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                                        <div className="flex items-center gap-2 text-slate-900 font-semibold mb-2">
                                            <Shield className="w-4 h-4 text-indigo-500" />
                                            <span>Access Control</span>
                                        </div>
                                        <Radio
                                            label="User Role"
                                            name="user_type"
                                            options={[
                                                { label: 'Admin', value: 'Admin' },
                                                { label: 'Developer', value: 'Developer' },
                                            ]}
                                        />
                                        <Radio
                                            label="Gender"
                                            name="gender"
                                            options={[
                                                { label: 'Male', value: 'male' },
                                                { label: 'Female', value: 'female' },
                                                { label: 'Other', value: 'other' },
                                            ]}
                                        />
                                    </div>
                                </div>

                                {/* Right Side: Primary Info Form */}
                                <div className="lg:col-span-8 space-y-8 pb-4">
                                    {/* Personal Info Section */}
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                                            <User className="w-5 h-5 text-indigo-500" />
                                            <span>Personal Identification</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input label="Full Name" name="name" placeholder="John Doe" required />
                                            <Input label="Email Address" name="email" type="email" placeholder="john@example.com" disabled={isEditing} required />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input label="Phone Number" name="phone" placeholder="+880 17xx-xxxxxx" />
                                            <Input
                                                label={isEditing ? "Set New Password" : "Account Password"}
                                                name="password"
                                                type="password"
                                                placeholder="••••••••"
                                                required={!isEditing}
                                                helperText={isEditing ? "Leave blank to keep existing password" : ""}
                                            />
                                        </div>
                                    </section>

                                    {/* Employment Section */}
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                                            <Briefcase className="w-5 h-5 text-indigo-500" />
                                            <span>Employment Details</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input label="Employee Code" name="employee_code" placeholder="SFT-EMP-001" required />
                                            <Input label="HRM ID" name="hrm_id" placeholder="HRM-1020" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Select label="Department" name="department_id" options={depts} placeholder="Search Department..." />
                                            <Select label="Designation" name="designation_id" options={desigs} placeholder="Search Designation..." />
                                        </div>
                                        <Input label="Wing / Group" name="wing" placeholder="SFT, Admin, etc." />
                                    </section>

                                    {/* Address Section */}
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                                            <MapPin className="w-5 h-5 text-indigo-500" />
                                            <span>Residence Info</span>
                                        </div>
                                        <Input label="Full Address" name="address" placeholder="Enter complete residential address" />
                                    </section>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <div className="flex justify-end gap-3 p-6 bg-slate-50 border-t border-slate-200 rounded-b-xl -mx-6 -mb-6 mt-4 ">
                            <Button variant="ghost" onClick={onClose} type="button">Discard Changes</Button>
                            <Button type="submit" isLoading={isSubmitting || isCreating || isUpdating} className="px-8">
                                {isEditing ? 'Save Profile' : 'Register User'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default UserForm;
