import {
    LayoutDashboard,
    Building2,
    Briefcase,
    Users,
    FolderKanban,
    ListTodo,
    Calendar,
    GanttChart,
    Timer
} from 'lucide-react';

// Menu configuration with role-based access
export const menuItems = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        roles: ['admin', 'employee'],
    },
    {
        id: 'organization',
        label: 'Organization',
        icon: Building2,
        roles: ['admin'],
        children: [
            {
                id: 'departments',
                label: 'Departments',
                path: '/organization/departments',
                icon: Building2,
                roles: ['admin'],
            },
            {
                id: 'designations',
                label: 'Designations',
                path: '/organization/designations',
                icon: Briefcase,
                roles: ['admin'],
            },
            {
                id: 'employees',
                label: 'Employees',
                path: '/organization/employees',
                icon: Users,
                roles: ['admin'],
            },
        ],
    },
    {
        id: 'projects',
        label: 'Projects',
        path: '/projects',
        icon: FolderKanban,
        roles: ['admin', 'employee'],
    },
    {
        id: 'tasks',
        label: 'Tasks',
        path: '/tasks',
        icon: ListTodo,
        roles: ['admin', 'employee'],
    },
    {
        id: 'sprints',
        label: 'Sprints',
        path: '/sprints',
        icon: Timer,
        roles: ['admin', 'employee'],
    },
    {
        id: 'views',
        label: 'Views',
        icon: Calendar,
        roles: ['admin', 'employee'],
        children: [
            {
                id: 'calendar',
                label: 'Calendar',
                path: '/views/calendar',
                icon: Calendar,
                roles: ['admin', 'employee'],
            },
            {
                id: 'gantt',
                label: 'Gantt Chart',
                path: '/views/gantt',
                icon: GanttChart,
                roles: ['admin', 'employee'],
            },
        ],
    },
];

// Helper function to filter menu items by role
export const getMenuByRole = (role) => {
    return menuItems.filter(item => {
        if (!item.roles.includes(role)) return false;

        if (item.children) {
            item.children = item.children.filter(child => child.roles.includes(role));
        }

        return true;
    });
};

// Helper function to get all routes
export const getAllRoutes = () => {
    const routes = [];

    menuItems.forEach(item => {
        if (item.path) {
            routes.push({
                path: item.path,
                roles: item.roles,
                label: item.label,
            });
        }

        if (item.children) {
            item.children.forEach(child => {
                if (child.path) {
                    routes.push({
                        path: child.path,
                        roles: child.roles,
                        label: child.label,
                    });
                }
            });
        }
    });

    return routes;
};
