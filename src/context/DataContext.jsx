import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    mockDepartments,
    mockDesignations,
    mockEmployees,
    mockProjects,
    mockModules,
    mockTasks,
    mockSprints,
    getNextId
} from '../data/mockData';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [departments, setDepartments] = useState(mockDepartments);
    const [designations, setDesignations] = useState(mockDesignations);
    const [employees, setEmployees] = useState(mockEmployees);
    const [projects, setProjects] = useState(mockProjects);
    const [modules, setModules] = useState(mockModules);
    const [tasks, setTasks] = useState(mockTasks);
    const [sprints, setSprints] = useState(mockSprints);

    // Department CRUD
    const addDepartment = useCallback((dept) => {
        setDepartments(prev => [...prev, {
            ...dept,
            id: getNextId(prev),
            createdAt: new Date().toISOString().split('T')[0]
        }]);
    }, []);

    const updateDepartment = useCallback((dept) => {
        setDepartments(prev => prev.map(d => d.id === dept.id ? { ...d, ...dept } : d));
    }, []);

    const deleteDepartment = useCallback((id) => {
        setDepartments(prev => prev.filter(d => d.id !== id));
    }, []);

    // Task CRUD
    const addTask = useCallback((task) => {
        setTasks(prev => [...prev, {
            ...task,
            id: getNextId(prev),
            progress: 0,
            status: 'backlog',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            activityLog: [{ id: 1, action: 'created', user: 'Current User', timestamp: new Date().toISOString() }]
        }]);
    }, []);

    const updateTask = useCallback((taskId, updates) => {
        setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
                const updatedTask = { ...t, ...updates, updatedAt: new Date().toISOString() };
                if (updates.status && updates.status !== t.status) {
                    updatedTask.activityLog = [
                        ...(t.activityLog || []),
                        {
                            id: (t.activityLog?.length || 0) + 1,
                            action: 'status_changed',
                            user: 'Current User',
                            from: t.status,
                            to: updates.status,
                            timestamp: new Date().toISOString()
                        }
                    ];
                }
                return updatedTask;
            }
            return t;
        }));
    }, []);

    // Other entities follow same pattern (added as needed)

    const value = {
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        designations,
        employees,
        projects,
        modules,
        tasks,
        addTask,
        updateTask,
        sprints
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
