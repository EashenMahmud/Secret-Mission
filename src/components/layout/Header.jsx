import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { performLogout } from '../../store/slices/authSlice';
import { Menu, LogOut, User, Bell } from 'lucide-react';
import { toast } from 'react-toastify';

const Header = ({ toggleSidebar }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, role } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(performLogout());
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <header className="h-16 bg-dark-900 border-b border-dark-700 flex items-center justify-between px-6">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden text-dark-400 hover:text-dark-200 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div>
                    <h2 className="text-lg font-semibold text-dark-100">
                        Welcome back, {user?.firstName}!
                    </h2>
                    <p className="text-xs text-dark-400 capitalize">
                        {role} Dashboard
                    </p>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 text-dark-400 hover:text-dark-200 hover:bg-dark-800 rounded-lg transition-all">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <div className="flex items-center gap-3 pl-4 border-l border-dark-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-medium text-dark-100">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-dark-400">{user?.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="btn-secondary flex items-center gap-2 text-sm"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
