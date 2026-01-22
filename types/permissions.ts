/**
 * Permissions Types - أنواع الصلاحيات والأدوار
 * نظام صلاحيات مبسط: مدير، محاسب، موظف
 */

import { UserRole } from './organization';

// الدور
export interface Role {
    id: UserRole;
    name: string;
    nameEn: string;
    description: string;
    level: number;             // مستوى الدور (1 = أعلى)
    permissions: Permission[];
}

// الصلاحية
export interface Permission {
    module: PermissionModule;
    actions: PermissionAction[];
}

// الوحدات/الأقسام
export type PermissionModule =
    | 'dashboard'
    | 'sales'
    | 'purchases'
    | 'inventory'
    | 'customers'
    | 'suppliers'
    | 'expenses'
    | 'vouchers'
    | 'accounting'
    | 'reports'
    | 'settings'
    | 'users'
    | 'activity_log';

// الإجراءات المتاحة
export type PermissionAction =
    | 'view'
    | 'create'
    | 'edit'
    | 'delete'
    | 'export'
    | 'approve'
    | 'void';

// الأدوار الثلاثة
export const SYSTEM_ROLES = {
    MANAGER: 'manager' as UserRole,
    ACCOUNTANT: 'accountant' as UserRole,
    EMPLOYEE: 'employee' as UserRole
} as const;

// صلاحيات كل دور
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    // المدير - صلاحيات كاملة
    admin: [
        { module: 'dashboard', actions: ['view'] },
        { module: 'sales', actions: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'void'] },
        { module: 'purchases', actions: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'void'] },
        { module: 'inventory', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        { module: 'customers', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        { module: 'suppliers', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        { module: 'expenses', actions: ['view', 'create', 'edit', 'delete', 'export', 'approve'] },
        { module: 'vouchers', actions: ['view', 'create', 'edit', 'delete', 'export', 'approve'] },
        { module: 'accounting', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        { module: 'reports', actions: ['view', 'export'] },
        { module: 'settings', actions: ['view', 'edit'] },
        { module: 'users', actions: ['view', 'create', 'edit', 'delete'] },
        { module: 'activity_log', actions: ['view', 'export'] }
    ],
    manager: [
        { module: 'dashboard', actions: ['view'] },
        { module: 'sales', actions: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'void'] },
        { module: 'purchases', actions: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'void'] },
        { module: 'inventory', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        { module: 'customers', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        { module: 'suppliers', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        { module: 'expenses', actions: ['view', 'create', 'edit', 'delete', 'export', 'approve'] },
        { module: 'vouchers', actions: ['view', 'create', 'edit', 'delete', 'export', 'approve'] },
        { module: 'accounting', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        { module: 'reports', actions: ['view', 'export'] },
        { module: 'settings', actions: ['view', 'edit'] },
        { module: 'users', actions: ['view', 'create', 'edit', 'delete'] },
        { module: 'activity_log', actions: ['view', 'export'] }
    ],

    // المحاسب - صلاحيات مالية
    accountant: [
        { module: 'dashboard', actions: ['view'] },
        { module: 'sales', actions: ['view', 'export'] },
        { module: 'purchases', actions: ['view', 'export'] },
        { module: 'inventory', actions: ['view'] },
        { module: 'customers', actions: ['view'] },
        { module: 'suppliers', actions: ['view'] },
        { module: 'expenses', actions: ['view', 'create', 'edit', 'export', 'approve'] },
        { module: 'vouchers', actions: ['view', 'create', 'edit', 'export', 'approve'] },
        { module: 'accounting', actions: ['view', 'create', 'edit', 'export'] },
        { module: 'reports', actions: ['view', 'export'] },
        { module: 'settings', actions: ['view'] },
        { module: 'activity_log', actions: ['view'] }
    ],

    // الموظف - صلاحيات أساسية
    employee: [
        { module: 'dashboard', actions: ['view'] },
        { module: 'sales', actions: ['view', 'create'] },
        { module: 'purchases', actions: ['view', 'create'] },
        { module: 'inventory', actions: ['view'] },
        { module: 'customers', actions: ['view', 'create'] },
        { module: 'suppliers', actions: ['view'] },
        { module: 'vouchers', actions: ['view', 'create'] }
    ]
};

// تعريفات الأدوار الكاملة
export const ROLES: Role[] = [
    {
        id: 'manager',
        name: 'مدير',
        nameEn: 'Manager',
        description: 'صلاحيات كاملة على جميع الوحدات',
        level: 1,
        permissions: DEFAULT_ROLE_PERMISSIONS.manager
    },
    {
        id: 'accountant',
        name: 'محاسب',
        nameEn: 'Accountant',
        description: 'صلاحيات على الحسابات والتقارير المالية',
        level: 2,
        permissions: DEFAULT_ROLE_PERMISSIONS.accountant
    },
    {
        id: 'employee',
        name: 'موظف',
        nameEn: 'Employee',
        description: 'صلاحيات أساسية للعمليات اليومية',
        level: 3,
        permissions: DEFAULT_ROLE_PERMISSIONS.employee
    }
];

// دالة للحصول على صلاحيات دور معين
export function getRolePermissions(role: UserRole): Permission[] {
    return DEFAULT_ROLE_PERMISSIONS[role] || [];
}

// دالة للتحقق من صلاحية معينة
export function hasPermission(
    role: UserRole,
    module: PermissionModule,
    action: PermissionAction
): boolean {
    const permissions = getRolePermissions(role);
    const modulePermission = permissions.find(p => p.module === module);
    return modulePermission?.actions.includes(action) || false;
}

// ==========================================
// Legacy exports for backward compatibility
// ==========================================

export interface OrganizationMember {
    id: string;
    userId: string;
    organizationId: string;
    roleId: string;
    branchId: string;
    crossBranchPermissions: CrossBranchPermission[];
    isOwner: boolean;
    isActive: boolean;
    joinedAt: string;
    lastActiveAt?: string;
}

export interface CrossBranchPermission {
    branchId: string;
    viewOnly: boolean;
    modules: PermissionModule[];
}
