import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../components/ui/Button';

const TaskDetails = () => {
    const { projectId, planningId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-[var(--bg-card)] rounded-full -ml-2"
                >
                    <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-main)]">Task Details</h1>
                    <p className="text-[var(--text-muted)]">Project ID: {projectId} | Planning ID: {planningId}</p>
                </div>
            </div>

            <div className="card">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4">Task Information</h2>
                    <p className="text-[var(--text-muted)]">Details coming soon...</p>
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;
