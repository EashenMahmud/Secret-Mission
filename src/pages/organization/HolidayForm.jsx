import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { usePostApiMutation } from '../../store/api/commonApi';
import { toast } from 'react-toastify';
import { CalendarDays, Tag } from 'lucide-react';

const holidaySchema = Yup.object().shape({
    name: Yup.string().required('Holiday name is required'),
    date: Yup.date().required('Holiday date is required'),
});

const HolidayForm = ({ isOpen, onClose, onSuccess, initialDate }) => {
    const [addHoliday, { isLoading }] = usePostApiMutation();

    const initialValues = {
        name: '',
        date: initialDate || '',
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            await addHoliday({
                end_point: '/add-holiday',
                body: values
            }).unwrap();
            toast.success('Holiday added successfully');
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to add holiday');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Holiday"
            size="md"
        >
            <Formik
                initialValues={initialValues}
                validationSchema={holidaySchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-6 pt-2">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 border border-indigo-100">
                                <CalendarDays className="w-8 h-8 text-indigo-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Holiday Details</h3>
                            <p className="text-xs text-slate-500 text-center mt-1">
                                Add a recurring or one-time holiday to the calendar.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Holiday Name"
                                name="name"
                                placeholder="e.g. Independence Day, Eid-ul-Fitr"
                                required
                                leftIcon={<Tag className="w-4 h-4" />}
                            />

                            <Input
                                label="Holiday Date"
                                name="date"
                                type="date"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 -mx-6 px-6 -mb-6 pb-6 bg-slate-50 rounded-b-xl">
                            <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
                            <Button type="submit" isLoading={isSubmitting || isLoading} className="px-8">
                                Save Holiday
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default HolidayForm;
