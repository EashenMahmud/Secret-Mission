import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { loginSuccess } from '../../store/slices/authSlice';
import { useLoginMutation } from '../../store/api/commonApi';
import { toast } from 'react-toastify';
import { Lock, Mail, LogIn } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

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
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [loginMutation, { isLoading }] = useLoginMutation();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const data = await loginMutation(values).unwrap();

            // Expected response: { user, access_token } or similar
            // Looking at commonApi transformResponse, it returns response.data
            dispatch(loginSuccess({
                user: data.user,
                token: data.access_token || data.token
            }));

            // PERSISTENCE handled by thunks usually, but loginSuccess only 
            // updates state. Let's ensure localStorage is updated.
            localStorage.setItem('auth_token', data.access_token || data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            toast.success(`Welcome back, ${data.user.first_name || data.user.name}!`);
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            toast.error(err?.data?.message || err?.message || 'Login failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-sm">
                {/* Login Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-2xl mb-4 shadow-lg shadow-indigo-500/20">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Secret Mission
                        </h1>
                        <p className="text-slate-400">Secure Access Portal</p>
                    </div>

                    {/* Login Form */}
                    <Formik
                        initialValues={{ email: '', password: '' }}
                        validationSchema={loginSchema}
                        onSubmit={handleSubmit}
                    >
                        {() => (
                            <Form className="space-y-5">
                                <Input
                                    label={<span className="text-slate-200">Email Address</span>}
                                    name="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    className="!bg-white/5 !border-white/10 !text-white placeholder:text-slate-500"
                                />

                                <Input
                                    label={<span className="text-slate-200">Password</span>}
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="!bg-white/5 !border-white/10 !text-white placeholder:text-slate-500"
                                />

                                <Button
                                    type="submit"
                                    className="w-full mt-2"
                                    isLoading={isLoading}
                                    leftIcon={!isLoading && <LogIn className="h-4 w-4" />}
                                >
                                    Sign In
                                </Button>
                            </Form>
                        )}
                    </Formik>

                    {/* Security Note */}
                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-xs text-slate-500">
                            Authorized personnel only. All access attempts are logged.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-600 text-sm mt-6">
                    © 2026 Secret Mission. v2.0
                </p>
            </div>
        </div>
    );
};

export default Login;

