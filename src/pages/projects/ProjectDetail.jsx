import { useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';

const ProjectDetail = () => {
    const { id } = useParams();
    const { projects, modules } = useData();

    const project = projects.find(p => p.id === parseInt(id));
    const projectModules = modules.filter(m => m.projectId === parseInt(id));

    if (!project) {
        return <div className="card">Project not found</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="card">
                <h1 className="text-3xl font-bold text-dark-50 mb-2">{project.name}</h1>
                <p className="text-dark-400">{project.description}</p>
            </div>

            <div className="card">
                <h2 className="text-xl font-semibold text-dark-50 mb-4">Modules</h2>
                <div className="space-y-3">
                    {projectModules.map(module => (
                        <div key={module.id} className="p-4 bg-dark-800/50 rounded-lg">
                            <h3 className="text-dark-200 font-medium">{module.name}</h3>
                            <p className="text-dark-500 text-sm">{module.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
