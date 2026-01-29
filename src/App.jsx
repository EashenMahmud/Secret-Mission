import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { restoreSession } from './store/slices/authSlice';
import { DataProvider } from './context/DataContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Auth
import Login from './pages/auth/Login';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Organization (lazy load for code splitting)
import { lazy, Suspense } from 'react';

const DepartmentList = lazy(() => import('./pages/organization/DepartmentList'));
const DesignationList = lazy(() => import('./pages/organization/DesignationList'));
const EmployeeList = lazy(() => import('./pages/organization/EmployeeList'));
const ProjectList = lazy(() => import('./pages/projects/ProjectList'));
const ProjectDetail = lazy(() => import('./pages/projects/ProjectDetail'));
const TaskList = lazy(() => import('./pages/tasks/TaskList'));
const TaskDetail = lazy(() => import('./pages/tasks/TaskDetail'));
const SprintList = lazy(() => import('./pages/sprints/SprintList'));
const SprintDashboard = lazy(() => import('./pages/sprints/SprintDashboard'));
const CalendarView = lazy(() => import('./pages/views/CalendarView'));
const GanttView = lazy(() => import('./pages/views/GanttView'));
const ComponentLibrary = lazy(() => import('./pages/dev/ComponentLibrary'));
const UserList = lazy(() => import('./pages/users/UserList'));
const ProjectTypes = lazy(() => import('./pages/organization/ProjectTypeList'));
const WeekendList = lazy(() => import('./pages/organization/WeekendList'));
const MyProfile = lazy(() => import('./pages/users/MyProfile'));
const ProjectPlanningTypes = lazy(() => import('./pages/organization/ProjectPlanningTypeList'));
const ClientList = lazy(() => import('./pages/clients/VendorList'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-dark-400">Loading...</p>
    </div>
  </div>
);

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Restore session from localStorage on app load
    dispatch(restoreSession());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <DataProvider>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
                }
              />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route
                  path="users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <UserList />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="clients"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <ClientList />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                {/* Organization Routes (Admin Only) */}
                <Route
                  path="organization/departments"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <DepartmentList />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="organization/designations"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <DesignationList />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="organization/employees"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <EmployeeList />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="organization/project-types"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <ProjectTypes />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="organization/holidays"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <WeekendList />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="organization/project-planning-types"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <ProjectPlanningTypes />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                {/* Project Routes */}
                <Route
                  path="projects"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ProjectList />
                    </Suspense>
                  }
                />
                <Route
                  path="projects/:id"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ProjectDetail />
                    </Suspense>
                  }
                />

                {/* Task Routes */}
                <Route
                  path="tasks"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <TaskList />
                    </Suspense>
                  }
                />
                <Route
                  path="tasks/:id"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <TaskDetail />
                    </Suspense>
                  }
                />

                {/* Sprint Routes */}
                <Route
                  path="sprints"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <SprintList />
                    </Suspense>
                  }
                />
                <Route
                  path="sprints/:id"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <SprintDashboard />
                    </Suspense>
                  }
                />

                {/* View Routes */}
                <Route
                  path="views/calendar"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <CalendarView />
                    </Suspense>
                  }
                />
                <Route
                  path="views/gantt"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <GanttView />
                    </Suspense>
                  }
                />
                <Route
                  path="dev/components"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ComponentLibrary />
                    </Suspense>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <MyProfile />
                    </Suspense>
                  }
                />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Toast Notifications */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
              toastClassName="bg-dark-800 border border-dark-700"
            />
          </div>
        </DataProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
