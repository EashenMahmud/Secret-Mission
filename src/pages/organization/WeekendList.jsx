import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
    useGetApiQuery,
} from '../../store/api/commonApi';
import Button from '../../components/ui/Button';
import {
    Plus,
    Calendar as CalendarIcon,
    Info,
    ChevronLeft,
    ChevronRight,
    CalendarClock,
    LayoutGrid,
    Search
} from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import HolidayForm from './HolidayForm';
import { motion, AnimatePresence } from 'framer-motion';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const CustomToolbar = (toolbar) => {
    const goToBack = () => {
        toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
        toolbar.onNavigate('NEXT');
    };

    const goToToday = () => {
        toolbar.onNavigate('TODAY');
    };

    const label = () => {
        const date = toolbar.date;
        return (
            <div className="flex flex-col">
                <span className="text-2xl font-black text-[var(--text-main)] tracking-tight">
                    {format(date, 'MMMM')}
                </span>
                <span className="text-sm font-bold text-primary-500 uppercase tracking-widest leading-none">
                    {format(date, 'yyyy')}
                </span>
            </div>
        );
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-[var(--bg-card)]/50 backdrop-blur-md p-4 rounded-3xl border border-[var(--border-main)]/50 shadow-xl shadow-primary-500/5">
            <div className="flex items-center gap-6">
                {label()}
                <div className="flex items-center bg-[var(--bg-app)]/80 p-1.5 rounded-2xl border border-[var(--border-main)]/50">
                    <button
                        onClick={goToBack}
                        className="p-2 hover:bg-[var(--bg-card)] hover:text-primary-600 rounded-xl transition-all duration-300 text-[var(--text-muted)] hover:shadow-lg active:scale-90"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 hover:bg-[var(--bg-card)] hover:text-primary-600 rounded-xl transition-all duration-300 text-sm font-bold text-[var(--text-main)] hover:shadow-lg"
                    >
                        Today
                    </button>
                    <button
                        onClick={goToNext}
                        className="p-2 hover:bg-[var(--bg-card)] hover:text-primary-600 rounded-xl transition-all duration-300 text-[var(--text-muted)] hover:shadow-lg active:scale-90"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="h-10 w-[1px] bg-[var(--border-main)] mx-2 hidden sm:block"></div>
                <div className="flex items-center gap-2">
                    {/* <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/20 cursor-pointer hover:scale-105 transition-transform">
                        <LayoutGrid className="h-5 w-5" />
                    </div> */}
                </div>
            </div>
        </div>
    );
};

const WeekendList = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

    // Fetch holidays
    const { data: holidayResponse, isLoading: isLoadingHolidays, refetch: refetchHolidays } = useGetApiQuery({
        url: '/holiday-list'
    });

    // Fetch weekend dates for the current year
    const { data: weekendResponse, isLoading: isLoadingWeekends } = useGetApiQuery({
        url: `/get-weekend-dates/${currentYear}`
    });

    const events = useMemo(() => {
        const holidayEvents = (holidayResponse?.data || []).map(h => ({
            id: `h-${h.id}`,
            title: h.title,
            start: new Date(h.date),
            end: new Date(h.date),
            allDay: true,
            type: 'holiday'
        }));

        const weekendEvents = (weekendResponse?.data?.dates || []).map((dateStr, index) => ({
            id: `w-${index}`,
            title: 'Weekend',
            start: new Date(dateStr),
            end: new Date(dateStr),
            allDay: true,
            type: 'weekend'
        }));

        return [...holidayEvents, ...weekendEvents];
    }, [holidayResponse, weekendResponse]);

    const eventStyleGetter = (event) => {
        let style = {
            borderRadius: '10px',
            opacity: 0.9,
            color: 'white',
            border: 'none',
            display: 'block',
            padding: '4px 8px',
            fontSize: '0.7rem',
            fontWeight: '700',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            marginBottom: '2px',
            transition: 'all 0.2s ease'
        };

        if (event.type === 'holiday') {
            style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
            style.boxShadow = '0 6px 15px -3px rgba(59, 130, 246, 0.4)';
            style.color = 'white';
            style.marginBottom = '6px';
        } else if (event.type === 'weekend') {
            style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            style.boxShadow = '0 4px 10px -2px rgba(16, 185, 129, 0.3)';
            style.color = 'white';
            style.marginBottom = '6px';
        }

        return {
            style: style,
            className: 'hover:scale-[1.02] active:scale-95'
        };
    };

    const handleSelectSlot = ({ start }) => {
        const formattedDate = format(start, 'yyyy-MM-dd');
        setSelectedDate(formattedDate);
        setIsFormOpen(true);
    };

    const onNavigate = (newDate) => {
        setCurrentDate(newDate);
        const newYear = newDate.getFullYear();
        if (newYear !== currentYear) {
            setCurrentYear(newYear);
        }
    };

    return (
        <div className="space-y-8 p-1 sm:p-4 max-w-[1600px] mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2.5 bg-primary-600 rounded-2xl shadow-lg shadow-primary-500/20">
                            <CalendarClock className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">
                            Holiday <span className="text-primary-600">&</span> Weekends
                        </h1>
                    </div>
                    <p className="text-[var(--text-muted)] text-sm font-medium ml-12">Organization-wide schedule and leave management.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => {
                            setSelectedDate(null);
                            setIsFormOpen(true);
                        }}
                        className="primary text-base font-bold"
                        leftIcon={<Plus className="h-5 w-5" />}
                    >
                        Add Holiday
                    </Button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="xl:col-span-1 space-y-6"
                >
                    <Card className="border-none shadow-2xl shadow-indigo-500/5 bg-[var(--bg-card)] rounded-[2rem] overflow-hidden">
                        <CardBody className="p-8 space-y-8">
                            <div>
                                <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <span className="w-8 h-[2px] bg-[var(--border-main)]"></span>
                                    Legend
                                </h3>
                                <div className="space-y-4">
                                    <div className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-blue-500/10 transition-colors cursor-default border border-transparent hover:border-blue-500/20">
                                        <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
                                            <CalendarIcon className="h-6 w-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[var(--text-main)]">Public Holiday</span>
                                            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Leave Day</span>
                                        </div>
                                    </div>
                                    <div className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-emerald-500/10 transition-colors cursor-default border border-transparent hover:border-emerald-500/20">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                            <CalendarIcon className="h-6 w-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[var(--text-main)]">Weekly Weekend</span>
                                            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Recurring</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative overflow-hidden bg-[var(--bg-card)] rounded-[2rem] p-6 text-[var(--text-main)] group cursor-pointer active:scale-[0.98] transition-transform shadow-2xl shadow-primary-500/5">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Info className="h-20 w-20 rotate-12" />
                                </div>
                                <div className="relative z-10 space-y-3">
                                    <div className="flex items-center gap-2 text-primary-400 font-black text-[10px] uppercase tracking-widest">
                                        <Info className="h-3 w-3" />
                                        <span>Pro Tip</span>
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed text-[var(--text-muted)] italic">
                                        Select any date slot on the calendar grid to instantly open the holiday creation form.
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="xl:col-span-3"
                >
                    <Card className="border-none shadow-2xl shadow-primary-500/5 bg-[var(--bg-card)] rounded-[2.5rem] overflow-hidden border border-[var(--border-main)]">
                        <CardBody className="p-2 sm:p-6 pb-2">
                            <div style={{ height: '750px' }} className="calendar-container">
                                <Calendar
                                    localizer={localizer}
                                    events={events}
                                    startAccessor="start"
                                    endAccessor="end"
                                    date={currentDate}
                                    onNavigate={onNavigate}
                                    style={{ height: '100%' }}
                                    eventPropGetter={eventStyleGetter}
                                    onSelectSlot={handleSelectSlot}
                                    selectable
                                    views={['month']}
                                    components={{
                                        toolbar: CustomToolbar,
                                        event: ({ event }) => (
                                            <div className="truncate py-0.5 px-1 font-bold" title={event.title}>
                                                {event.title}
                                            </div>
                                        )
                                    }}
                                />
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            </div>

            <HolidayForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={refetchHolidays}
                initialDate={selectedDate}
            />

            <style>{`
                .calendar-container .rbc-calendar {
                    background: transparent;
                    border: none;
                    font-family: inherit;
                }
                .calendar-container .rbc-month-view {
                    border: 1px solid var(--border-main) !important;
                    border-radius: 0 !important;
                    background-color: var(--bg-card) !important;
                }
                .calendar-container .rbc-header {
                    border-bottom: 1px solid var(--border-main) !important;
                    border-left: 1px solid var(--border-main) !important;
                    padding: 16px 0 !important;
                    font-weight: 800 !important;
                    color: var(--text-main) !important;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    letter-spacing: 0.1em;
                    background-color: var(--bg-app) !important;
                }
                .calendar-container .rbc-day-bg {
                    border-left: 1px solid var(--border-main) !important;
                    transition: background-color 0.2s ease;
                }
                .calendar-container .rbc-day-bg:hover {
                    background-color: var(--bg-app) !important;
                }
                .calendar-container .rbc-month-row {
                    border-top: 1px solid var(--border-main) !important;
                }
                .calendar-container .rbc-today {
                    background-color: var(--primary-500)08 !important;
                    position: relative;
                }
                .calendar-container .rbc-today::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: var(--primary-500, #6366f1);
                    border-radius: 0 0 4px 4px;
                }
                .calendar-container .rbc-off-range-bg {
                    background-color: var(--bg-app) !important;
                    opacity: 0.5;
                }
                .calendar-container .rbc-date-cell {
                    padding: 12px !important;
                    font-weight: 800 !important;
                    color: var(--text-muted) !important;
                    font-size: 0.9rem;
                    text-align: right;
                }
                .calendar-container .rbc-now .rbc-date-cell {
                    color: var(--primary-500, #6366f1) !important;
                    transform: scale(1.1);
                }
                .calendar-container .rbc-event {
                    padding: 0 !important;
                }
                .calendar-container .rbc-show-more {
                    color: var(--primary-500, #6366f1) !important;
                    font-weight: 800 !important;
                    font-size: 0.7rem;
                    background: var(--primary-500)15 !important;
                    padding: 2px 6px !important;
                    border-radius: 6px !important;
                    margin: 4px !important;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .calendar-container .rbc-event {
                    animation: fadeIn 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default WeekendList;
