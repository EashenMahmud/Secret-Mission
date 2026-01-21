import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, X, Building2 } from 'lucide-react';

const departmentSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Department name is required'),
    description: Yup.string()
        .min(10, 'Description must be at least 10 characters')
        .required('Description is required'),
});

const DepartmentList = () => {
    const { departments, addDepartment, updateDepartment, deleteDepartment } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);

    const handleSubmit = (values, { setSubmitting, resetForm }) => {
        if (editingDepartment) {
            updateDepartment({ ...editingDepartment, ...values });
            toast.success('Department updated successfully');
        } else {
            addDepartment(values);
            toast.success('Department created successfully');
        }
        setSubmitting(false);
        resetForm();
        setIsModalOpen(false);
        setEditingDepartment(null);
    };

    const handleEdit = (department) => {
        setEditingDepartment(department);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            deleteDepartment(id);
            toast.success('Department deleted successfully');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDepartment(null);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-dark-50 mb-2">Departments</h1>
                    <p className="text-dark-400">Manage your organization's departments</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Department
                </button>
            </div>

            {/* Departments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((department) => (
                    <div key={department.id} className="card card-hover">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-dark-50">{department.name}</h3>
                                    <p className="text-xs text-dark-500">Created: {department.createdAt}</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-dark-400 text-sm mb-4 line-clamp-2">{department.description}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(department)}
                                className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(department.id)}
                                className="btn-danger flex-1 flex items-center justify-center gap-2 text-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {departments.length === 0 && (
                <div className="card text-center py-12">
                    <Building2 className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                    <h3 className="text-xl font-semibold text-dark-300 mb-2">No departments yet</h3>
                    <p className="text-dark-500 mb-4">Get started by creating your first department</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Department
                    </button>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <>
                    <div className="modal-overlay" onClick={handleCloseModal}></div>
                    <div className="modal-content w-full max-w-md p-6 animate-scale-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-dark-50">
                                {editingDepartment ? 'Edit Department' : 'New Department'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-dark-400 hover:text-dark-200"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <Formik
                            initialValues={{
                                name: editingDepartment?.name || '',
                                description: editingDepartment?.description || '',
                            }}
                            validationSchema={departmentSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ errors, touched, isSubmitting }) => (
                                <Form className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="label">
                                            Department Name
                                        </label>
                                        <Field
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="e.g., Engineering"
                                            className={`input ${errors.name && touched.name ? 'input-error' : ''
                                                }`}
                                        />
                                        {errors.name && touched.name && (
                                            <p className="error-text">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="label">
                                            Description
                                        </label>
                                        <Field
                                            as="textarea"
                                            id="description"
                                            name="description"
                                            rows="4"
                                            placeholder="Brief description of the department"
                                            className={`input ${errors.description && touched.description ? 'input-error' : ''
                                                }`}
                                        />
                                        {errors.description && touched.description && (
                                            <p className="error-text">{errors.description}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="btn-secondary flex-1"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="btn-primary flex-1"
                                        >
                                            {isSubmitting ? 'Saving...' : editingDepartment ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </>
            )}
        </div>
    );
};

export default DepartmentList;
