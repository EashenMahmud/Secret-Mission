import React, { useState } from 'react';
import { useGetApiQuery, useUpdateFormDataPostApiMutation } from '../../store/api/commonApi';
import { Card, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ImageUpload from '../../components/ui/ImageUpload';
import {
    User,
    Mail,
    Phone,
    Briefcase,
    MapPin,
    Shield,
    Camera,
    Save,
    UserCheck,
    Lock
} from 'lucide-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { getImageUrl } from '../../lib/utils';

const profileSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().nullable(),
    address: Yup.string().nullable(),
    password: Yup.string().min(6, 'Password must be at least 6 characters').nullable(),
});

const MyProfile = () => {
    const { data: profileResponse, isLoading, refetch } = useGetApiQuery({ url: '/my-profile' });
    const [updateProfile, { isLoading: isUpdating }] = useUpdateFormDataPostApiMutation();

    const userData = profileResponse?.data || {};

    const initialValues = {
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        employee_code: userData.employee_code || '',
        hrm_id: userData.hrm_id || '',
        department_name: userData.department?.name || 'Not Assigned',
        designation_name: userData.designation?.name || 'Not Assigned',
        user_type: userData.user_type || '',
        wing: userData.wing || '',
        profile_picture: userData.profile_picture || null,
        password: '',
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const body = {
                name: values.name,
                phone: values.phone,
                address: values.address,
                profile_picture: values.profile_picture
            };

            if (values.password) {
                body.password = values.password;
            }

            // If profile_picture is not a File instance (it's either null or the initial string), don't send it
            if (!(body.profile_picture instanceof File)) {
                delete body.profile_picture;
            }

            await updateProfile({
                end_point: `/update-user/${userData.id}`,
                body: body
            }).unwrap();

            toast.success('Profile updated successfully');
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in py-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-500 rounded-2xl shadow-xl shadow-primary-500/20">
                        <UserCheck className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Personal <span className="text-primary-500">Profile</span></h1>
                        <p className="text-[var(--text-muted)] text-sm font-medium">Manage your personal information and account settings.</p>
                    </div>
                </div>
            </motion.div>

            <Formik
                initialValues={initialValues}
                validationSchema={profileSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting, values }) => (
                    <Form className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Profile Photo & Summary */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-4 space-y-6"
                        >
                            <Card className="border-[var(--border-main)] bg-[var(--bg-card)] shadow-2xl rounded-[2.5rem] overflow-hidden transition-colors duration-300">
                                <CardBody className="p-8 flex flex-col items-center">
                                    <div className="relative group mb-6">
                                        <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-[var(--border-main)] shadow-2xl relative">
                                            {userData.profile_picture ? (
                                                <img
                                                    src={getImageUrl(userData.profile_picture)}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-[var(--bg-app)] flex items-center justify-center italic text-[var(--text-muted)]">
                                                    No Avatar
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-center space-y-2 mb-8">
                                        <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tight">{userData.name}</h2>
                                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                            {userData.user_type}
                                        </div>
                                    </div>

                                    <div className="w-full pt-8 border-t border-[var(--border-main)] space-y-4">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-[var(--text-muted)] font-bold uppercase tracking-wider">Employee Code</span>
                                            <span className="text-primary-500 dark:text-primary-400 font-black">{userData.employee_code}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-[var(--text-muted)] font-bold uppercase tracking-wider">Department</span>
                                            <span className="text-[var(--text-main)] font-bold">{userData.department?.name || 'N/A'}</span>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            <div className="bg-primary-500 rounded-[2rem] p-8 text-white shadow-2xl shadow-primary-500/20 relative overflow-hidden group">
                                <Briefcase className="absolute -bottom-4 -right-4 h-32 w-32 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500" />
                                <h4 className="text-lg font-black mb-2 flex items-center gap-2">
                                    Professional Status
                                </h4>
                                <p className="text-xs text-primary-100 font-medium leading-relaxed opacity-80">
                                    Assigned as <span className="text-white font-bold tracking-wide underline underline-offset-4">{userData.designation?.name || 'Employee'}</span> in the <span className="text-white font-bold tracking-wide uppercase">{userData.wing || 'General'}</span> wing.
                                </p>
                            </div>
                        </motion.div>

                        {/* Details Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-8 space-y-8"
                        >
                            <Card className="border-[var(--border-main)] bg-[var(--bg-card)] shadow-xl rounded-[2.5rem] transition-colors duration-300">
                                <CardBody className="p-8 space-y-10">
                                    {/* Section 1: Basic Info */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-[var(--bg-app)] rounded-xl">
                                                <User className="w-5 h-5 text-primary-500" />
                                            </div>
                                            <h3 className="text-lg font-bold text-[var(--text-main)] tracking-tight underline underline-offset-8 decoration-primary-500/30">Basic Identification</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input label="Display Name" labelClassName="text-[var(--text-main)]" name="name" icon={<User size={18} />} placeholder="Your Name" />
                                            <Input label="Email Address" labelClassName="text-[var(--text-main)]" name="email" type="email" icon={<Mail size={18} />} disabled />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input label="Phone Number" labelClassName="text-[var(--text-main)]" name="phone" icon={<Phone size={18} />} placeholder="+880..." />
                                            <Input label="Home Address" labelClassName="text-[var(--text-main)]" name="address" icon={<MapPin size={18} />} placeholder="Dhaka, Bangladesh" />
                                        </div>
                                    </div>

                                    {/* Section 2: Account Security */}
                                    <div className="space-y-6 pt-10 border-t border-[var(--border-main)]">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-[var(--bg-app)] rounded-xl">
                                                <Lock className="w-5 h-5 text-primary-500" />
                                            </div>
                                            <h3 className="text-lg font-bold text-[var(--text-main)] tracking-tight underline underline-offset-8 decoration-primary-500/30">Account Security</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input label="Update Password" labelClassName="text-[var(--text-main)]" name="password" type="password" icon={<Lock size={18} />} placeholder="••••••••" helperText="Leave blank if you don't want to change it." />
                                            <div className="max-w-md">
                                                <ImageUpload
                                                    name="profile_picture"
                                                    label="Change Profile Photo"
                                                    labelClassName="text-[var(--text-main)]"
                                                />
                                            </div>

                                        </div>
                                        <div className="flex justify-center pb-3">
                                            <Button
                                                type="submit"
                                                isLoading={isSubmitting || isUpdating}
                                                className="w-md bg-primary-500 hover:bg-primary-600 text-white font-black uppercase tracking-[0.15em] text-xs h-12 rounded-2xl shadow-xl shadow-primary-500/20"
                                                leftIcon={<Save size={18} />}
                                            >
                                                Save Changes
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Section 3: Profile Photo Update */}
                                    {/* <div className="space-y-6 pt-10 border-t border-dark-800">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-dark-800 rounded-xl">
                                                <Camera className="w-5 h-5 text-primary-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-dark-100 tracking-tight underline underline-offset-8 decoration-primary-500/30">Profile Avatar</h3>
                                        </div>
                                        <div className="max-w-md">
                                            <ImageUpload
                                                name="profile_picture"
                                                label="Change Profile Photo"
                                                labelClassName="text-white"
                                            />
                                        </div>
                                    </div> */}
                                </CardBody>
                            </Card>
                        </motion.div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default MyProfile;
