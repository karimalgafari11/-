/**
 * usePermissions Hook
 * التحقق من صلاحيات المستخدم
 * نظام مبسط: مدير، محاسب، موظف
 */

import { useMemo, useCallback } from 'react';
import { PermissionModule, PermissionAction, hasPermission } from '../types/permissions';
import { UserRole } from '../types/organization';
import { useApp } from '../context/AppContext';

/**
 * Hook للتحقق من الصلاحيات
 */
export const usePermissions = () => {
    const { user } = useApp();

    // الحصول على دور المستخدم الحالي
    const currentRole: UserRole = useMemo(() => {
        // تحويل الدور القديم للجديد
        if (!user?.role) return 'employee';
        if ((user.role as string) === 'admin' || (user.role as string) === 'owner') return 'manager';
        if (user.role === 'accountant') return 'accountant';
        return 'employee';
    }, [user?.role]);

    // التحقق من صلاحية محددة
    const can = useCallback((
        module: PermissionModule,
        action: PermissionAction
    ): boolean => {
        return hasPermission(currentRole, module, action);
    }, [currentRole]);

    // التحقق من عدة صلاحيات (أي واحدة منها)
    const canAny = useCallback((
        module: PermissionModule,
        actions: PermissionAction[]
    ): boolean => {
        return actions.some(action => can(module, action));
    }, [can]);

    // التحقق من عدة صلاحيات (جميعها)
    const canAll = useCallback((
        module: PermissionModule,
        actions: PermissionAction[]
    ): boolean => {
        return actions.every(action => can(module, action));
    }, [can]);

    // هل المستخدم مدير
    const isManager = currentRole === 'manager';

    // هل المستخدم محاسب
    const isAccountant = currentRole === 'accountant';

    // صلاحيات سريعة شائعة
    const quickChecks = useMemo(() => ({
        canViewDashboard: can('dashboard', 'view'),
        canManageSales: canAny('sales', ['create', 'edit', 'delete']),
        canManagePurchases: canAny('purchases', ['create', 'edit', 'delete']),
        canManageInventory: canAny('inventory', ['create', 'edit', 'delete']),
        canViewReports: can('reports', 'view'),
        canExportReports: can('reports', 'export'),
        canManageUsers: canAny('users', ['create', 'edit', 'delete']),
        canViewActivityLog: can('activity_log', 'view'),
        canChangeSettings: can('settings', 'edit'),
        canManageAccounting: canAny('accounting', ['create', 'edit'])
    }), [can, canAny]);

    return {
        role: currentRole,
        can,
        canAny,
        canAll,
        isManager,
        isAccountant,
        isOwner: isManager, // للتوافق مع الكود القديم
        ...quickChecks
    };
};
