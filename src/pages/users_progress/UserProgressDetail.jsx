import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetApiWithIdQuery } from '../../store/api/commonApi';
import {
    ArrowLeft, User, Mail, Phone, Briefcase, Building2,
    CheckCircle2, Clock, ListTodo, BarChart3,
    AlertCircle, TrendingUp, ChevronDown, ChevronUp,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    completed: { color: '#22c55e', label: 'Completed' },
    in_review: { color: '#f59e0b', label: 'In Review' },
    in_progress: { color: '#3b82f6', label: 'In Progress' },
    pending: { color: '#8b5cf6', label: 'Pending' },
    draft: { color: '#94a3b8', label: 'Draft' },
    blocked: { color: '#ef4444', label: 'Blocked' },
    default: { color: '#6b7280', label: 'Unknown' },
};

const PRIORITY_CONFIG = {
    High: { color: '#ef4444' },
    Medium: { color: '#f59e0b' },
    Low: { color: '#22c55e' },
};

const BASE_URL = 'https://api-smedev.bacbonltd.com.bd/';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseDate = (str) => new Date(str + 'T00:00:00');
const msPerDay = 86400000;

const getStatusCfg = (s) => STATUS_CONFIG[s] || STATUS_CONFIG.default;

const formatDate = (str) => {
    if (!str) return 'N/A';
    return parseDate(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function buildTimeline(ganttData) {
    if (!ganttData || ganttData.length === 0) return [];
    const dates = ganttData.flatMap(g => [parseDate(g.start), parseDate(g.end)]);
    const minD = new Date(Math.min(...dates));
    const maxD = new Date(Math.max(...dates));
    const days = [];
    let cur = new Date(minD);
    while (cur <= maxD) {
        days.push(new Date(cur));
        cur = new Date(cur.getTime() + msPerDay);
    }
    return days;
}

// ─── Gantt Bar ────────────────────────────────────────────────────────────────

const GanttBar = ({ task, days }) => {
    const minD = days[0];
    const startD = parseDate(task.start);
    const endD = parseDate(task.end);
    const startIdx = Math.max(0, Math.round((startD - minD) / msPerDay));
    const span = Math.max(1, Math.round((endD - startD) / msPerDay) + 1);
    const cfg = getStatusCfg(task.status);
    const priColor = (PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Low).color;

    return (
        <div
            style={{
                gridColumnStart: startIdx + 1,
                gridColumnEnd: `span ${span}`,
                background: cfg.color,
                borderRadius: '6px',
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                overflow: 'hidden',
                boxShadow: `0 0 0 1px ${cfg.color}40, 0 2px 8px ${cfg.color}30`,
                position: 'relative',
                cursor: 'default',
            }}
            title={`${task.name} | ${formatDate(task.start)} → ${formatDate(task.end)} | ${task.status} | ${task.priority} | ${task.progress}%`}
        >
            <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${task.progress}%`,
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '6px',
                pointerEvents: 'none',
            }} />
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: priColor, flexShrink: 0, boxShadow: `0 0 4px ${priColor}` }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {task.name}
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', marginLeft: 'auto', flexShrink: 0 }}>
                {task.progress}%
            </span>
        </div>
    );
};

// ─── Project Gantt Block ──────────────────────────────────────────────────────

const ProjectGanttBlock = ({ project }) => {
    const [collapsed, setCollapsed] = useState(false);
    const days = useMemo(() => buildTimeline(project.gantt_data), [project.gantt_data]);
    const ts = project.user_task_summary;

    const progressColor =
        project.project_progress >= 80 ? '#22c55e'
            : project.project_progress >= 40 ? '#f59e0b'
                : '#ef4444';

    return (
        <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-main)',
            borderRadius: '14px',
            overflow: 'hidden',
        }}>
            {/* Project Header */}
            <div
                onClick={() => setCollapsed(p => !p)}
                style={{
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    cursor: 'pointer',
                    background: 'var(--bg-app)',
                    transition: 'background 0.15s',
                    flexWrap: 'wrap',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-app)'}
            >
                <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                            {project.project_name}
                        </span>
                        <span style={{
                            fontSize: '11px', fontWeight: 600,
                            padding: '2px 8px', borderRadius: '20px',
                            background: getStatusCfg(project.project_status).color + '25',
                            color: getStatusCfg(project.project_status).color,
                            border: `1px solid ${getStatusCfg(project.project_status).color}40`,
                        }}>
                            {project.project_status}
                        </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4 }}>
                        Start: {formatDate(project.project_start_date)} &nbsp;|&nbsp;
                        Deadline: {formatDate(project.project_deadline)}
                    </div>
                </div>

                {/* Task Summary Chips */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                        { label: 'Total', value: ts.total_tasks, color: '#6366f1' },
                        { label: 'Done', value: ts.completed_tasks, color: '#22c55e' },
                        { label: 'WIP', value: ts.in_progress_tasks, color: '#3b82f6' },
                        { label: 'Pending', value: ts.pending_tasks, color: '#8b5cf6' },
                    ].map(chip => (
                        <div key={chip.label} style={{
                            background: chip.color + '18',
                            border: `1px solid ${chip.color}30`,
                            borderRadius: '8px',
                            padding: '4px 10px',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '15px', fontWeight: 800, color: chip.color }}>{chip.value}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{chip.label}</div>
                        </div>
                    ))}
                </div>

                {/* Project Progress */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', minWidth: 80 }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: progressColor }}>{project.project_progress}%</span>
                    <div style={{ width: 80, height: 6, borderRadius: '3px', background: 'var(--border-main)', overflow: 'hidden' }}>
                        <div style={{ width: `${project.project_progress}%`, height: '100%', background: progressColor, borderRadius: '3px', transition: 'width 0.6s ease' }} />
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Avg {ts.avg_progress_percentage}%</span>
                </div>

                {collapsed ? <ChevronDown size={18} color="var(--text-muted)" /> : <ChevronUp size={18} color="var(--text-muted)" />}
            </div>

            {/* Gantt Chart */}
            {!collapsed && (
                <div>
                    {days.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                            No task timeline data available.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <div style={{
                                minWidth: `${160 + days.length * 36 + 16}px`,
                                padding: '0 0 8px',
                            }}>
                                {/* Date header */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: `160px repeat(${days.length}, 36px)`,
                                    background: 'var(--bg-app)',
                                    borderBottom: '1px solid var(--border-main)',
                                    padding: '0 8px',
                                }}>
                                    <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>TASK</div>
                                    {days.map((d, i) => {
                                        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                        return (
                                            <div key={i} style={{
                                                textAlign: 'center',
                                                fontSize: '10px',
                                                fontWeight: 600,
                                                color: isWeekend ? '#ef4444' : 'var(--text-muted)',
                                                padding: '8px 0',
                                                borderLeft: i % 7 === 0 && i !== 0 ? '1px dashed var(--border-main)' : 'none',
                                            }}>
                                                <div>{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</div>
                                                <div style={{ fontWeight: 800, color: isWeekend ? '#ef4444' : 'var(--text-main)', fontSize: '11px' }}>{d.getDate()}</div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Task Rows */}
                                {project.gantt_data.map(task => (
                                    <div key={task.id} style={{
                                        display: 'grid',
                                        gridTemplateColumns: `160px repeat(${days.length}, 36px)`,
                                        borderBottom: '1px solid var(--border-main)',
                                        minHeight: '48px',
                                        alignItems: 'center',
                                        padding: '0 8px',
                                    }}>
                                        {/* Task label */}
                                        <div style={{
                                            padding: '6px 12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '2px',
                                        }}>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {task.name}
                                            </span>
                                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '10px', color: getStatusCfg(task.status).color, fontWeight: 600 }}>
                                                    {getStatusCfg(task.status).label}
                                                </span>
                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>·</span>
                                                <span style={{ fontSize: '10px', color: (PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Low).color }}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Bars grid area */}
                                        <div style={{
                                            gridColumn: `2 / span ${days.length}`,
                                            display: 'grid',
                                            gridTemplateColumns: `repeat(${days.length}, 36px)`,
                                            alignItems: 'center',
                                            padding: '4px 0',
                                        }}>
                                            <GanttBar task={task} days={days} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const UserProgressDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const { data: response, isLoading, isError } = useGetApiWithIdQuery({
        url: '/admin/user-progress',
        id: userId,
    });

    const rawData = response?.data;
    const user = rawData?.user;
    const summary = rawData?.overall_summary;
    const projects = rawData?.projects || [];

    if (isLoading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '3px solid var(--border-main)', borderTopColor: '#6366f1',
                animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (isError || !user) return (
        <div style={{ textAlign: 'center', padding: '60px' }}>
            <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Failed to load user progress data.</p>
            <button onClick={() => navigate('/admin/user-progress')} style={{ marginTop: 16, padding: '8px 20px', borderRadius: '8px', border: '1px solid var(--border-main)', background: 'var(--bg-card)', color: 'var(--text-main)', cursor: 'pointer' }}>
                Go Back
            </button>
        </div>
    );

    const BASE_URL_IMG = 'https://api-smedev.bacbonltd.com.bd/';
    const overallPct = summary?.overall_progress_percentage ?? 0;
    const progressColor = overallPct >= 80 ? '#22c55e' : overallPct >= 40 ? '#f59e0b' : '#ef4444';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animationName: 'fadeIn', animationDuration: '0.4s' }}>
            {/* Back Button */}
            <button
                onClick={() => navigate('/admin/user-progress')}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500,
                    padding: '4px 0',
                    width: 'fit-content',
                    transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
                <ArrowLeft size={16} />
                Back to User Progress
            </button>

            {/* User Profile Card */}
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-main)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                gap: '20px',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}>
                {/* Avatar */}
                <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    overflow: 'hidden', flexShrink: 0,
                    border: '3px solid var(--border-main)',
                    background: 'var(--bg-app)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}>
                    {user.profile_picture ? (
                        <img src={BASE_URL_IMG + user.profile_picture} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                        <User size={36} color="var(--text-muted)" />
                    )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px' }}>{user.name}</h2>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', padding: '2px 10px', borderRadius: '20px', background: '#6366f120', color: '#6366f1', fontWeight: 600, border: '1px solid #6366f130' }}>
                            {user.user_type}
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 24px' }}>
                        {[
                            { icon: Mail, text: user.email },
                            { icon: Phone, text: user.phone },
                            { icon: Building2, text: user.department },
                            { icon: Briefcase, text: user.designation },
                        ].map(({ icon: I, text }) => text && (
                            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                <I size={13} />
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Overall Progress Ring */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <svg width={80} height={80} viewBox="0 0 80 80">
                        <circle cx={40} cy={40} r={32} fill="none" stroke="var(--border-main)" strokeWidth={8} />
                        <circle
                            cx={40} cy={40} r={32} fill="none"
                            stroke={progressColor}
                            strokeWidth={8}
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 32}`}
                            strokeDashoffset={`${2 * Math.PI * 32 * (1 - overallPct / 100)}`}
                            transform="rotate(-90 40 40)"
                            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                        />
                        <text x={40} y={40} textAnchor="middle" dominantBaseline="middle" fontSize={14} fontWeight={800} fill={progressColor}>
                            {overallPct}%
                        </text>
                    </svg>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Overall</span>
                </div>
            </div>

            {/* Summary Stats */}
            {summary && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    {[
                        { icon: BarChart3, label: 'Projects', value: summary.total_projects, color: '#6366f1' },
                        { icon: ListTodo, label: 'Total Tasks', value: summary.total_tasks, color: '#3b82f6' },
                        { icon: CheckCircle2, label: 'Completed', value: summary.completed_tasks, color: '#22c55e' },
                        { icon: TrendingUp, label: 'Progress', value: `${summary.overall_progress_percentage}%`, color: progressColor },
                    ].map(item => (
                        <div key={item.label} style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-main)',
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}>
                            <div style={{ width: 40, height: 40, borderRadius: '10px', background: item.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <item.icon size={18} color={item.color} />
                            </div>
                            <div>
                                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{item.value}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>{item.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Projects Gantt */}
            <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 12px' }}>
                    Project Timelines
                </h3>
                {projects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: '14px' }}>
                        <Clock size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                        <p style={{ fontSize: '14px' }}>No project data available for this user.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {projects.map(project => (
                            <ProjectGanttBlock key={project.project_id} project={project} />
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default UserProgressDetail;
