/**
 * Company Service Types - أنواع خدمة الشركات
 */

// تعريف الأنواع محلياً لتجنب circular dependency
// تعريف الأنواع محلياً لتجنب circular dependency
import { UserRole } from '../../types/organization';
export type { UserRole };

export interface CompanySettings {
    defaultCurrency: string;
    timezone: string;
    fiscalYearStart: string;
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
    defaultCurrency: 'IQD',
    timezone: 'Asia/Baghdad',
    fiscalYearStart: '01-01'
};

/**
 * بيانات الشركة
 */
export interface CompanyData {
    id: string;
    name: string;
    name_en?: string;
    phone?: string;
    email?: string;
    address?: string;
    logo?: string;
    tax_number?: string;
    commercial_register?: string;
    owner_id: string;
    is_active: boolean;
    settings: CompanySettings;
    created_at: string;
    updated_at?: string;
}

/**
 * الملف الشخصي للمستخدم
 */
export interface UserProfile {
    id: string;
    company_id: string;
    name: string;
    email?: string;
    phone?: string;
    role: UserRole;
    is_active: boolean;
    created_at: string;
}

/**
 * بيانات إنشاء شركة جديدة
 */
export interface CreateCompanyData {
    name: string;
    name_en?: string;
    phone?: string;
    email?: string;
    address?: string;
    logo?: string;
    tax_number?: string;
    commercial_register?: string;
}

/**
 * بيانات إضافة مستخدم
 */
export interface AddUserData {
    name: string;
    email?: string;
    phone?: string;
    role: UserRole;
}

/**
 * نتيجة تشخيص إعداد المستخدم
 */
export interface UserSetupDiagnosis {
    hasUser: boolean;
    hasProfile: boolean;
    hasCompany: boolean;
    hasUserCompanyRole: boolean;
    companyId: string | null;
    userId: string | null;
    errors: string[];
}
