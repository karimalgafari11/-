/**
 * Auth Permissions Service - خدمة الصلاحيات
 * التحقق من صلاحيات المستخدم
 */

import { rolesService } from '../rolesService';
import { getCurrentUser } from './sessionService';

/**
 * التحقق من صلاحية المستخدم الحالي
 */
export const hasPermission = async (permission: string): Promise<boolean> => {
    return rolesService.checkPermission(permission);
};

/**
 * التحقق من أي صلاحية من قائمة
 */
export const hasAnyPermission = async (permissions: string[]): Promise<boolean> => {
    return rolesService.checkAnyPermission(permissions);
};

/**
 * الحصول على دور المستخدم في الشركة الحالية
 */
export const getUserRole = async (): Promise<string | null> => {
    const user = await getCurrentUser();
    if (!user) return null;

    const userRole = await rolesService.getUserCompanyRole(user.id, user.companyId);
    return userRole?.role?.name || null;
};

/**
 * التحقق من أن المستخدم admin
 */
export const isAdmin = async (): Promise<boolean> => {
    const role = await getUserRole();
    return role === 'admin' || role === 'super_admin';
};

/**
 * التحقق من أن المستخدم manager أو أعلى
 */
export const isManagerOrAbove = async (): Promise<boolean> => {
    const role = await getUserRole();
    return ['admin', 'super_admin', 'manager'].includes(role || '');
};

export const authPermissionsService = {
    hasPermission,
    hasAnyPermission,
    getUserRole,
    isAdmin,
    isManagerOrAbove
};

export default authPermissionsService;
