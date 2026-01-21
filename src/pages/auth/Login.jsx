import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { login } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';
import { Lock, Mail, LogIn } from 'lucide-react';

const loginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
});

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, role } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (values, { setSubmitting }) => {
        const result = dispatch(login(values));

        if (result.success) {
            toast.success(`Welcome back, ${result.user.firstName}!`);
            navigate('/dashboard');
        } else {
            toast.error(result.error || 'Login failed');
        }

        setSubmitting(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Login Card */}
                <div className="glass rounded-2xl p-8 shadow-2xl border border-white/10 backdrop-blur-xl">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-4 shadow-glow">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gradient mb-2">
                            Secret Mission
                        </h1>
                        <p className="text-dark-400">Project Management System</p>
                    </div>

                    {/* Login Form */}
                    <Formik
                        initialValues={{ email: '', password: '' }}
                        validationSchema={loginSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ errors, touched, isSubmitting }) => (
                            <Form className="space-y-6">
                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="label">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-dark-400" />
                                        </div>
                                        <Field
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="admin@secretmission.com"
                                            className={`input pl-10 ${errors.email && touched.email ? 'input-error' : ''
                                                }`}
                                        />
                                    </div>
                                    {errors.email && touched.email && (
                                        <p className="error-text">{errors.email}</p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label htmlFor="password" className="label">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-dark-400" />
                                        </div>
                                        <Field
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="••••••••"
                                            className={`input pl-10 ${errors.password && touched.password ? 'input-error' : ''
                                                }`}
                                        />
                                    </div>
                                    {errors.password && touched.password && (
                                        <p className="error-text">{errors.password}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-lg font-semibold shadow-glow hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-5 h-5" />
                                            Sign In
                                        </>
                                    )}
                                </button>
                            </Form>
                        )}
                    </Formik>

                    {/* Demo Credentials */}
                    <div className="mt-8 p-4 bg-dark-800/50 rounded-lg border border-dark-700">
                        <p className="text-sm text-dark-300 mb-2 font-medium">Demo Credentials:</p>
                        <div className="space-y-1 text-xs text-dark-400">
                            <p><span className="text-primary-400">Admin:</span> admin@secretmission.com / admin123</p>
                            <p><span className="text-secondary-400">Employee:</span> employee@secretmission.com / employee123</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-dark-500 text-sm mt-6">
                    © 2024 Secret Mission. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;
