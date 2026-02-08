import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { getStatusConfig, getPriorityConfig } from './TaskStatusBadge';

const TaskFilters = ({ filters, onFilterChange, onSearch, className }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const statusConfig = getStatusConfig();
    const priorityConfig = getPriorityConfig();

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        onSearch?.(e.target.value);
    };

    const handleStatusToggle = (status) => {
        const currentStatuses = filters.statuses || [];
        const newStatuses = currentStatuses.includes(status)
            ? currentStatuses.filter(s => s !== status)
            : [...currentStatuses, status];
        onFilterChange?.({ ...filters, statuses: newStatuses });
    };

    const handlePriorityToggle = (priority) => {
        const currentPriorities = filters.priorities || [];
        const newPriorities = currentPriorities.includes(priority)
            ? currentPriorities.filter(p => p !== priority)
            : [...currentPriorities, priority];
        onFilterChange?.({ ...filters, priorities: newPriorities });
    };

    const clearFilters = () => {
        setSearchTerm('');
        onFilterChange?.({ statuses: [], priorities: [], search: '' });
        onSearch?.('');
    };

    const hasActiveFilters = (filters.statuses?.length > 0) ||
        (filters.priorities?.length > 0) ||
        searchTerm;

    return (
        <div className={cn('space-y-3', className)}>
            {/* Search and filter toggle */}
            <div className="flex items-center gap-3">
                {/* Search input */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all"
                    />
                </div>

                {/* Filter toggle button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium',
                        showFilters || hasActiveFilters
                            ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]'
                            : 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-main)] hover:border-[var(--primary-color)]'
                    )}
                >
                    <Filter className="w-4 h-4" />
                    Filters
                    {hasActiveFilters && (
                        <span className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-full text-xs">
                            {(filters.statuses?.length || 0) + (filters.priorities?.length || 0)}
                        </span>
                    )}
                    <ChevronDown className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')} />
                </button>

                {/* Clear filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                        Clear
                    </button>
                )}
            </div>

            {/* Filter options */}
            {showFilters && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg p-4 space-y-4 animate-fade-in">
                    {/* Status filters */}
                    <div>
                        <h4 className="text-sm font-medium text-[var(--text-main)] mb-2">Status</h4>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(statusConfig).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => handleStatusToggle(key)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                                        filters.statuses?.includes(key)
                                            ? config.color + ' ring-2 ring-offset-1 ring-[var(--primary-color)]'
                                            : 'bg-[var(--bg-app)] text-[var(--text-muted)] border-[var(--border-main)] hover:border-[var(--primary-color)]'
                                    )}
                                >
                                    {config.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Priority filters */}
                    <div>
                        <h4 className="text-sm font-medium text-[var(--text-main)] mb-2">Priority</h4>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(priorityConfig).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => handlePriorityToggle(key)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                                        filters.priorities?.includes(key)
                                            ? config.color + ' ring-2 ring-offset-1 ring-[var(--primary-color)]'
                                            : 'bg-[var(--bg-app)] text-[var(--text-muted)] border-[var(--border-main)] hover:border-[var(--primary-color)]'
                                    )}
                                >
                                    {config.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskFilters;
