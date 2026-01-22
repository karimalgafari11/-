/**
 * useRolesSettings Hook
 * Hook لإدارة الصلاحيات والأدوار
 */

import { useCallback } from 'react';
import {
    AppSettingsExtended,
    Role,
    Permission,
    PermissionAction,
    SYSTEM_MODULES
} from '../../../types/settings-extended';
import { logger } from '../../../lib/logger';

interface UseRolesSettingsProps {
    settings: AppSettingsExtended;
    setSettings: React.Dispatch<React.SetStateAction<AppSettingsExtended>>;
}

export const useRolesSettings = ({
    settings,
    setSettings
}: UseRolesSettingsProps) => {

    const roles = settings.users.roles;

    const getDefaultPermissions = useCallback((): Permission[] => {
        return SYSTEM_MODULES.map(module => ({
            module: module.id,
            moduleNameAr: module.nameAr,
            moduleNameEn: module.nameEn,
            actions: {
                view: false,
                create: false,
                edit: false,
                delete: false,
                export: false,
                approve: false,
                print: false
            }
        }));
    }, []);

    const addRole = useCallback((role: Omit<Role, 'id' | 'createdAt'>) => {
        const newRole: Role = {
            ...role,
            id: `role_${Date.now()}`,
            createdAt: new Date().toISOString()
        };
        setSettings(prev => ({
            ...prev,
            users: {
                ...prev.users,
                roles: [...prev.users.roles, newRole]
            }
        }));
        logger.info('Role added', { roleId: newRole.id, name: role.name });
    }, [setSettings]);

    const updateRole = useCallback((role: Role) => {
        setSettings(prev => ({
            ...prev,
            users: {
                ...prev.users,
                roles: prev.users.roles.map(r =>
                    r.id === role.id ? { ...role, updatedAt: new Date().toISOString() } : r
                )
            }
        }));
    }, [setSettings]);

    const deleteRole = useCallback((id: string) => {
        const role = roles.find(r => r.id === id);
        if (role?.isSystem) {
            logger.warn('Cannot delete system role');
            return;
        }
        setSettings(prev => ({
            ...prev,
            users: {
                ...prev.users,
                roles: prev.users.roles.filter(r => r.id !== id)
            }
        }));
        logger.info('Role deleted', { roleId: id });
    }, [roles, setSettings]);

    const hasPermission = useCallback((module: string, action: PermissionAction): boolean => {
        // In a real app, this would check the current user's role from AuthContext
        const userRole = 'admin';

        if (userRole === 'admin') return true;

        const role = roles.find(r => r.id === userRole || r.nameEn.toLowerCase() === userRole);
        if (!role) return false;

        const permission = role.permissions.find(p => p.module === module);
        return permission?.actions[action] || false;
    }, [roles]);

    return {
        roles,
        addRole,
        updateRole,
        deleteRole,
        hasPermission,
        getDefaultPermissions
    };
};
