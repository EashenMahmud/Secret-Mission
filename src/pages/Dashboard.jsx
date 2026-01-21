import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
    Users,
    Briefcase,
    CheckCircle2,
    Clock,
    TrendingUp,
    Filter,
    FolderKanban,
    ListTodo,
    Timer
} from 'lucide-react';

const Dashboard = () => {
    const { user, role } = useSelector((state) => state.auth);
    const {
        projects,
        tasks,
        employees,
        departments,
        sprints
    } = useData();

    // Calculate statistics
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const activeSprints = sprints.filter(s => s.status === 'active').length;

    // Get user's assigned tasks if employee
    const myTasks = role === 'employee'
        ? tasks.filter(t => t.assignedTo === user.employeeId)
        : tasks;

    const myActiveTasks = myTasks.filter(t =>
        t.status === 'in_progress' || t.status === 'assigned'
    );

    const stats = [
        {
            label: 'Active Projects',
            value: activeProjects,
            icon: FolderKanban,
            color: 'primary',
            link: '/projects'
        },
        {
            label: role === 'admin' ? 'Total Tasks' : 'My Tasks',
            value: role === 'admin' ? totalTasks : myTasks.length,
            icon: ListTodo,
            color: 'secondary',
            link: '/tasks'
        },
        {
            label: 'Active Sprints',
            value: activeSprints,
            icon: Timer,
            color: 'green',
            link: '/sprints'
        },
        {
            label: role === 'admin' ? 'Team Members' : 'Completed Tasks',
            value: role === 'admin' ? employees.length : myTasks.filter(t => t.status === 'completed').length,
            icon: role === 'admin' ? Users : CheckCircle2,
            color: 'blue',
            link: role === 'admin' ? '/organization/employees' : '/tasks'
        },
    ];

    const colorClasses = {
        primary: 'from-primary-500 to-primary-600',
        secondary: 'from-secondary-500 to-secondary-600',
        green: 'from-green-500 to-green-600',
        blue: 'from-blue-500 to-blue-600',
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Section */}
            <div className="card">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-dark-50 mb-2">
                            Welcome back, {user?.firstName}! 👋
                        </h1>
                        <p className="text-dark-400">
                            Here's what's happening with your projects today.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="text-right">
                            <p className="text-sm text-dark-400">Role</p>
                            <p className="text-lg font-semibold text-primary-400 capitalize">{role}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Link
                            key={index}
                            to={stat.link}
                            className="card card-hover group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-dark-400 text-sm mb-1">{stat.label}</p>
                                    <p className="text-3xl font-bold text-dark-50">{stat.value}</p>
                                </div>
                                <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[stat.color]} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Tasks */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-dark-50">
                            {role === 'admin' ? 'Recent Tasks' : 'My Active Tasks'}
                        </h2>
                        <Link to="/tasks" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                            View All →
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {(role === 'admin' ? tasks.slice(0, 5) : myActiveTasks.slice(0, 5)).map((task) => (
                            <div
                                key={task.id}
                                className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg hover:bg-dark-800 transition-colors"
                            >
                                <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' :
                                        task.priority === 'medium' ? 'bg-yellow-500' :
                                            'bg-green-500'
                                    }`}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-dark-200 font-medium truncate">{task.title}</p>
                                    <p className="text-dark-500 text-xs">
                                        {task.status.replace('_', ' ').toUpperCase()}
                                    </p>
                                </div>
                                <span className={`badge ${task.status === 'completed' ? 'badge-success' :
                                        task.status === 'in_progress' ? 'badge-primary' :
                                            task.status === 'blocked' ? 'badge-danger' :
                                                'badge-info'
                                    }`}>
                                    {task.status.replace('_', ' ')}
                                </span>
                            </div>
                        ))}
                        {(role === 'admin' ? tasks : myActiveTasks).length === 0 && (
                            <div className="text-center py-8 text-dark-500">
                                <ListTodo className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No tasks found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Projects */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-dark-50">Active Projects</h2>
                        <Link to="/projects" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                            View All →
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {projects.filter(p => p.status === 'in_progress').slice(0, 5).map((project) => (
                            <div
                                key={project.id}
                                className="p-4 bg-dark-800/50 rounded-lg hover:bg-dark-800 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-dark-200 font-medium">{project.name}</h3>
                                    <span className="badge badge-primary">{project.progress}%</span>
                                </div>
                                <div className="w-full bg-dark-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${project.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {projects.filter(p => p.status === 'in_progress').length === 0 && (
                            <div className="text-center py-8 text-dark-500">
                                <FolderKanban className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No active projects</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
