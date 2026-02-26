import { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useGetApiWithIdQuery } from '../../../store/api/commonApi';
import {
    CalendarDays,
    Layers,
    ClipboardList,
    CheckCircle2,
    Clock,
    AlertTriangle,
    XCircle,
    Loader2,
    ChevronRight,
    Info,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const isSameDay = (a, b) => {
    const da = new Date(a);
    const db = new Date(b);
    return (
        da.getFullYear() === db.getFullYear() &&
        da.getMonth() === db.getMonth() &&
        da.getDate() === db.getDate()
    );
};

const isInRange = (date, start, end) => {
    const d = new Date(date).setHours(0, 0, 0, 0);
    const s = new Date(start).setHours(0, 0, 0, 0);
    const e = new Date(end).setHours(0, 0, 0, 0);
    return d >= s && d <= e;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
};

// ─── Status styling ──────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    completed: { color: '#10b981', bg: 'bg-emerald-500', light: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
    in_progress: { color: '#3b82f6', bg: 'bg-blue-500', light: 'bg-blue-500/10    text-blue-600    dark:text-blue-400    border-blue-500/20', icon: Clock },
    pending: { color: '#f59e0b', bg: 'bg-amber-500', light: 'bg-amber-500/10   text-amber-600   dark:text-amber-400   border-amber-500/20', icon: Clock },
    blocked: { color: '#ef4444', bg: 'bg-red-500', light: 'bg-red-500/10     text-red-600     dark:text-red-400     border-red-500/20', icon: XCircle },
    draft: { color: '#6b7280', bg: 'bg-gray-500', light: 'bg-gray-500/10    text-gray-600    dark:text-gray-400    border-gray-500/20', icon: Info },
    in_review: { color: '#8b5cf6', bg: 'bg-violet-500', light: 'bg-violet-500/10  text-violet-600  dark:text-violet-400  border-violet-500/20', icon: AlertTriangle },
};

const getStatus = (status) => {
    const key = (status || '').toLowerCase().replace(/[\s-]/g, '_');
    return STATUS_CONFIG[key] || STATUS_CONFIG.pending;
};

// ─── Event builder ───────────────────────────────────────────────────────────

const buildEvents = (data) => {
    const events = [];

    // Tasks
    (data.tasks || []).forEach((t) => {
        if (t.start_date || t.deadline) {
            events.push({
                id: `task-${t.id}`,
                type: 'task',
                label: t.title,
                start: t.start_date,
                end: t.deadline,
                status: t.status,
                priority: t.priority,
            });
        }
    });

    // Modules
    (data.project_modules || []).forEach((m) => {
        if (m.created_at) {
            events.push({
                id: `module-${m.id}`,
                type: 'module',
                label: m.name,
                start: m.created_at,
                end: m.completed_at || m.created_at,
                status: m.status,
            });
        }
    });

    // Planning
    (data.project_planning || []).forEach((p) => {
        if (p.start_date || p.end_date) {
            events.push({
                id: `plan-${p.id}`,
                type: 'planning',
                label: p.planning_type?.name || 'Planning',
                start: p.start_date,
                end: p.end_date,
                status: p.status,
            });
        }
    });

    return events;
};

// ─── Dot badges for calendar tiles ───────────────────────────────────────────

const TYPE_DOT = {
    task: '#3b82f6',  // blue
    module: '#8b5cf6',  // violet
    planning: '#f59e0b',  // amber
};

// ─── Event Card ──────────────────────────────────────────────────────────────

const EventCard = ({ event }) => {
    const sc = getStatus(event.status);
    const Icon = sc.icon;
    const typeLabel = event.type === 'task' ? 'Task' : event.type === 'module' ? 'Module' : 'Planning';
    const typeColor = event.type === 'task' ? 'text-blue-500' : event.type === 'module' ? 'text-violet-500' : 'text-amber-500';

    return (
        <div className={`flex items-start gap-3 p-3 rounded-xl border ${sc.light} bg-opacity-50 transition-all hover:scale-[1.01]`}>
            <div className="mt-0.5 flex-shrink-0">
                <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${typeColor}`}>{typeLabel}</span>
                    {event.priority && (
                        <span className="text-[9px] font-bold uppercase bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-full">
                            {event.priority}
                        </span>
                    )}
                </div>
                <p className="font-bold text-sm text-[var(--text-main)] truncate mt-0.5">{event.label}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[var(--text-muted)]">
                    <CalendarDays className="w-3 h-3" />
                    <span>{formatDate(event.start)}</span>
                    {event.end && !isSameDay(event.start, event.end) && (
                        <>
                            <ChevronRight className="w-3 h-3" />
                            <span>{formatDate(event.end)}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Legend item ─────────────────────────────────────────────────────────────

const LegendItem = ({ color, label }) => (
    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--text-muted)]">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        {label}
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ProjectCalendar = ({ projectId }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const { data: response, isLoading } = useGetApiWithIdQuery(
        { url: '/project-details-for-calender', id: projectId },
        { skip: !projectId }
    );

    const data = response?.data;

    const events = useMemo(() => (data ? buildEvents(data) : []), [data]);

    // Events for selected date
    const selectedEvents = useMemo(() => {
        if (!selectedDate) return [];
        return events.filter((e) => {
            if (e.start && isSameDay(selectedDate, e.start)) return true;
            if (e.end && isSameDay(selectedDate, e.end)) return true;
            return false;
        });
    }, [selectedDate, events]);

    // Dot data per date
    const getTileContent = ({ date, view }) => {
        if (view !== 'month') return null;
        const dayEvents = events.filter((e) => {
            if (e.start && isSameDay(date, e.start)) return true;
            if (e.end && isSameDay(date, e.end)) return true;
            return false;
        });
        if (dayEvents.length === 0) return null;

        const statuses = [...new Set(dayEvents.map((e) => (e.status || 'pending').toLowerCase().replace(/[\s-]/g, '_')))];

        return (
            <div className="flex justify-center gap-0.5 mt-0.5">
                {statuses.map((s) => (
                    <span
                        key={s}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: STATUS_CONFIG[s]?.color || '#ccc' }}
                    />
                ))}
            </div>
        );
    };

    const getTileClassName = ({ date, view }) => {
        if (view !== 'month') return '';
        const dayEvents = events.filter((e) => {
            if (e.start && isSameDay(date, e.start)) return true;
            if (e.end && isSameDay(date, e.end)) return true;
            return false;
        });

        if (dayEvents.length > 0) {
            const hasDraft = dayEvents.some(e => e.status?.toLowerCase() === 'draft');
            return `has-event ${hasDraft ? 'tile-draft' : ''}`;
        }
        return '';
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);

        // Filter events for the clicked date to log them (milestones only: start or end)
        const dayEvents = events.filter((e) => {
            if (e.start && isSameDay(date, e.start)) return true;
            if (e.end && isSameDay(date, e.end)) return true;
            return false;
        });

        console.log(`%c📅 Events for ${date.toLocaleDateString()}:`, 'color: #3b82f6; font-weight: bold; font-size: 12px;', dayEvents);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                    <span className="text-xs font-black uppercase tracking-widest">Loading Calendar…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="card space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary-500/10 border border-primary-500/20">
                    <CalendarDays className="w-4 h-4 text-primary-500" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-[var(--text-main)] italic tracking-tight uppercase leading-none">
                        Project Calendar
                    </h2>
                    <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] opacity-70">
                        {data?.name || 'Timeline Overview'}
                    </p>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 px-1">
                <LegendItem color={TYPE_DOT.task} label="Tasks" />
                <LegendItem color={TYPE_DOT.module} label="Modules" />
                <LegendItem color={TYPE_DOT.planning} label="Planning" />
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 ml-auto justify-end">
                    {Object.entries(STATUS_CONFIG).map(([key, sc]) => (
                        <LegendItem key={key} color={sc.color} label={key.replace('_', ' ')} />
                    ))}
                </div>
            </div>

            {/* Calendar + Sidebar */}
            <div className="flex flex-col xl:flex-row gap-6 items-start">
                {/* Calendar */}
                <div className="w-full xl:flex-1 project-calendar-wrapper">
                    <style>{`
                        .project-calendar-wrapper .react-calendar {
                            width: 100%;
                            background: var(--bg-card);
                            border: 1px solid var(--border-main);
                            border-radius: 1rem;
                            padding: 1rem;
                            font-family: inherit;
                            color: var(--text-main);
                        }
                        .project-calendar-wrapper .react-calendar__navigation {
                            display: flex;
                            align-items: center;
                            margin-bottom: 1rem;
                        }
                        .project-calendar-wrapper .react-calendar__navigation button {
                            background: transparent;
                            border: none;
                            color: var(--text-main);
                            font-size: 0.95rem;
                            font-weight: 900;
                            padding: 6px 10px;
                            border-radius: 8px;
                            cursor: pointer;
                            transition: background 0.2s;
                        }
                        .project-calendar-wrapper .react-calendar__navigation button:hover {
                            background: var(--bg-app);
                        }
                        .project-calendar-wrapper .react-calendar__month-view__weekdays {
                            text-align: center;
                            font-size: 9px;
                            font-weight: 900;
                            text-transform: uppercase;
                            letter-spacing: 0.15em;
                            color: var(--text-muted);
                            margin-bottom: 4px;
                        }
                        .project-calendar-wrapper .react-calendar__month-view__weekdays abbr {
                            text-decoration: none;
                        }
                        .project-calendar-wrapper .react-calendar__tile {
                            background: transparent;
                            border: none;
                            color: var(--text-main);
                            border-radius: 10px;
                            padding: 8px 4px;
                            font-size: 0.78rem;
                            font-weight: 600;
                            cursor: pointer;
                            transition: background 0.15s, transform 0.1s;
                            position: relative;
                        }
                        .project-calendar-wrapper .react-calendar__tile:hover {
                            background: var(--bg-app);
                            transform: scale(1.07);
                        }
                        .project-calendar-wrapper .react-calendar__tile--active {
                            background: linear-gradient(135deg, var(--primary-500, #6366f1), var(--primary-600, #4f46e5)) !important;
                            color: white !important;
                            box-shadow: 0 4px 12px rgba(99,102,241,0.4);
                        }
                        .project-calendar-wrapper .react-calendar__tile--now {
                            background: var(--bg-app);
                            border: 2px solid var(--primary-500, #6366f1);
                            color: var(--primary-500, #6366f1);
                            font-weight: 900;
                        }
                        .project-calendar-wrapper .react-calendar__tile.has-event {
                            font-weight: 900;
                        }
                        .project-calendar-wrapper .react-calendar__tile.tile-draft {
                            background: rgba(107, 114, 128, 0.08);
                            border: 1px dashed rgba(107, 114, 128, 0.3);
                        }
                        .project-calendar-wrapper .react-calendar__month-view__days__day--neighboringMonth {
                            opacity: 0.3;
                        }
                    `}</style>
                    <Calendar
                        onChange={handleDateChange}
                        value={selectedDate}
                        tileContent={getTileContent}
                        tileClassName={getTileClassName}
                    />
                </div>

                {/* Sidebar - Events for selected date */}
                <div className="w-full xl:w-80 flex-shrink-0 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
                            {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
                        </h3>
                        {selectedEvents.length > 0 && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-500">
                                {selectedEvents.length} event{selectedEvents.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    {selectedEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[var(--border-main)] rounded-2xl opacity-40">
                            <CalendarDays className="w-10 h-10 mb-3 text-[var(--text-muted)]" />
                            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">No events</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                            {selectedEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    )}

                    {/* Stats Strip */}
                    {data && (
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            <div className="flex flex-col items-center p-2 rounded-xl border border-[var(--border-main)] bg-[var(--bg-app)]/50">
                                <ClipboardList className="w-4 h-4 text-blue-500 mb-1" />
                                <span className="text-lg font-black text-[var(--text-main)]">{data.tasks?.length ?? 0}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">Tasks</span>
                            </div>
                            <div className="flex flex-col items-center p-2 rounded-xl border border-[var(--border-main)] bg-[var(--bg-app)]/50">
                                <Layers className="w-4 h-4 text-violet-500 mb-1" />
                                <span className="text-lg font-black text-[var(--text-main)]">{data.project_modules?.length ?? 0}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">Modules</span>
                            </div>
                            <div className="flex flex-col items-center p-2 rounded-xl border border-[var(--border-main)] bg-[var(--bg-app)]/50">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-1" />
                                <span className="text-lg font-black text-[var(--text-main)]">{data.task_completion_percentage ?? 0}%</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">Done</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectCalendar;
