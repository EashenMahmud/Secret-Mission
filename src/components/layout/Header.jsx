import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { performLogout } from '../../store/slices/authSlice';
import { Menu, LogOut, User, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';

const Header = ({ toggleSidebar }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, role } = useSelector((state) => state.auth);
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        dispatch(performLogout());
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <header className="h-16 bg-[var(--bg-sidebar)] border-b border-[var(--border-main)] flex items-center justify-between px-6 transition-colors duration-300">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden text-dark-400 hover:text-dark-200 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div>
                    <h2 className="text-lg font-semibold text-[var(--text-main)]">
                        Welcome back, {user?.firstName}!
                    </h2>
                    <p className="text-xs text-dark-400 capitalize">
                        {role} Dashboard
                    </p>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] rounded-lg transition-all"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <button className="relative p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] rounded-lg transition-all">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <div className="flex items-center gap-3 pl-4 border-l border-[var(--border-main)]">
                    <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-3 hover:bg-[var(--bg-app)] p-1.5 rounded-xl transition-all duration-300 group"
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/10 group-hover:scale-105 transition-transform">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-bold text-[var(--text-main)] group-hover:text-primary-400 transition-colors">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)] font-medium tracking-tight overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                                {user?.email}
                            </p>
                        </div>
                    </button>

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
