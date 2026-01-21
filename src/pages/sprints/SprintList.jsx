import { useData } from '../../context/DataContext';
import { Link } from 'react-router-dom';
import { Timer, Plus } from 'lucide-react';

const SprintList = () => {
    const { sprints } = useData();

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-dark-50 mb-2">Sprints</h1>
                    <p className="text-dark-400">Manage project sprints</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    New Sprint
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sprints.map((sprint) => (
                    <Link
                        key={sprint.id}
                        to={`/sprints/${sprint.id}`}
                        className="card card-hover"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                                <Timer className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-dark-50">{sprint.name}</h3>
                                <span className={`badge ${sprint.status === 'active' ? 'badge-success' : 'badge-info'}`}>
                                    {sprint.status}
                                </span>
                            </div>
                        </div>
                        <p className="text-dark-400 text-sm mb-4">{sprint.goal}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-dark-500">Tasks</p>
                                <p className="text-dark-200 font-medium">{sprint.completedTasks}/{sprint.totalTasks}</p>
                            </div>
                            <div>
                                <p className="text-dark-500">Effort</p>
                                <p className="text-dark-200 font-medium">{sprint.completedEffort}/{sprint.totalEffort}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SprintList;
