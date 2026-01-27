import { useMemo } from 'react';

/**
 * Simple Gantt chart for project planning items.
 * Expects items with: id, title/name, start_date, end_date
 */
const ProjectGantt = ({ items = [], projectStart, projectEnd, className = '' }) => {
    const { rangeStart, rangeEnd, gridMonths } = useMemo(() => {
        const starts = items.map((i) => (i.start_date ? new Date(i.start_date).getTime() : null)).filter(Boolean);
        const ends = items.map((i) => (i.end_date ? new Date(i.end_date).getTime() : null)).filter(Boolean);
        const fallbackStart = starts.length ? Math.min(...starts) : 0;
        const fallbackEnd = ends.length ? Math.max(...ends) : 0;
        const min = projectStart ? new Date(projectStart).getTime() : (starts.length ? Math.min(...starts) : fallbackStart || 0);
        const max = projectEnd ? new Date(projectEnd).getTime() : (ends.length ? Math.max(...ends) : fallbackEnd || 0);
        const total = Math.max(max - min, 1);
        const scalePct = (t) => ((new Date(t).getTime() - min) / total) * 100;
        const gridMonths = [];
        const d = new Date(min);
        const endDate = new Date(max);
        while (d <= endDate) {
            gridMonths.push({ label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), left: scalePct(d.getTime()) });
            d.setMonth(d.getMonth() + 1);
        }
        return { rangeStart: min, rangeEnd: max, total, gridMonths };
    }, [items, projectStart, projectEnd]);

    if (!items.length) {
        return (
            <div className={`rounded-xl border border-slate-700/50 bg-slate-900/50 p-8 text-center ${className}`}>
                <p className="text-slate-400">No planning items yet. Add items to see the Gantt chart.</p>
            </div>
        );
    }

    return (
        <div className={`overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/50 ${className}`}>
            <div className="min-w-[600px]">
                {/* Month labels */}
                <div className="flex border-b border-slate-700/50 px-4 py-2 text-xs text-slate-400">
                    <div className="w-48 flex-shrink-0 font-medium text-slate-300">Task</div>
                    <div className="relative flex-1">
                        {gridMonths.map((m, i) => (
                            <span key={i} className="absolute text-slate-500" style={{ left: `${m.left}%` }}>{m.label}</span>
                        ))}
                    </div>
                </div>
                {/* Bars */}
                <div className="divide-y divide-slate-800/50">
                    {items.map((item) => {
                        const start = item.start_date ? new Date(item.start_date).getTime() : rangeStart;
                        const end = item.end_date ? new Date(item.end_date).getTime() : rangeEnd;
                        const left = ((start - rangeStart) / (rangeEnd - rangeStart)) * 100;
                        const width = Math.max(((end - start) / (rangeEnd - rangeStart)) * 100, 2);
                        const name = item.description || item.title || item.name || 'Untitled';
                        return (
                            <div key={item.id} className="flex min-h-[44px] items-center px-4 py-2 hover:bg-slate-800/30">
                                <div className="w-48 flex-shrink-0 truncate pr-4 text-sm font-medium text-slate-200" title={name}>
                                    {name}
                                </div>
                                <div className="relative flex-1 py-1">
                                    <div className="absolute inset-0">
                                        <div
                                            className="h-full rounded-md bg-gradient-to-r from-primary-500/80 to-primary-400/80"
                                            style={{ left: `${left}%`, width: `${width}%`, minWidth: '4px' }}
                                            title={`${item.start_date ? new Date(item.start_date).toLocaleDateString() : '-'} → ${item.end_date ? new Date(item.end_date).toLocaleDateString() : '-'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProjectGantt;
