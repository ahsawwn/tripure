import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const PermissionContext = createContext();

export const usePermissions = () => {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error('usePermissions must be used within PermissionProvider');
    }
    return context;
};

export const PermissionProvider = ({ children }) => {
    const { user } = useAuth();
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Default permissions based on role
    const getDefaultPermissions = (role) => {
        const defaultPerms = {
            super_admin: [
                'view_dashboard', 'view_messages', 'reply_messages', 'view_customers', 
                'view_users', 'create_users', 'edit_users', 'delete_users', 
                'view_activity_logs', 'manage_roles', 'view_orders', 'view_products',
                'export_reports', 'view_settings', 'edit_settings'
            ],
            admin: [
                'view_dashboard', 'view_messages', 'reply_messages', 'view_customers',
                'view_users', 'create_users', 'edit_users', 'view_orders', 'view_products',
                'export_reports', 'view_settings'
            ],
            manager: [
                'view_dashboard', 'view_messages', 'reply_messages', 'view_customers',
                'view_orders', 'view_products'
            ],
            support: [
                'view_dashboard', 'view_messages', 'reply_messages', 'view_customers'
            ],
            viewer: [
                'view_dashboard', 'view_messages', 'view_customers'
            ]
        };
        return defaultPerms[role] || [];
    };

    useEffect(() => {
        if (user) {
            fetchPermissions();
        } else {
            setPermissions([]);
            setLoading(false);
        }
    }, [user]);

    const fetchPermissions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                setPermissions([]);
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/users/permissions`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setPermissions(response.data.data || []);
                console.log('Permissions loaded:', response.data.data);
            } catch (error) {
                console.log('Using default permissions for role:', user?.role);
                // Use default permissions based on user role
                const defaultPerms = getDefaultPermissions(user?.role);
                setPermissions(defaultPerms);
                console.log('Default permissions:', defaultPerms);
            }
        } catch (error) {
            console.error('Error in permission setup:', error);
            setPermissions(getDefaultPermissions(user?.role));
        } finally {
            setLoading(false);
        }
    };

    const can = (permissionName) => {
        if (!user) return false;
        // Super admin always has access to everything
        if (user.role === 'super_admin') return true;
        // Admin has access to most things
        if (user.role === 'admin') {
            // For admin, allow all permissions except delete_users and manage_roles
            if (permissionName === 'delete_users' || permissionName === 'manage_roles') {
                return false;
            }
            return true;
        }
        // For other roles, check permissions array
        return permissions.includes(permissionName);
    };

    const canAny = (permissionNames) => {
        return permissionNames.some(name => can(name));
    };

    const canAll = (permissionNames) => {
        return permissionNames.every(name => can(name));
    };

    const value = {
        permissions,
        loading,
        can,
        canAny,
        canAll,
        refreshPermissions: fetchPermissions
    };

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
};