import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Edit2,
    Trash2,
    ArrowUpRight,
    Settings,
    Box,
    Lock,
    Users,
    Database,
    Cpu,
    Cloud,
    ShieldCheck,
    Layout
} from 'lucide-react';
import { useGetApiWithIdQuery, useDeleteApiMutation } from '../../../store/api/commonApi';
import { toast } from 'react-toastify';
import Button from '../../../components/ui/Button';
import ProjectModuleFormModal from './ProjectModuleFormModal';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import { cn } from '../../../lib/utils';

const STEP_COLORS = [
    { bg: 'bg-[#936789]', text: 'text-[#936789]', border: 'border-[#936789]/20', number: '01' },
    { bg: 'bg-[#5B9279]', text: 'text-[#5B9279]', border: 'border-[#5B9279]/20', number: '02' },
    { bg: 'bg-[#3A81A1]', text: 'text-[#3A81A1]', border: 'border-[#3A81A1]/20', number: '03' },
    { bg: 'bg-[#5C7492]', text: 'text-[#5C7492]', border: 'border-[#5C7492]/20', number: '04' },
    { bg: 'bg-[#A9C394]', text: 'text-[#A9C394]', border: 'border-[#A9C394]/20', number: '05' },
    { bg: 'bg-[#6272A4]', text: 'text-[#6272A4]', border: 'border-[#6272A4]/20', number: '06' },
];

const getModuleIcon = (name) => {
    const lowercaseName = name?.toLowerCase() || '';
    if (lowercaseName.includes('auth') || lowercaseName.includes('login')) return Lock;
    if (lowercaseName.includes('user') || lowercaseName.includes('profile')) return Users;
    if (lowercaseName.includes('data') || lowercaseName.includes('db')) return Database;
    if (lowercaseName.includes('config') || lowercaseName.includes('setting')) return Settings;
    if (lowercaseName.includes('api') || lowercaseName.includes('service')) return Cpu;
    if (lowercaseName.includes('cloud') || lowercaseName.includes('server')) return Cloud;
    if (lowercaseName.includes('security') || lowercaseName.includes('admin')) return ShieldCheck;
    if (lowercaseName.includes('ui') || lowercaseName.includes('frontend') || lowercaseName.includes('design')) return Layout;
    return Box;
};

const ArrowStepCard = ({ module, index, onEdit, onDelete, onViewTask }) => {
    const colorConfig = STEP_COLORS[index % STEP_COLORS.length];
    const ModuleIcon = getModuleIcon(module.name);
    const stepNumber = String(index + 1).padStart(2, '0');

    return (
        <div className="group relative flex items-center justify-center min-w-[280px] md:min-w-[320px] lg:min-w-[340px] px-2 py-4">
            {/* The Arrow Shape Container */}
            <div
                className={cn(
                    "relative w-full h-32 md:h-36 flex items-center shadow-xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl cursor-default overflow-hidden",
                    colorConfig.bg
                )}
                style={{
                    clipPath: 'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)'
                }}
            >
                {/* Visual Accent - Left border line */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/10" />

                {/* Content Layout */}
                <div className="flex items-center w-[85%] px-8 space-x-6">
                    {/* Icon Section */}
                    <div className="relative z-10 p-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
                        <ModuleIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>

                    {/* Text Section */}
                    <div className="flex flex-col min-w-0 pr-4">
                        <h4 className="text-lg md:text-xl font-black text-white italic tracking-tight uppercase truncate">
                            {module.name}
                        </h4>
                        <p className="text-[10px] md:text-xs text-white/70 font-bold uppercase tracking-widest leading-none">
                            Phase {stepNumber}
                        </p>
                    </div>
                </div>

                {/* Numbering "Cutout" - Half circle on the right arrow tip */}
                <div
                    className="absolute right-[5%] top-1/2 -translate-y-1/2 w-16 h-24 md:w-20 md:h-28 bg-white/95 flex items-center justify-center shadow-inner"
                    style={{
                        clipPath: 'ellipse(55% 50% at 100% 50%)'
                    }}
                >
                    <span className="text-xl md:text-2xl font-black italic tracking-tighter text-slate-400 pl-4">
                        {stepNumber}
                    </span>
                </div>
            </div>

            {/* Management Bar Overlay - Appears on Hover */}
            <div className="absolute inset-x-0 -top-8 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 group-hover:-top-12 transition-all duration-300 z-50">
                <button
                    onClick={() => onViewTask(module)}
                    className="p-3 rounded-2xl bg-[#3A81A1] text-white shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2 border border-white/20"
                >
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest pr-1">Tasks</span>
                </button>
                <button
                    onClick={() => onEdit(module)}
                    className="p-3 rounded-2xl bg-[#5B9279] text-white shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2 border border-white/20"
                >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest pr-1">Edit</span>
                </button>
                <button
                    onClick={() => onDelete(module)}
                    className="p-3 rounded-2xl bg-[#936789] text-white shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2 border border-white/20"
                >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest pr-1">Delete</span>
                </button>
            </div>
        </div>
    );
};

const ProjectModuleAdminView = ({ projectId, onRefresh }) => {
    const navigate = useNavigate();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);

    const { data: modulesResponse, isLoading, refetch } = useGetApiWithIdQuery(
        { url: '/project-module-list', id: projectId },
        { skip: !projectId }
    );

    const [deleteModule] = useDeleteApiMutation();
    const modules = modulesResponse?.data?.data || modulesResponse?.data || [];

    const handleAdd = () => {
        setSelectedModule(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (module) => {
        setSelectedModule(module);
        setIsFormModalOpen(true);
    };

    const handleViewTask = (module) => {
        navigate(`/projects/${projectId}/planning/${module.id}`);
    };

    const handleDelete = (module) => {
        setSelectedModule(module);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteModule({ end_point: `/delete-project-module/${selectedModule.id}` }).unwrap();
            toast.success('Module successfully removed');
            setIsDeleteModalOpen(false);
            refetch();
            onRefresh?.();
        } catch (error) {
            toast.error(error?.data?.message || 'Removal failed');
        }
    };

    if (isLoading) {
        return (
            <div className="flex gap-4 overflow-hidden py-12">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-36 min-w-[320px] rounded-r-full bg-[var(--bg-card)] animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 overflow-visible">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary-500/10 border border-primary-500/20 shadow-inner">
                            <Settings className="w-6 h-6 text-primary-500" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-[var(--text-main)] italic tracking-tight uppercase leading-none">
                            Process Timeline
                        </h2>
                    </div>
                    <p className="text-[11px] md:text-xs text-[var(--text-muted)] font-black uppercase tracking-[0.2em] opacity-80">
                        Strategic Module Sequencing & Asset Management
                    </p>
                </div>

                <Button
                    onClick={handleAdd}
                    leftIcon={<Plus className="w-5 h-5" />}
                    className="h-16 px-10 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                    Add System Phase
                </Button>
            </div>

            {/* Horizontal Arrow Timeline */}
            <div className="relative group/timeline">
                {/* Bottom line for continuity if needed */}
                {/* <div className="absolute left-4 right-4 bottom-0 h-1 bg-[var(--border-main)]/20 rounded-full" /> */}

                <div className="flex flex-wrap items-center justify-start gap-y-12 md:gap-y-16 lg:gap-x-0 overflow-visible">
                    {modules.map((module, index) => (
                        <ArrowStepCard
                            key={module.id}
                            module={module}
                            index={index}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onViewTask={handleViewTask}
                        />
                    ))}

                    {/* Empty State / Add Placeholder */}
                    {modules.length === 0 && (
                        <div className="w-full flex flex-col items-center justify-center py-24 border-2 border-dashed border-[var(--border-main)] rounded-3xl opacity-40">
                            <Box className="w-16 h-16 mb-4" />
                            <p className="font-black uppercase tracking-widest text-sm">No Phases Defined</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals Connection */}
            <ProjectModuleFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                projectId={projectId}
                module={selectedModule}
                onSuccess={() => { refetch(); onRefresh?.(); }}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Sytem Removal Sequence"
                message={`Warning: You are about to dequeue "${selectedModule?.name}". This process cannot be reversed.`}
                confirmText="Execute Dequeue"
                variant="danger"
            />
        </div>
    );
};

export default ProjectModuleAdminView;
