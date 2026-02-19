import { useNavigate } from 'react-router-dom';
import { useGetApiWithIdQuery } from '../../../store/api/commonApi';
import { cn } from '../../../lib/utils';
import {
    Database,
    Lock,
    Settings,
    Users,
    Layout,
    ShieldCheck,
    Cpu,
    Cloud,
    Box,
    ChevronRight,
    CircleCheck,
    Clock,
    AlertCircle,
    FileText
} from 'lucide-react';

const STATUS_CONFIG = {
    completed: {
        theme: 'green',
        icon: CircleCheck,
        bg: 'bg-green-500/5',
        border: 'border-green-500',
        text: 'text-green-500',
        label: 'Completed'
    },
    in_progress: {
        theme: 'blue',
        icon: Clock,
        bg: 'bg-blue-500/5',
        border: 'border-blue-500',
        text: 'text-blue-500',
        label: 'In Progress'
    },
    pending: {
        theme: 'amber',
        icon: AlertCircle,
        bg: 'bg-amber-500/5',
        border: 'border-amber-500',
        text: 'text-amber-500',
        label: 'Pending'
    },
    blocked: {
        theme: 'red',
        icon: AlertCircle,
        bg: 'bg-red-500/5',
        border: 'border-red-500',
        text: 'text-red-500',
        label: 'Blocked'
    },
    draft: {
        theme: 'slate',
        icon: FileText,
        bg: 'bg-slate-500/5',
        border: 'border-slate-400',
        text: 'text-slate-400',
        label: 'Draft'
    }
};

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

const ProjectModuleStepView = ({ projectId }) => {
    const navigate = useNavigate();
    const { data: modulesResponse, isLoading } = useGetApiWithIdQuery(
        { url: '/project-module-list', id: projectId },
        { skip: !projectId }
    );

    const modules = modulesResponse?.data?.data || modulesResponse?.data || [];

    if (isLoading) {
        return (
            <div className="card h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-[var(--text-muted)] text-sm font-medium">Building Roadmap...</p>
                </div>
            </div>
        );
    }

    if (modules.length === 0) {
        return (
            <div className="card h-[300px] flex flex-col items-center justify-center border-dashed border-2 border-[var(--border-main)]">
                <Box className="w-12 h-12 text-[var(--text-muted)] opacity-20 mb-3" />
                <h3 className="text-lg font-bold text-[var(--text-main)]">No Modules Found</h3>
                <p className="text-[var(--text-muted)] text-sm mt-1">Initialize project modules to see the roadmap.</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 border border-primary-500/20 shadow-sm">
                        <Layout className="h-5 w-5 text-primary-500" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-[var(--text-main)] italic tracking-tight uppercase">Project Modules</h2>
                </div>
            </div>

            <div className="card p-0 bg-transparent border-none">
                <div className="relative py-12 md:py-24 overflow-hidden">
                    {/* Connecting Background Path - Horizontal (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--border-main)] to-transparent -translate-y-1/2" />

                    {/* Connecting Background Path - Vertical (Mobile) */}
                    <div className="block md:hidden absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[var(--border-main)] to-transparent -translate-x-1/2" />

                    <div className="flex flex-col md:flex-row items-center justify-center gap-24 md:gap-20 pb-12 hide-scrollbar px-4 md:px-10 relative z-10">
                        {modules.map((module, index) => {
                            const config = STATUS_CONFIG[module.status] || STATUS_CONFIG.draft;
                            const ModuleIcon = getModuleIcon(module.name);
                            const StatusIcon = config.icon;

                            return (
                                <div key={module.id} className="relative flex flex-col items-center">
                                    {/* Main Bubble */}
                                    <button
                                        onClick={() => navigate(`/projects/${projectId}/planning/${module.id}`)}
                                        className={cn(
                                            "group relative w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-500",
                                            "bg-[var(--bg-card)] border-[6px] shadow-2xl overflow-hidden",
                                            config.border,
                                            "hover:scale-110 hover:border-primary-500 active:scale-95"
                                        )}
                                    >
                                        {/* Status Glow Overlay */}
                                        <div className={cn("absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity", config.bg)} />

                                        {/* Icon */}
                                        <div className={cn("relative z-30 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1 group-hover:text-white", config.text)}>
                                            <ModuleIcon className="w-8 h-8 md:w-10 md:h-10 stroke-[1.5]" />
                                        </div>

                                        {/* Progress Text - Small at bottom */}
                                        <div className="mt-1 relative z-30">
                                            <span className={cn("text-[9px] md:text-[10px] font-black tracking-widest uppercase opacity-80 group-hover:opacity-100 group-hover:text-white transition-colors duration-500", config.text)}>
                                                {module.progress ?? 0}%
                                            </span>
                                        </div>

                                        {/* Hover Overlay for Link */}
                                        <div className="absolute inset-0 z-20 bg-primary-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex items-end justify-center pb-2">
                                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white/50 animate-bounce transition-all" />
                                        </div>
                                    </button>

                                    {/* Labels Section */}
                                    <div className="relative md:absolute mt-4 md:mt-0 md:-bottom-16 w-48 text-center flex flex-col items-center gap-1">
                                        <div className="flex items-center gap-2 group/status">
                                            <StatusIcon className={cn("w-3 md:w-3.5 h-3 md:h-3.5", config.text)} />
                                            <span className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-widest", config.text)}>
                                                {config.label}
                                            </span>
                                        </div>
                                        <h3 className="font-black text-[var(--text-main)] text-xs md:text-sm leading-tight tracking-tight uppercase max-w-[140px] line-clamp-2">
                                            {module.name}
                                        </h3>
                                    </div>

                                    {/* Connecting Stem inside the row (Desktop Only) */}
                                    <div className="hidden md:block absolute top-1/2 -translate-y-full mb-16 h-8 w-px bg-gradient-to-t from-[var(--border-main)] to-transparent opacity-20" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Simplified Legend */}
            <div className="mt-8 md:mt-12 flex flex-wrap justify-center gap-6 md:gap-10">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <div key={key} className="flex items-center gap-2">
                        <div className={cn("w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2", config.border, config.bg)} />
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-70">
                            {config.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectModuleStepView;
