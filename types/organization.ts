/**
 * Organization Types - أنواع الشركة والمستخدمين
 * نظام مبسط: شركة واحدة مع مستخدمين (مدير، محاسب، موظف)
 */

// أدوار المستخدمين
export type UserRole = 'manager' | 'accountant' | 'employee';

// أسماء الأدوار بالعربية
export const ROLE_NAMES: Record<UserRole, string> = {
    manager: 'مدير',
    accountant: 'محاسب',
    employee: 'موظف'
};

// الشركة
export interface Company {
    id: string;
    name: string;
    nameEn?: string;
    logo?: string;
    phone?: string;
    email?: string;
    address?: string;
    taxNumber?: string;           // الرقم الضريبي
    commercialRegister?: string;  // السجل التجاري
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    settings: CompanySettings;
}

// إعدادات الشركة
export interface CompanySettings {
    defaultCurrency: string;
    timezone: string;
    fiscalYearStart: string;   // MM-DD format
}

// مستخدم الشركة
export interface CompanyUser {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastActiveAt?: string;
}

// الإعدادات الافتراضية للشركة
export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
    defaultCurrency: 'SAR',
    timezone: 'Asia/Riyadh',
    fiscalYearStart: '01-01'
};

// ==========================================
// Legacy exports for backward compatibility
// ==========================================

// توافق مع الكود القديم
export interface Organization extends Company { }

export interface OrganizationSettings extends CompanySettings { }

// فرع وهمي للتوافق مع الكود القديم (سيتم إزالته لاحقاً)
export interface Branch {
    id: string;
    organizationId: string;
    name: string;
    nameEn?: string;
    code: string;
    address?: string;
    phone?: string;
    email?: string;
    managerId?: string;
    isMain: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    dataSharing: BranchDataSharing;
}

export interface BranchDataSharing {
    unifyProducts: boolean;
    unifyCustomers: boolean;
    unifySuppliers: boolean;
    unifyAccounts: boolean;
    allowCrossbranchSales: boolean;
    allowCrossbranchPurchases: boolean;
    allowCrossbranchTransfers: boolean;
    viewOtherBranches: 'none' | 'view_only' | 'full_access';
}

export const DEFAULT_DATA_SHARING: BranchDataSharing = {
    unifyProducts: true,
    unifyCustomers: true,
    unifySuppliers: true,
    unifyAccounts: true,
    allowCrossbranchSales: false,
    allowCrossbranchPurchases: false,
    allowCrossbranchTransfers: false,
    viewOtherBranches: 'full_access'
};

export interface BranchInvitation {
    id: string;
    branchId: string;
    email: string;
    roleId: string;
    invitedBy: string;
    expiresAt: string;
    status: 'pending' | 'accepted' | 'expired' | 'cancelled';
    createdAt: string;
}
