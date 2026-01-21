import { useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';

const SprintDashboard = () => {
    const { id } = useParams();
    const { sprints, tasks } = useData();

    const sprint = sprints.find(s => s.id === parseInt(id));
    const sprintTasks = tasks.filter(t => t.sprintId === parseInt(id));

    if (!sprint) {
        return <div className="card">Sprint not found</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="card">
                <h1 className="text-3xl font-bold text-dark-50 mb-2">{sprint.name}</h1>
                <p className="text-dark-400">{sprint.goal}</p>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-dark-500 text-sm">Status</p>
                        <p className="text-dark-200 font-medium capitalize">{sprint.status}</p>
                    </div>
                    <div>
                        <p className="text-dark-500 text-sm">Total Tasks</p>
                        <p className="text-dark-200 font-medium">{sprint.totalTasks}</p>
                    </div>
                    <div>
                        <p className="text-dark-500 text-sm">Completed</p>
                        <p className="text-dark-200 font-medium">{sprint.completedTasks}</p>
                    </div>
                    <div>
                        <p className="text-dark-500 text-sm">Remaining</p>
                        <p className="text-dark-200 font-medium">{sprint.totalTasks - sprint.completedTasks}</p>
                    </div>
                </div>
            </div>

            <div className="card">
                <h2 className="text-xl font-semibold text-dark-50 mb-4">Sprint Tasks</h2>
                <div className="space-y-3">
                    {sprintTasks.map(task => (
                        <div key={task.id} className="p-4 bg-dark-800/50 rounded-lg">
                            <h3 className="text-dark-200 font-medium">{task.title}</h3>
                            <p className="text-dark-500 text-sm">{task.status}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SprintDashboard;
