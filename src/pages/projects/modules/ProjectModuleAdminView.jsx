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
    { bg: 'bg-[#823B6D]', text: 'text-[#823B6D]', border: 'border-[#823B6D]/20', number: '01' },
    { bg: 'bg-[#2A7053]', text: 'text-[#2A7053]', border: 'border-[#2A7053]/20', number: '02' },
    { bg: 'bg-[#11558E]', text: 'text-[#11558E]', border: 'border-[#11558E]/20', number: '03' },
    { bg: 'bg-[#3D5470]', text: 'text-[#3D5470]', border: 'border-[#3D5470]/20', number: '04' },
    { bg: 'bg-[#6D854F]', text: 'text-[#6D854F]', border: 'border-[#6D854F]/20', number: '05' },
    { bg: 'bg-[#3F497E]', text: 'text-[#3F497E]', border: 'border-[#3F497E]/20', number: '06' },
];

const getModuleIcon = (name) => {
    const lowercaseName = name?.toLowerCase() || '';
    if (lowercaseName.includes('auth') || lowercaseName.includes('login')) return Box;
    if (lowercaseName.includes('user') || lowercaseName.includes('profile')) return Users;
    if (lowercaseName.includes('data') || lowercaseName.includes('db')) return Database;
    if (lowercaseName.includes('config') || lowercaseName.includes('setting')) return Settings;
    if (lowercaseName.includes('api') || lowercaseName.includes('service')) return Cpu;
    if (lowercaseName.includes('cloud') || lowercaseName.includes('server')) return Cloud;
    if (lowercaseName.includes('security') || lowercaseName.includes('admin')) return ShieldCheck;
    if (lowercaseName.includes('ui') || lowercaseName.includes('frontend') || lowercaseName.includes('design')) return Layout;
    return Box;
};

const STATUS_STYLES = {
    active: { label: 'Active', cls: 'bg-emerald-500  text-white border-emerald-600' },
    inactive: { label: 'Inactive', cls: 'bg-slate-500    text-white border-slate-600' },
    completed: { label: 'Completed', cls: 'bg-blue-500     text-white border-blue-600' },
    in_progress: { label: 'In Progress', cls: 'bg-amber-500    text-white border-amber-600' },
    pending: { label: 'Pending', cls: 'bg-orange-500   text-white border-orange-600' },
    blocked: { label: 'Blocked', cls: 'bg-red-500      text-white border-red-600' },
    draft: { label: 'Draft', cls: 'bg-zinc-500     text-white border-zinc-600' },
};

const getStatusStyle = (status) => {
    const key = (status || '').toLowerCase().replace(/[\s-]/g, '_');
    return STATUS_STYLES[key] || { label: status || 'N/A', cls: 'bg-black/40 text-white border-white/30' };
};

const ArrowStepCard = ({ module, index, onEdit, onDelete, onViewTask }) => {
    const colorConfig = STEP_COLORS[index % STEP_COLORS.length];
    const ModuleIcon = getModuleIcon(module.name);
    const stepNumber = String(index + 1).padStart(2, '0');
    const statusStyle = getStatusStyle(module.status);

    return (
        <div className="group relative flex items-center justify-center min-w-[260px] md:min-w-[300px] lg:min-w-[320px] px-2 py-3">
            {/* The Arrow Shape Container with Shadow Wrapper */}
            <div
                className="relative w-full py-4 overflow-visible group"
                style={{
                    filter: 'drop-shadow(0 12px 10px rgba(0,0,0,0.3)) drop-shadow(0 5px 4px rgba(0,0,0,0.15))'
                }}
            >
                <div
                    onClick={() => onViewTask(module)}
                    className={cn(
                        "relative w-full h-20 md:h-24 flex items-center transition-all duration-500 group-hover:scale-[1.02] cursor-pointer",
                        colorConfig.bg
                    )}
                    style={{
                        clipPath: 'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)'
                    }}
                >
                    {/* Visual Accent - Left border line */}
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/10" />

                    {/* Content Layout */}
                    <div className="flex items-center w-[85%] px-5 space-x-3">
                        {/* Icon Section */}
                        <div className="relative z-10 flex-shrink-0 p-2 bg-white/10 rounded-xl border border-white/20 backdrop-blur-md">
                            <ModuleIcon className="w-5 h-5 text-white" />
                        </div>

                        {/* Text Section */}
                        <div className="flex flex-col min-w-0 pr-2 gap-0.5">
                            <h4 className="text-sm md:text-base font-black text-white italic tracking-tight uppercase leading-tight break-words whitespace-normal">
                                {module.name}
                            </h4>
                            {/* Status Badge */}
                            <span className={`mt-1 self-start inline-flex items-center px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${statusStyle.cls}`}>
                                {statusStyle.label}
                            </span>
                        </div>
                    </div>

                    {/* Numbering "Cutout" - Half circle on the right arrow tip */}
                    <div
                        className="absolute right-[5%] top-1/2 -translate-y-1/2 w-12 h-18 md:w-14 md:h-20 bg-white/95 flex items-center justify-center shadow-inner"
                        style={{
                            clipPath: 'ellipse(55% 50% at 100% 50%)',
                            height: '72px'
                        }}
                    >
                        <span className="text-base md:text-lg font-black italic tracking-tighter text-slate-400 pl-3">
                            {stepNumber}
                        </span>
                    </div>
                </div>
            </div>

            {/* Management Bar Overlay - Appears on Hover */}
            <div className="absolute inset-x-0 -top-8 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 group-hover:-top-11 transition-all duration-300 z-50">
                <button
                    onClick={() => onViewTask(module)}
                    className="p-2 rounded-xl bg-[#11558E] text-white shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center gap-1.5 border border-white/20"
                >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest pr-1">Tasks</span>
                </button>
                <button
                    onClick={() => onEdit(module)}
                    className="p-2 rounded-xl bg-[#2A7053] text-white shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center gap-1.5 border border-white/20"
                >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest pr-1">Edit</span>
                </button>
                <button
                    onClick={() => onDelete(module)}
                    className="p-2 rounded-xl bg-[#823B6D] text-white shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center gap-1.5 border border-white/20"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest pr-1">Delete</span>
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
        <div className="card space-y-12 pb-20 overflow-visible">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 ">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-primary-500/10 border border-primary-500/20 shadow-inner">
                            <Settings className="w-4 h-4 text-primary-500" />
                        </div>
                        <h2 className="text-xl md:text-xl font-black text-[var(--text-main)] italic tracking-tight uppercase leading-none">
                            Modules
                        </h2>
                    </div>
                    <p className="text-[9px] md:text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] opacity-70">
                        Strategic Module Sequencing
                    </p>
                </div>

                <Button
                    onClick={handleAdd}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    className="h-9 px-5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                    Add Module
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
