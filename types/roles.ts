/**
 * Roles & Permissions Types - أنواع الأدوار والصلاحيات
 */

// =================== الأدوار ===================

export type SystemRoleName = 'super_admin' | 'admin' | 'manager' | 'accountant' | 'employee';

export interface Role {
    id: string;
    tenant_id: string | null;  // null = system role
    name: string;
    name_ar: string;
    description?: string;
    is_system: boolean;
    permissions: string[];  // قائمة أكواد الصلاحيات
    created_at: string;
    updated_at: string;
}

export type RoleInsert = Omit<Role, 'id' | 'created_at' | 'updated_at'>;
export type RoleUpdate = Partial<RoleInsert>;

// =================== الصلاحيات ===================

export type PermissionModule =
    | 'sales'
    | 'purchases'
    | 'inventory'
    | 'accounting'
    | 'reports'
    | 'users'
    | 'company';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';

export interface Permission {
    id: string;
    code: string;  // مثل: sales.create
    name: string;
    name_ar: string;
    module: PermissionModule;
    description?: string;
    created_at: string;
}

// قائمة الصلاحيات المحددة مسبقاً
export const PERMISSIONS = {
    // المبيعات
    SALES_VIEW: 'sales.view',
    SALES_CREATE: 'sales.create',
    SALES_EDIT: 'sales.edit',
    SALES_DELETE: 'sales.delete',
    SALES_APPROVE: 'sales.approve',

    // المشتريات
    PURCHASES_VIEW: 'purchases.view',
    PURCHASES_CREATE: 'purchases.create',
    PURCHASES_EDIT: 'purchases.edit',
    PURCHASES_DELETE: 'purchases.delete',

    // المخزون
    INVENTORY_VIEW: 'inventory.view',
    INVENTORY_CREATE: 'inventory.create',
    INVENTORY_EDIT: 'inventory.edit',
    INVENTORY_DELETE: 'inventory.delete',
    INVENTORY_ADJUST: 'inventory.adjust',

    // المحاسبة
    ACCOUNTING_VIEW: 'accounting.view',
    ACCOUNTING_CREATE: 'accounting.create',
    ACCOUNTING_APPROVE: 'accounting.approve',
    ACCOUNTING_CLOSE_PERIOD: 'accounting.close_period',

    // التقارير
    REPORTS_VIEW: 'reports.view',
    REPORTS_EXPORT: 'reports.export',
    REPORTS_FINANCIAL: 'reports.financial',

    // المستخدمين
    USERS_VIEW: 'users.view',
    USERS_CREATE: 'users.create',
    USERS_EDIT: 'users.edit',
    USERS_DELETE: 'users.delete',
    USERS_ASSIGN_ROLES: 'users.assign_roles',

    // الشركة
    COMPANY_VIEW: 'company.view',
    COMPANY_EDIT: 'company.edit',
    COMPANY_SETTINGS: 'company.settings',
} as const;

export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// =================== ربط المستخدم بالشركة ===================

export interface UserCompanyRole {
    id: string;
    user_id: string;
    company_id: string;
    role_id: string;
    is_default: boolean;
    is_owner: boolean;
    is_active: boolean;
    custom_permissions: string[];
    joined_at: string;
    updated_at: string;

    // علاقات (للتحميل مع select)
    role?: Role;
    company?: {
        id: string;
        name: string;
    };
}

export type UserCompanyRoleInsert = Omit<UserCompanyRole, 'id' | 'joined_at' | 'updated_at' | 'role' | 'company'>;
export type UserCompanyRoleUpdate = Partial<UserCompanyRoleInsert>;

// =================== دوال مساعدة ===================

/**
 * التحقق من صلاحية معينة
 */
export function hasPermission(
    userPermissions: string[],
    rolePermissions: string[],
    requiredPermission: string
): boolean {
    const allPermissions = [...rolePermissions, ...userPermissions];

    // التحقق من صلاحية كاملة
    if (allPermissions.includes('*')) return true;

    // التحقق من الصلاحية المطلوبة
    if (allPermissions.includes(requiredPermission)) return true;

    // التحقق من صلاحية الوحدة (module.*)
    const module = requiredPermission.split('.')[0];
    if (allPermissions.includes(`${module}.*`)) return true;

    return false;
}

/**
 * الحصول على قائمة الصلاحيات حسب الوحدة
 */
export function getPermissionsByModule(module: PermissionModule): PermissionCode[] {
    return Object.values(PERMISSIONS).filter(p => p.startsWith(`${module}.`));
}
