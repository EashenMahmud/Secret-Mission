import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetApiQuery } from '../../store/api/commonApi';
import { getImageUrl } from '../../lib/utils';
import {
    User, ChevronRight, Activity, CheckCircle2,
    Clock, AlertCircle, Search, Filter, BarChart3
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    completed: { color: '#22c55e', bg: 'rgba(34,197,94,0.15)', label: 'Completed' },
    in_review: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'In Review' },
    in_progress: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', label: 'In Progress' },
    pending: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', label: 'Pending' },
    default: { color: '#6b7280', bg: 'rgba(107,114,128,0.15)', label: 'Unknown' },
};

const PRIORITY_CONFIG = {
    High: { color: '#ef4444', dot: '#ef4444' },
    Medium: { color: '#f59e0b', dot: '#f59e0b' },
    Low: { color: '#22c55e', dot: '#22c55e' },
};

const BASE_URL = 'https://api-smedev.bacbonltd.com.bd/';

// ─── Helper Functions ─────────────────────────────────────────────────────────

const parseDate = (str) => new Date(str + 'T00:00:00');
const msPerDay = 86400000;

function buildTimeline(minDate, maxDate) {
    const days = [];
    let cur = new Date(minDate);
    const end = new Date(maxDate);
    while (cur <= end) {
        days.push(new Date(cur));
        cur = new Date(cur.getTime() + msPerDay);
    }
    return days;
}

function getStatusCfg(status) {
    return STATUS_CONFIG[status] || STATUS_CONFIG.default;
}

function formatDate(dateStr) {
    const d = parseDate(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Gantt Bar Component ──────────────────────────────────────────────────────

const GanttBar = ({ bar, days, totalCols }) => {
    const minD = days[0];
    const startD = parseDate(bar.start);
    const endD = parseDate(bar.end);
    const startIdx = Math.max(0, Math.round((startD - minD) / msPerDay));
    const span = Math.max(1, Math.round((endD - startD) / msPerDay) + 1);
    const cfg = getStatusCfg(bar.status);
    const priCfg = PRIORITY_CONFIG[bar.priority] || PRIORITY_CONFIG.Low;

    return (
        <div
            className="gantt-bar"
            style={{
                gridColumnStart: startIdx + 1,
                gridColumnEnd: `span ${span}`,
                background: cfg.color,
                borderRadius: '6px',
                padding: '3px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'default',
                overflow: 'hidden',
                minWidth: 0,
                boxShadow: `0 0 0 1px ${cfg.color}40, 0 2px 8px ${cfg.color}30`,
                position: 'relative',
            }}
            title={`${bar.task_title} (${bar.project_name}) | ${formatDate(bar.start)} → ${formatDate(bar.end)} | ${bar.status} | ${bar.priority}`}
        >
            {/* Progress overlay */}
            <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${bar.progress}%`,
                background: 'rgba(255,255,255,0.12)',
                borderRadius: '6px',
                pointerEvents: 'none',
            }} />
            <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: priCfg.dot,
                flexShrink: 0,
                boxShadow: `0 0 4px ${priCfg.dot}`,
            }} />
            <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}>
                {bar.task_title}
            </span>
        </div>
    );
};

// ─── User Row Component ───────────────────────────────────────────────────────

const UserRow = ({ user, days, navigate }) => {
    const hasTask = user.gantt_bars.length > 0;

    return (
        <div className="gantt-user-row" style={{ display: 'contents' }}>
            {/* Left: User Info */}
            <div
                onClick={() => navigate(`/admin/user-progress/${user.user_id}`)}
                style={{
                    gridColumn: '1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderBottom: '1px solid var(--border-main)',
                    cursor: 'pointer',
                    background: 'var(--bg-card)',
                    transition: 'background 0.15s',
                    position: 'sticky',
                    left: 0,
                    zIndex: 2,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-app)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
            >
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    overflow: 'hidden', flexShrink: 0,
                    border: '2px solid var(--border-main)',
                    background: 'var(--bg-app)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {user.profile_picture ? (
                        <img
                            src={BASE_URL + user.profile_picture}
                            alt={user.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <User size={16} color="var(--text-muted)" />
                    )}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                        fontSize: '13px', fontWeight: 600,
                        color: 'var(--text-main)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{user.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.designation}</div>
                </div>
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0,
                }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: user.overall_progress >= 80 ? '#22c55e' : user.overall_progress >= 40 ? '#f59e0b' : '#ef4444' }}>
                        {user.overall_progress}%
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {user.completed_tasks}/{user.total_tasks}
                    </div>
                </div>
                <ChevronRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            </div>

            {/* Right: Gantt bars grid */}
            <div
                style={{
                    gridColumn: '2',
                    borderBottom: '1px solid var(--border-main)',
                    background: hasTask ? 'var(--bg-card)' : 'var(--bg-card)',
                    padding: '0 8px',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${days.length}, 32px)`,
                    alignItems: 'center',
                    gap: '2px',
                    minHeight: '56px',
                    position: 'relative',
                }}
            >
                {/* Alternating day backgrounds */}
                {days.map((d, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        left: `${i * 32}px`,
                        top: 0, bottom: 0,
                        width: '32px',
                        background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                    }} />
                ))}
                {!hasTask && (
                    <div style={{
                        gridColumn: `1 / span ${days.length}`,
                        textAlign: 'center',
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        opacity: 0.5,
                        fontStyle: 'italic',
                    }}>No tasks assigned</div>
                )}
                {user.gantt_bars.map(bar => (
                    <GanttBar key={bar.task_id} bar={bar} days={days} totalCols={days.length} />
                ))}
            </div>
        </div>
    );
};

// ─── Summary Stats ────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-main)',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        flex: '1',
        minWidth: '160px',
    }}>
        <div style={{
            width: 44, height: 44, borderRadius: '10px',
            background: `${color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
        }}>
            <Icon size={20} color={color} />
        </div>
        <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
        </div>
    </div>
);

// ─── Legend ───────────────────────────────────────────────────────────────────

const Legend = () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'default').map(([key, cfg]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <div style={{ width: 12, height: 12, borderRadius: '3px', background: cfg.color }} />
                <span>{cfg.label}</span>
            </div>
        ))}
        <div style={{ width: 1, height: 16, background: 'var(--border-main)', margin: '0 4px' }} />
        {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, boxShadow: `0 0 4px ${cfg.dot}` }} />
                <span>{key}</span>
            </div>
        ))}
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const UserProgress = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filterHasTasks, setFilterHasTasks] = useState(false);

    const { data: response, isLoading, isError } = useGetApiQuery({
        url: '/admin/gantt-chart',
        params: {},
    });

    const rawData = response?.data;
    const users = rawData?.users || [];
    const dateRange = rawData?.date_range;

    const days = useMemo(() => {
        if (!dateRange?.min_date || !dateRange?.max_date) return [];
        return buildTimeline(dateRange.min_date, dateRange.max_date);
    }, [dateRange]);

    const filtered = useMemo(() => {
        let list = users;
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(u =>
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                u.designation?.toLowerCase().includes(q) ||
                u.department?.toLowerCase().includes(q)
            );
        }
        if (filterHasTasks) {
            list = list.filter(u => u.total_tasks > 0);
        }
        return list;
    }, [users, search, filterHasTasks]);

    // Stats
    const totalUsers = users.length;
    const usersWithTasks = users.filter(u => u.total_tasks > 0).length;
    const totalTasks = users.reduce((s, u) => s + u.total_tasks, 0);
    const completedAll = users.reduce((s, u) => s + u.completed_tasks, 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animationName: 'fadeIn', animationDuration: '0.4s' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        User Progress
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                        Track and visualize team task progress across all users
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-main)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                    }}>
                        <Search size={14} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Search users…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                fontSize: '13px',
                                color: 'var(--text-main)',
                                width: '180px',
                            }}
                        />
                    </div>
                    <button
                        onClick={() => setFilterHasTasks(p => !p)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-main)',
                            background: filterHasTasks ? 'var(--primary-500, #6366f1)' : 'var(--bg-card)',
                            color: filterHasTasks ? '#fff' : 'var(--text-muted)',
                            fontSize: '13px', fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        <Filter size={14} />
                        With Tasks
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <StatCard icon={User} label="Total Users" value={totalUsers} color="#6366f1" />
                <StatCard icon={Activity} label="Active Users" value={usersWithTasks} color="#3b82f6" />
                <StatCard icon={Clock} label="Total Tasks" value={totalTasks} color="#f59e0b" />
                <StatCard icon={CheckCircle2} label="Completed Tasks" value={completedAll} color="#22c55e" />
            </div>

            {/* Gantt Chart Card */}
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-main)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            }}>
                {/* Chart Header */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    background: 'var(--bg-card)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BarChart3 size={20} color="var(--text-main)" />
                        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>
                            Team Gantt Chart
                        </span>
                        {dateRange && (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {formatDate(dateRange.min_date)} – {formatDate(dateRange.max_date)}
                            </span>
                        )}
                    </div>
                    <Legend />
                </div>

                {/* Loading / Error */}
                {isLoading && (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%',
                            border: '3px solid var(--border-main)',
                            borderTopColor: '#6366f1',
                            animation: 'spin 0.8s linear infinite',
                            margin: '0 auto 16px',
                        }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading Gantt chart…</p>
                    </div>
                )}
                {isError && (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 12px', display: 'block' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Failed to load Gantt chart data.</p>
                    </div>
                )}

                {/* Gantt Grid */}
                {!isLoading && !isError && days.length > 0 && (
                    <div style={{ overflowX: 'auto' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `260px 1fr`,
                            minWidth: `${260 + days.length * 32 + 16}px`,
                        }}>
                            {/* Date Header Row */}
                            <div style={{
                                gridColumn: '1',
                                background: 'var(--bg-app)',
                                borderBottom: '1px solid var(--border-main)',
                                padding: '10px 12px',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                position: 'sticky',
                                left: 0,
                                zIndex: 3,
                            }}>
                                <User size={13} />
                                <span>USER</span>
                            </div>
                            <div style={{
                                gridColumn: '2',
                                background: 'var(--bg-app)',
                                borderBottom: '1px solid var(--border-main)',
                                padding: '0 8px',
                                display: 'grid',
                                gridTemplateColumns: `repeat(${days.length}, 32px)`,
                            }}>
                                {days.map((d, i) => {
                                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                    return (
                                        <div key={i} style={{
                                            textAlign: 'center',
                                            fontSize: '10px',
                                            fontWeight: 600,
                                            color: isWeekend ? '#ef4444' : 'var(--text-muted)',
                                            padding: '10px 0',
                                            borderLeft: i % 7 === 0 && i !== 0 ? '1px dashed var(--border-main)' : 'none',
                                        }}>
                                            <div>{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</div>
                                            <div style={{ fontSize: '11px', fontWeight: 800, color: isWeekend ? '#ef4444' : 'var(--text-main)' }}>{d.getDate()}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* User Rows */}
                            {filtered.length === 0 ? (
                                <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center' }}>
                                    <Search size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
                                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No users match your search.</p>
                                </div>
                            ) : (
                                filtered.map(user => (
                                    <UserRow key={user.user_id} user={user} days={days} navigate={navigate} />
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                {!isLoading && !isError && (
                    <div style={{
                        padding: '10px 20px',
                        borderTop: '1px solid var(--border-main)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        background: 'var(--bg-app)',
                    }}>
                        <span>Showing {filtered.length} of {totalUsers} users</span>
                        <span>Click a user row to view detailed progress →</span>
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

export default UserProgress;
