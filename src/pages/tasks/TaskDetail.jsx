import { useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';

const TaskDetail = () => {
    const { id } = useParams();
    const { tasks } = useData();

    const task = tasks.find(t => t.id === parseInt(id));

    if (!task) {
        return <div className="card">Task not found</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="card">
                <h1 className="text-3xl font-bold text-dark-50 mb-2">{task.title}</h1>
                <p className="text-dark-400">{task.description}</p>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-dark-500 text-sm">Status</p>
                        <p className="text-dark-200 font-medium capitalize">{task.status.replace('_', ' ')}</p>
                    </div>
                    <div>
                        <p className="text-dark-500 text-sm">Priority</p>
                        <p className="text-dark-200 font-medium capitalize">{task.priority}</p>
                    </div>
                    <div>
                        <p className="text-dark-500 text-sm">Progress</p>
                        <p className="text-dark-200 font-medium">{task.progress}%</p>
                    </div>
                    <div>
                        <p className="text-dark-500 text-sm">Deadline</p>
                        <p className="text-dark-200 font-medium">{task.deadline}</p>
                    </div>
                </div>
            </div>

            <div className="card">
                <h2 className="text-xl font-semibold text-dark-50 mb-4">Activity Log</h2>
                <div className="space-y-3">
                    {task.activityLog?.map(log => (
                        <div key={log.id} className="p-3 bg-dark-800/50 rounded-lg">
                            <p className="text-dark-300 text-sm">{log.action} by {log.user}</p>
                            <p className="text-dark-500 text-xs">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TaskDetail;
