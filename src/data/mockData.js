// Mock data for the application
export const mockUsers = [
    {
        id: 1,
        email: 'admin@secretmission.com',
        password: 'admin123',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        employeeId: null
    },
    {
        id: 2,
        email: 'employee@secretmission.com',
        password: 'employee123',
        role: 'employee',
        firstName: 'John',
        lastName: 'Doe',
        employeeId: 1
    }
];

export const mockDepartments = [
    { id: 1, name: 'Engineering', description: 'Software development and technical operations', createdAt: '2024-01-15' },
    { id: 2, name: 'Design', description: 'UI/UX and graphic design', createdAt: '2024-01-16' },
    { id: 3, name: 'Marketing', description: 'Marketing and communications', createdAt: '2024-01-17' },
    { id: 4, name: 'Sales', description: 'Sales and business development', createdAt: '2024-01-18' },
];

export const mockDesignations = [
    { id: 1, title: 'Senior Developer', level: 'Senior', departmentId: 1 },
    { id: 2, title: 'Junior Developer', level: 'Junior', departmentId: 1 },
    { id: 3, title: 'UI/UX Designer', level: 'Mid', departmentId: 2 },
    { id: 4, title: 'Marketing Manager', level: 'Senior', departmentId: 3 },
    { id: 5, title: 'Sales Executive', level: 'Junior', departmentId: 4 },
];

export const mockEmployees = [
    {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@secretmission.com',
        phone: '+1234567890',
        departmentId: 1,
        designationId: 1,
        role: 'employee',
        status: 'active',
        joinDate: '2023-06-15',
        avatar: null
    },
    {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@secretmission.com',
        phone: '+1234567891',
        departmentId: 1,
        designationId: 2,
        role: 'employee',
        status: 'active',
        joinDate: '2023-08-20',
        avatar: null
    },
    {
        id: 3,
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@secretmission.com',
        phone: '+1234567892',
        departmentId: 2,
        designationId: 3,
        role: 'employee',
        status: 'active',
        joinDate: '2023-07-10',
        avatar: null
    },
    {
        id: 4,
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.williams@secretmission.com',
        phone: '+1234567893',
        departmentId: 3,
        designationId: 4,
        role: 'employee',
        status: 'active',
        joinDate: '2023-09-05',
        avatar: null
    },
];

export const mockProjects = [
    {
        id: 1,
        name: 'E-Commerce Platform',
        description: 'Building a modern e-commerce platform with React and Node.js',
        status: 'in_progress',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        progress: 45,
        managerId: 1
    },
    {
        id: 2,
        name: 'Mobile App Redesign',
        description: 'Complete redesign of the mobile application',
        status: 'in_progress',
        startDate: '2024-02-01',
        endDate: '2024-05-31',
        progress: 30,
        managerId: 3
    },
    {
        id: 3,
        name: 'Marketing Campaign',
        description: 'Q2 2024 marketing campaign planning and execution',
        status: 'planning',
        startDate: '2024-03-01',
        endDate: '2024-06-30',
        progress: 10,
        managerId: 4
    },
];

export const mockModules = [
    {
        id: 1,
        name: 'User Authentication',
        description: 'Login, registration, and password reset functionality',
        projectId: 1,
        status: 'completed',
        progress: 100,
        startDate: '2024-01-01',
        endDate: '2024-02-15'
    },
    {
        id: 2,
        name: 'Product Catalog',
        description: 'Product listing, search, and filtering',
        projectId: 1,
        status: 'in_progress',
        progress: 60,
        startDate: '2024-02-01',
        endDate: '2024-04-30'
    },
    {
        id: 3,
        name: 'Shopping Cart',
        description: 'Cart management and checkout process',
        projectId: 1,
        status: 'in_progress',
        progress: 30,
        startDate: '2024-03-01',
        endDate: '2024-05-31'
    },
    {
        id: 4,
        name: 'UI Components',
        description: 'Reusable UI component library',
        projectId: 2,
        status: 'in_progress',
        progress: 40,
        startDate: '2024-02-01',
        endDate: '2024-04-15'
    },
    {
        id: 5,
        name: 'Navigation System',
        description: 'App navigation and routing',
        projectId: 2,
        status: 'planning',
        progress: 5,
        startDate: '2024-03-15',
        endDate: '2024-05-31'
    },
];

export const mockTasks = [
    {
        id: 1,
        title: 'Implement login form',
        description: 'Create login form with email and password validation',
        moduleId: 1,
        projectId: 1,
        status: 'completed',
        priority: 'high',
        assignedTo: 1,
        volume: 5,
        volumeType: 'story_points',
        progress: 100,
        deadline: '2024-01-20',
        sprintId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-20',
        activityLog: [
            { id: 1, action: 'created', user: 'Admin User', timestamp: '2024-01-01T10:00:00Z' },
            { id: 2, action: 'assigned', user: 'Admin User', assignedTo: 'John Doe', timestamp: '2024-01-01T10:05:00Z' },
            { id: 3, action: 'status_changed', user: 'John Doe', from: 'backlog', to: 'in_progress', timestamp: '2024-01-05T09:00:00Z' },
            { id: 4, action: 'status_changed', user: 'John Doe', from: 'in_progress', to: 'completed', timestamp: '2024-01-20T16:00:00Z' }
        ]
    },
    {
        id: 2,
        title: 'Create registration API',
        description: 'Backend API for user registration with email verification',
        moduleId: 1,
        projectId: 1,
        status: 'completed',
        priority: 'high',
        assignedTo: 2,
        volume: 8,
        volumeType: 'story_points',
        progress: 100,
        deadline: '2024-02-10',
        sprintId: 1,
        createdAt: '2024-01-05',
        updatedAt: '2024-02-10',
        activityLog: []
    },
    {
        id: 3,
        title: 'Design product card component',
        description: 'Create reusable product card with image, title, price, and CTA',
        moduleId: 2,
        projectId: 1,
        status: 'in_progress',
        priority: 'medium',
        assignedTo: 1,
        volume: 3,
        volumeType: 'story_points',
        progress: 70,
        deadline: '2024-03-15',
        sprintId: 2,
        createdAt: '2024-02-15',
        updatedAt: '2024-03-10',
        activityLog: []
    },
    {
        id: 4,
        title: 'Implement product search',
        description: 'Add search functionality with filters and sorting',
        moduleId: 2,
        projectId: 1,
        status: 'in_progress',
        priority: 'high',
        assignedTo: 2,
        volume: 13,
        volumeType: 'story_points',
        progress: 40,
        deadline: '2024-04-20',
        sprintId: 2,
        createdAt: '2024-03-01',
        updatedAt: '2024-03-20',
        activityLog: []
    },
    {
        id: 5,
        title: 'Shopping cart state management',
        description: 'Implement Redux store for cart management',
        moduleId: 3,
        projectId: 1,
        status: 'backlog',
        priority: 'medium',
        assignedTo: null,
        volume: 8,
        volumeType: 'story_points',
        progress: 0,
        deadline: '2024-05-10',
        sprintId: null,
        createdAt: '2024-03-10',
        updatedAt: '2024-03-10',
        activityLog: []
    },
    {
        id: 6,
        title: 'Button component library',
        description: 'Create various button styles and variants',
        moduleId: 4,
        projectId: 2,
        status: 'in_progress',
        priority: 'low',
        assignedTo: 3,
        volume: 2,
        volumeType: 'story_points',
        progress: 80,
        deadline: '2024-03-25',
        sprintId: 3,
        createdAt: '2024-02-20',
        updatedAt: '2024-03-22',
        activityLog: []
    },
    {
        id: 7,
        title: 'Form input components',
        description: 'Text inputs, selects, checkboxes, and radio buttons',
        moduleId: 4,
        projectId: 2,
        status: 'assigned',
        priority: 'medium',
        assignedTo: 3,
        volume: 5,
        volumeType: 'story_points',
        progress: 0,
        deadline: '2024-04-05',
        sprintId: 3,
        createdAt: '2024-03-01',
        updatedAt: '2024-03-01',
        activityLog: []
    },
];

export const mockSprints = [
    {
        id: 1,
        name: 'Sprint 1 - Authentication',
        projectId: 1,
        startDate: '2024-01-01',
        endDate: '2024-02-15',
        status: 'completed',
        goal: 'Complete user authentication module',
        totalTasks: 2,
        completedTasks: 2,
        totalEffort: 13,
        completedEffort: 13
    },
    {
        id: 2,
        name: 'Sprint 2 - Product Catalog',
        projectId: 1,
        startDate: '2024-02-16',
        endDate: '2024-04-30',
        status: 'active',
        goal: 'Build product catalog with search and filters',
        totalTasks: 2,
        completedTasks: 0,
        totalEffort: 16,
        completedEffort: 0
    },
    {
        id: 3,
        name: 'Sprint 1 - Component Library',
        projectId: 2,
        startDate: '2024-02-01',
        endDate: '2024-04-15',
        status: 'active',
        goal: 'Create reusable UI component library',
        totalTasks: 2,
        completedTasks: 0,
        totalEffort: 7,
        completedEffort: 0
    },
];

// Helper function to get next ID
export const getNextId = (array) => {
    if (!array || array.length === 0) return 1;
    return Math.max(...array.map(item => item.id)) + 1;
};
