// src/router/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthStore } from '../utils/authHelpers';

// Layout Components
import RootLayout from '../components/layout/RootLayout';
import AuthLayout from '../components/layout/AuthLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Auth Pages
import SignIn from '../pages/auth/SignIn';
import SignUp from '../pages/auth/SignUp';
import SignUpVerify from '../pages/auth/SignUpVerify';
import ResetPassword from '../pages/auth/ResetPassword';
import ResetPasswordConfirm from '../pages/auth/ResetPasswordConfirm';
import MfaVerify from '../pages/auth/MfaVerify';

// Dashboard Pages
import Dashboard from '../pages/dashboard/Dashboard';
import Profile from '../pages/dashboard/Profile';
import Settings from '../pages/dashboard/Settings';

// Data Pages
import LeakedDataList from '../pages/data/LeakedDataList';
import LeakedDataDetail from '../pages/data/LeakedDataDetail';
import VulnerabilityDataList from '../pages/data/VulnerabilityDataList';
import VulnerabilityDataDetail from '../pages/data/VulnerabilityDataDetail';
import PersonalDataSearch from '../pages/data/PersonalDataSearch';
import DataSubmit from '../pages/data/DataSubmit';

// Contribution Pages
import ContributorApplication from '../pages/contribution/ContributorApplication';
import ContributorDashboard from '../pages/contribution/ContributorDashboard';
import ContributorSessions from '../pages/contribution/ContributorSessions';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
    const isAuthenticated = AuthStore.isAuthenticated();
    const userRole = AuthStore.getRole();

    if (!isAuthenticated) {
        return <Navigate to="/auth/signin" replace />;
    }

    if (requiredRole && userRole !== requiredRole && userRole !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = AuthStore.isAuthenticated();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="/dashboard" replace />,
            },
            {
                path: 'auth',
                element: (
                    <PublicRoute>
                        <AuthLayout />
                    </PublicRoute>
                ),
                children: [
                    {
                        path: 'signin',
                        element: <SignIn />,
                    },
                    {
                        path: 'signup',
                        element: <SignUp />,
                    },
                    {
                        path: 'signup/verify',
                        element: <SignUpVerify />,
                    },
                    {
                        path: 'reset-password',
                        element: <ResetPassword />,
                    },
                    {
                        path: 'reset-password/confirm',
                        element: <ResetPasswordConfirm />,
                    },
                    {
                        path: 'mfa',
                        element: <MfaVerify />,
                    },
                ],
            },
            {
                path: 'dashboard',
                element: (
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                ),
                children: [
                    {
                        index: true,
                        element: <Dashboard />,
                    },
                    {
                        path: 'profile',
                        element: <Profile />,
                    },
                    {
                        path: 'settings',
                        element: <Settings />,
                    },
                ],
            },
            {
                path: 'data',
                element: (
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                ),
                children: [
                    {
                        path: 'leaked',
                        element: <LeakedDataList />,
                    },
                    {
                        path: 'leaked/:id',
                        element: <LeakedDataDetail />,
                    },
                    {
                        path: 'vulnerability',
                        element: <VulnerabilityDataList />,
                    },
                    {
                        path: 'vulnerability/:id',
                        element: <VulnerabilityDataDetail />,
                    },
                    {
                        path: 'personal-search',
                        element: <PersonalDataSearch />,
                    },
                    {
                        path: 'submit',
                        element: (
                            <ProtectedRoute requiredRole="CONTRIBUTOR">
                                <DataSubmit />
                            </ProtectedRoute>
                        ),
                    },
                ],
            },
            {
                path: 'contribution',
                element: (
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                ),
                children: [
                    {
                        path: 'apply',
                        element: <ContributorApplication />,
                    },
                    {
                        path: 'dashboard',
                        element: (
                            <ProtectedRoute requiredRole="CONTRIBUTOR">
                                <ContributorDashboard />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'sessions',
                        element: (
                            <ProtectedRoute requiredRole="CONTRIBUTOR">
                                <ContributorSessions />
                            </ProtectedRoute>
                        ),
                    },
                ],
            },
        ],
    },
]);