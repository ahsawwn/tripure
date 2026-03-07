import { usePermissions } from '../contexts/PermissionContext';

export const usePermission = (requiredPermission) => {
    const { can } = usePermissions();
    
    const PermissionGuard = ({ children, fallback = null }) => {
        if (can(requiredPermission)) {
            return children;
        }
        return fallback;
    };

    return {
        can: can(requiredPermission),
        PermissionGuard
    };
};

// Usage in components:
// const { can: canEdit, PermissionGuard } = usePermission('edit_users');
// 
// {canEdit && <button>Edit</button>}
// 
// <PermissionGuard>
//     <AdminOnlyComponent />
// </PermissionGuard>