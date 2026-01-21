import { useSelector } from 'react-redux';
import { useData } from '../../context/DataContext';
import { Link } from 'react-router-dom';
import { ListTodo, Plus } from 'lucide-react';

const TaskList = () => {
    const { tasks } = useData();
    const { role, user } = useSelector((state) => state.auth);

    const displayTasks = role === 'employee'
        ? tasks.filter(t => t.assignedTo === user.employeeId)
        : tasks;

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'badge-success';
            case 'in_progress': return 'badge-primary';
            case 'blocked': return 'badge-danger';
            default: return 'badge-info';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-400';
            case 'medium': return 'text-yellow-400';
            default: return 'text-green-400';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-dark-50 mb-2">Tasks</h1>
                    <p className="text-dark-400">{role === 'admin' ? 'All tasks' : 'My assigned tasks'}</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    New Task
                </button>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Progress</th>
                                <th>Deadline</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayTasks.map((task) => (
                                <tr key={task.id}>
                                    <td>
                                        <div>
                                            <p className="font-medium text-dark-200">{task.title}</p>
                                            <p className="text-xs text-dark-500">{task.description?.substring(0, 50)}...</p>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`capitalize ${getPriorityColor(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusColor(task.status)}`}>
                                            {task.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-dark-700 rounded-full h-2">
                                                <div
                                                    className="bg-primary-500 h-2 rounded-full"
                                                    style={{ width: `${task.progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-dark-400">{task.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="text-dark-400">{task.deadline}</td>
                                    <td>
                                        <Link
                                            to={`/tasks/${task.id}`}
                                            className="text-primary-400 hover:text-primary-300 text-sm"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TaskList;
