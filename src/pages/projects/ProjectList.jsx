import { useData } from '../../context/DataContext';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus } from 'lucide-react';

const ProjectList = () => {
    const { projects } = useData();

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-dark-50 mb-2">Projects</h1>
                    <p className="text-dark-400">Manage your projects</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    New Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        to={`/projects/${project.id}`}
                        className="card card-hover"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                                <FolderKanban className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-dark-50">{project.name}</h3>
                                <span className="badge badge-primary capitalize">{project.status}</span>
                            </div>
                        </div>
                        <p className="text-dark-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-dark-500">Progress</span>
                                <span className="text-dark-300 font-medium">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-dark-700 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                                    style={{ width: `${project.progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ProjectList;
