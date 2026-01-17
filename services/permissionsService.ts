/**
 * Permissions Service - خدمة الصلاحيات
 * نظام صلاحيات مبسط: مدير، محاسب، موظف
 */

import {
    Permission,
    PermissionModule,
    PermissionAction,
    ROLES,
    getRolePermissions,
    hasPermission as checkPermission
} from '../types/permissions';
import { UserRole } from '../types/organization';

/**
 * خدمة الصلاحيات
 */
export const PermissionsService = {
    /**
     * الحصول على جميع الأدوار
     */
    getRoles: () => {
        return ROLES;
    },

    /**
     * الحصول على دور محدد
     */
    getRole: (roleId: UserRole) => {
        return ROLES.find(r => r.id === roleId) || null;
    },

    /**
     * الحصول على صلاحيات دور
     */
    getRolePermissions: (role: UserRole): Permission[] => {
        return getRolePermissions(role);
    },

    /**
     * التحقق من صلاحية محددة للدور
     */
    hasPermission: (
        role: UserRole,
        module: PermissionModule,
        action: PermissionAction
    ): boolean => {
        return checkPermission(role, module, action);
    },

    /**
     * التحقق من عدة صلاحيات (أي واحدة)
     */
    hasAnyPermission: (
        role: UserRole,
        module: PermissionModule,
        actions: PermissionAction[]
    ): boolean => {
        return actions.some(action => checkPermission(role, module, action));
    },

    /**
     * التحقق من صلاحية الوصول لوحدة
     */
    canAccessModule: (
        role: UserRole,
        module: PermissionModule
    ): boolean => {
        return checkPermission(role, module, 'view');
    },

    // =================== Legacy API ===================

    /**
     * @deprecated استخدم hasPermission مع role بدلاً من userId
     */
    hasPermissionByUserId: (
        userId: string,
        module: PermissionModule,
        action: PermissionAction
    ): boolean => {
        // افتراضياً نعطي صلاحيات المدير
        return checkPermission('manager', module, action);
    },

    /**
     * @deprecated
     */
    initializeDefaultRoles: (organizationId: string) => {
        return ROLES;
    },

    /**
     * @deprecated
     */
    getMemberByUserId: (userId: string) => {
        return {
            id: userId,
            userId,
            organizationId: 'default',
            roleId: 'manager',
            branchId: 'main_branch',
            crossBranchPermissions: [],
            isOwner: true,
            isActive: true,
            joinedAt: new Date().toISOString()
        };
    },

    /**
     * @deprecated
     */
    getUserPermissions: (userId: string): Permission[] => {
        return getRolePermissions('manager');
    },

    /**
     * @deprecated
     */
    getMembers: () => [],

    /**
     * @deprecated
     */
    addMember: (params: any) => ({
        id: 'default',
        userId: params.userId,
        organizationId: params.organizationId,
        roleId: params.roleId,
        branchId: params.branchId,
        crossBranchPermissions: [],
        isOwner: false,
        isActive: true,
        joinedAt: new Date().toISOString()
    }),

    /**
     * @deprecated
     */
    createRole: (params: any) => ROLES[0]
};
