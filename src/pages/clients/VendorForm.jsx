import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Switch from '../../components/ui/Switch';
import Button from '../../components/ui/Button';
import {
    usePostApiMutation,

} from '../../store/api/commonApi';
import { toast } from 'react-toastify';
import { Building2, Mail, Phone, Globe, MapPin, Hash, Briefcase } from 'lucide-react';

const clientSchema = Yup.object().shape({
    name: Yup.string().required('Client name is required'),
    email: Yup.string().email('Invalid email').nullable(),
    company_name: Yup.string().nullable(),
    phone: Yup.string().nullable(),
    website: Yup.string().url('Invalid URL').nullable(),
});

const ClientForm = ({ isOpen, onClose, vendor, onSuccess }) => {
    const isEditing = !!vendor;

    const [createVendor, { isLoading: isCreating }] = usePostApiMutation();
    const [updateVendor, { isLoading: isUpdating }] = usePostApiMutation();

    const initialValues = {
        name: vendor?.name || '',
        email: vendor?.email || '',
        phone: vendor?.phone || '',
        website: vendor?.website || '',
        company_name: vendor?.company_name || '',
        tax_id: vendor?.tax_id || '',
        address_line_1: vendor?.address_line_1 || '',
        address_line_2: vendor?.address_line_2 || '',
        city: vendor?.city || '',
        state: vendor?.state || '',
        country: vendor?.country || '',
        postal_code: vendor?.postal_code || '',
        is_active: vendor?.is_active ?? true,
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const body = { ...values };

            // Map booleans to numbers if required, but Swagger says boolean
            // body.is_active = body.is_active ? 1 : 0;

            if (isEditing) {
                await updateVendor({
                    end_point: `/update-vendor/${vendor.id}`,
                    body: body
                }).unwrap();
                toast.success('Client updated successfully');
            } else {
                await createVendor({
                    end_point: '/vendors',
                    body: body
                }).unwrap();
                toast.success('Client created successfully');
            }

            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to save client');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit Client Details' : 'Add New Client'}
            size="xl"
            className="overflow-hidden"
            contentClassName="pb-2 px-2 overflow-hidden"
        >
            <Formik
                initialValues={initialValues}
                validationSchema={clientSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting, values }) => (
                    <Form className="flex flex-col h-full max-h-[80vh]">
                        <div className="flex-1 overflow-y-auto p-2">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Left Side: Status & Summary */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="bg-[var(--bg-app)] p-6 rounded-2xl border border-[var(--border-main)] flex flex-col items-center">
                                        <div className="w-20 h-20 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-4 border border-primary-500/20">
                                            <Building2 className="w-10 h-10 text-primary-500" />
                                        </div>
                                        <h3 className="text-lg font-bold text-[var(--text-main)] text-center">
                                            {values.name || 'Client Name'}
                                        </h3>
                                        <p className="text-sm text-[var(--text-muted)] text-center mb-6">
                                            {values.company_name || 'Company Profile'}
                                        </p>

                                        <div className="mt-auto flex items-center justify-between w-full p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)]">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-[var(--text-main)]">Active Status</span>
                                                <span className="text-xs text-[var(--text-muted)]">Enable/Disable client</span>
                                            </div>
                                            <Switch name="is_active" />
                                        </div>
                                    </div>

                                    <div className="bg-[var(--bg-app)] p-6 rounded-2xl border border-[var(--border-main)] space-y-4">
                                        <div className="flex items-center gap-2 text-[var(--text-main)] font-semibold mb-2">
                                            <Briefcase className="w-4 h-4 text-primary-500" />
                                            <span>Quick Stats</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-[var(--text-muted)]">ID</span>
                                                <span className="text-[var(--text-main)] font-medium">#{vendor?.id || 'New'}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-[var(--text-muted)]">Tax ID</span>
                                                <span className="text-[var(--text-main)] font-medium">{values.tax_id || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Form Fields */}
                                <div className="lg:col-span-8 space-y-8 pb-4">
                                    {/* Primary Info */}
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 text-lg font-bold text-[var(--text-main)] border-b border-[var(--border-main)] pb-2">
                                            <Building2 className="w-5 h-5 text-primary-500" />
                                            <span>Company Identification</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input label="Client Name" name="name" placeholder="John Doe or Acme Corp" required />
                                            <Input label="Brand/Company Name" name="company_name" placeholder="Acme International" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input label="Email Address" name="email" type="email" placeholder="client@example.com" />
                                            <Input label="Phone Number" name="phone" placeholder="+880 17xx-xxxxxx" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input label="Website" name="website" placeholder="https://example.com" />
                                            <Input label="Tax ID / Registration" name="tax_id" placeholder="VAT-12345678" />
                                        </div>
                                    </section>

                                    {/* Address Info */}
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 text-lg font-bold text-[var(--text-main)] border-b border-[var(--border-main)] pb-2">
                                            <MapPin className="w-5 h-5 text-primary-500" />
                                            <span>Business Address</span>
                                        </div>
                                        <div className="space-y-4">
                                            <Input label="Address Line 1" name="address_line_1" placeholder="Street, Building, Suite" />
                                            <Input label="Address Line 2" name="address_line_2" placeholder="Area, Landmark" />
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <Input label="City" name="city" placeholder="e.g. Dhaka" />
                                                <Input label="State/Province" name="state" placeholder="e.g. Dhaka" />
                                                <Input label="Postal Code" name="postal_code" placeholder="1212" />
                                            </div>
                                            <Input label="Country" name="country" placeholder="e.g. Bangladesh" />
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <div className="flex justify-end gap-3 p-6 bg-[var(--bg-app)] border-t border-[var(--border-main)] rounded-b-xl -mx-6 -mb-6 mt-4">
                            <Button variant="ghost" onClick={onClose} type="button">Discard</Button>
                            <Button type="submit" isLoading={isSubmitting || isCreating || isUpdating} className="px-8">
                                {isEditing ? 'Update Client' : 'Create Client'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default ClientForm;
