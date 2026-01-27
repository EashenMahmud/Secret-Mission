import { useMemo } from 'react';
import { Chart } from 'react-google-charts';
import { GanttChart } from 'lucide-react';
import { useGetApiWithIdQuery } from '../../../store/api/commonApi';

const ProjectGanttGoogle = ({
    projectId,
    projectStart,
    projectEnd,
    items: itemsProp,
    className = '',
    minHeight = 420,
}) => {
    const { data: planningRes } = useGetApiWithIdQuery(
        { url: '/project-planning-list', id: projectId },
        { skip: !projectId || itemsProp !== undefined }
    );

    const items = itemsProp ?? planningRes?.data?.data ?? planningRes?.data ?? [];

    const chartData = useMemo(() => {
        const header = ['Task ID', 'Task Name', 'Start', 'End', 'Duration', 'Percent', 'Dependencies'];
        const rows = items.map((item) => {
            const start = item.start_date ? new Date(item.start_date) : null;
            const end = item.end_date ? new Date(item.end_date) : null;
            const name = item.description || item.title || item.name || 'Untitled';
            const pct = item.progress != null ? Number(item.progress) : 0;
            return [
                String(item.id),
                name,
                start,
                end,
                null,
                Math.min(100, Math.max(0, pct)),
                null,
            ];
        });
        return [header, ...rows];
    }, [items]);

    const options = useMemo(
        () => ({
            height: Math.max(minHeight, items.length * 42 + 40),
            gantt: {
                trackHeight: 36,
                barHeight: 24,
                barCornerRadius: 4,
                percentEnabled: true,
                shadowEnabled: false,
                defaultStartDateMillis: projectStart ? new Date(projectStart).getTime() : undefined,
                defaultEndDateMillis: projectEnd ? new Date(projectEnd).getTime() + 30 * 24 * 60 * 60 * 1000 : undefined,
            },
            backgroundColor: 'transparent',
            chartArea: { left: 180, top: 24, width: '70%', height: '85%' },
            hAxis: {
                textStyle: { color: '#94a3b8', fontSize: 11 },
                baselineColor: '#334155',
                gridlines: { color: '#334155' },
            },
            vAxis: {
                textStyle: { color: '#e2e8f0', fontSize: 12 },
                baselineColor: '#334155',
                gridlines: { color: '#334155' },
            },
        }),
        [items.length, projectStart, projectEnd, minHeight]
    );

    if (!items.length) {
        return (
            <div className={`space-y-4 ${className}`}>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/15 border border-primary-500/25">
                        <GanttChart className="h-5 w-5 text-primary-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-white">Timeline (Gantt)</h3>
                        <p className="text-xs text-slate-400">Project schedule at a glance</p>
                    </div>
                </div>
                <div
                    className="flex flex-col items-center justify-center rounded-xl border border-dark-700 bg-dark-900/50 py-14"
                    style={{ minHeight }}
                >
                    <div className="rounded-full bg-dark-800 p-4 mb-3 ring-1 ring-dark-600">
                        <GanttChart className="w-8 h-8 text-slate-500" />
                    </div>
                    <p className="text-slate-300 font-medium">No planning items yet</p>
                    <p className="text-slate-500 text-sm mt-1">Add planning items above to see the Gantt chart here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/15 border border-primary-500/25">
                    <GanttChart className="h-5 w-5 text-primary-400" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-white">Timeline (Gantt)</h3>
                    <p className="text-xs text-slate-400">Project schedule at a glance</p>
                </div>
            </div>
            <div
                className="rounded-xl border border-dark-700 bg-dark-900/50 overflow-hidden [&_.google-visualization-tooltip]:!bg-dark-800 [&_.google-visualization-tooltip]:!text-slate-200 [&_.google-visualization-tooltip]:!border-dark-600 [&_.google-visualization-tooltip]:!rounded-lg [&_svg]:max-w-full"
                style={{ minHeight }}
            >
                <Chart
                    chartType="Gantt"
                    data={chartData}
                    options={options}
                    width="100%"
                    height={options.height}
                    loader={
                        <div className="flex items-center justify-center text-slate-500" style={{ minHeight }}>
                            <span className="text-sm">Loading chart…</span>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default ProjectGanttGoogle;
