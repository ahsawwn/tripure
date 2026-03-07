import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';

const ProtectedRoute = ({ 
    allowedRoles = [], 
    requiredPermission = null,
    redirectTo = '/admin/login' 
}) => {
    const { isAuthenticated, user, loading } = useAuth();
    const { can, loading: permLoading } = usePermissions();

    if (loading || permLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    // Check role-based access
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Check permission-based access
    if (requiredPermission && !can(requiredPermission)) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;