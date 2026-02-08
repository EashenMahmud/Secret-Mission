import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, LayoutGrid, List, RefreshCw } from 'lucide-react';
import { useGetApiWithIdQuery } from '../../../store/api/commonApi';
import Button from '../../../components/ui/Button';
import TaskBoard from './components/TaskBoard';
import TaskList from './components/TaskList';
import TaskFilters from './components/TaskFilters';
import TaskFormModal from './components/TaskFormModal';
import TaskDetailModal from './components/TaskDetailModal';
import { cn } from '../../../lib/utils';

const TaskDetails = () => {
    const { projectId, planningId } = useParams();
    const navigate = useNavigate();

    // View state
    const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [editingTask, setEditingTask] = useState(null);

    // Filter state
    const [filters, setFilters] = useState({
        statuses: [],
        priorities: [],
        search: ''
    });

    // Sort state for list view
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    // Fetch tasks
    const {
        data: tasksData,
        isLoading,
        refetch,
        isFetching
    } = useGetApiWithIdQuery(
        { url: '/all-task-list', id: planningId },
        { skip: !planningId }
    );

    const tasks = tasksData?.data || tasksData || [];

    // Filter tasks
    const filteredTasks = useMemo(() => {
        let result = [...tasks];

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(task =>
                task.title?.toLowerCase().includes(searchLower) ||
                task.description?.toLowerCase().includes(searchLower)
            );
        }

        // Apply status filter
        if (filters.statuses?.length > 0) {
            result = result.filter(task => filters.statuses.includes(task.status));
        }

        // Apply priority filter
        if (filters.priorities?.length > 0) {
            result = result.filter(task => filters.priorities.includes(task.priority));
        }

        // Apply sorting for list view
        if (viewMode === 'list' && sortBy) {
            result.sort((a, b) => {
                let aValue = a[sortBy];
                let bValue = b[sortBy];

                // Handle date comparisons
                if (sortBy === 'deadline' || sortBy === 'start_date' || sortBy === 'created_at') {
                    aValue = aValue ? new Date(aValue).getTime() : 0;
                    bValue = bValue ? new Date(bValue).getTime() : 0;
                }

                // Handle number comparisons
                if (sortBy === 'progress') {
                    aValue = Number(aValue) || 0;
                    bValue = Number(bValue) || 0;
                }

                // Handle string comparisons
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue?.toLowerCase() || '';
                }

                if (sortOrder === 'asc') {
                    return aValue > bValue ? 1 : -1;
                }
                return aValue < bValue ? 1 : -1;
            });
        }

        return result;
    }, [tasks, filters, viewMode, sortBy, sortOrder]);

    // Handlers
    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setShowDetailModal(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setShowDetailModal(false);
        setShowCreateModal(true);
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        setEditingTask(null);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedTask(null);
    };

    const handleTaskSuccess = () => {
        refetch();
    };

    const handleSearch = (searchTerm) => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
    };

    const handleSort = (field, order) => {
        setSortBy(field);
        setSortOrder(order);
    };

    // Calculate stats
    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const inProgress = tasks.filter(t => t.status === 'in_progress').length;
        const blocked = tasks.filter(t => t.status === 'blocked').length;

        return { total, completed, inProgress, blocked };
    }, [tasks]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-[var(--bg-card)] rounded-full -ml-2"
                    >
                        <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-main)]">Task Management</h1>
                        <p className="text-sm text-[var(--text-muted)]">
                            Manage tasks for this module
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Refresh button */}
                    <Button
                        variant="ghost"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-2"
                    >
                        <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
                    </Button>

                    {/* View toggle */}
                    <div className="flex items-center bg-[var(--bg-app)] rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('board')}
                            className={cn(
                                'p-2 rounded-md transition-all',
                                viewMode === 'board'
                                    ? 'bg-[var(--bg-card)] shadow-sm text-[var(--primary-color)]'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                'p-2 rounded-md transition-all',
                                viewMode === 'list'
                                    ? 'bg-[var(--bg-card)] shadow-sm text-[var(--primary-color)]'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            )}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Add task button */}
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--border-main)]">
                    <p className="text-sm text-[var(--text-muted)]">Total Tasks</p>
                    <p className="text-2xl font-bold text-[var(--text-main)]">{stats.total}</p>
                </div>
                <div className="bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--border-main)]">
                    <p className="text-sm text-[var(--text-muted)]">In Progress</p>
                    <p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p>
                </div>
                <div className="bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--border-main)]">
                    <p className="text-sm text-[var(--text-muted)]">Completed</p>
                    <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
                </div>
                <div className="bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--border-main)]">
                    <p className="text-sm text-[var(--text-muted)]">Blocked</p>
                    <p className="text-2xl font-bold text-red-500">{stats.blocked}</p>
                </div>
            </div>

            {/* Filters */}
            <TaskFilters
                filters={filters}
                onFilterChange={setFilters}
                onSearch={handleSearch}
            />

            {/* Task View */}
            {viewMode === 'board' ? (
                <TaskBoard
                    tasks={filteredTasks}
                    onTaskClick={handleTaskClick}
                    onAddTask={() => setShowCreateModal(true)}
                    onStatusChange={handleTaskSuccess}
                    isLoading={isLoading}
                />
            ) : (
                <TaskList
                    tasks={filteredTasks}
                    onTaskClick={handleTaskClick}
                    isLoading={isLoading}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                />
            )}

            {/* Create/Edit Modal */}
            <TaskFormModal
                isOpen={showCreateModal}
                onClose={handleCloseCreateModal}
                projectId={projectId}
                projectModuleId={planningId}
                task={editingTask}
                onSuccess={handleTaskSuccess}
            />

            {/* Detail Modal */}
            <TaskDetailModal
                isOpen={showDetailModal}
                onClose={handleCloseDetailModal}
                taskId={selectedTask?.id}
                projectId={projectId}
                onEdit={handleEditTask}
                onUpdate={handleTaskSuccess}
            />
        </div>
    );
};

export default TaskDetails;
