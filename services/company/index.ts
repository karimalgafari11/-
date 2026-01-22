/**
 * Company Service - Index
 * ملف التصدير الرئيسي لخدمة الشركات
 * 
 * تم إعادة هيكلة الملف الأصلي (902 سطر) إلى:
 * - types.ts - الأنواع
 * - localStorage.ts - التخزين المحلي
 * - cache.ts - الكاش
 * - mappers.ts - دوال التحويل
 * - companyCore.ts - العمليات الأساسية
 * - companyUsers.ts - إدارة المستخدمين
 * - companyDiagnostics.ts - التشخيص والإصلاح
 */

// تصدير الأنواع
export * from './types';

// تصدير الدوال
export * from './localStorage';
export * from './cache';
export * from './mappers';
export * from './companyCore';
export * from './companyUsers';
export * from './companyDiagnostics';

// للتوافق مع الكود القديم - نُنشئ كائن companyService
import * as core from './companyCore';
import * as users from './companyUsers';
import * as diagnostics from './companyDiagnostics';
import { mapSupabaseCompany } from './mappers';
import { clearCache } from './cache';
import { supabase, generateUUID, getCurrentTimestamp } from '../../lib/supabaseClient';
import { CompanyData, UserProfile } from './types';
import { profileService } from '../profileService';
import { authService } from '../authService';
import { getCachedProfile, setCachedProfile } from './cache';

export const companyService = {
    // Core operations
    getUserCompanies: core.getUserCompanies,

    async getCurrentCompany(): Promise<CompanyData | null> {
        return core.getCurrentCompany(this.createCompany.bind(this));
    },

    async getCompanyId(): Promise<string | null> {
        return core.getCompanyId(this.getCurrentCompany.bind(this));
    },

    async getCurrentProfile(): Promise<UserProfile | null> {
        const cached = getCachedProfile();
        if (cached) return cached;

        try {
            const user = await authService.getCurrentUser();
            if (!user) return null;

            const companyId = await this.getCompanyId();
            if (!companyId) return null;

            const profile = await profileService.getProfile(user.id, companyId);
            if (profile) {
                const userProfile: UserProfile = {
                    id: profile.id,
                    company_id: profile.company_id,
                    name: profile.name,
                    email: profile.email,
                    phone: profile.phone,
                    role: profile.role,
                    is_active: profile.is_active,
                    created_at: profile.created_at
                };
                setCachedProfile(userProfile);
                return userProfile;
            }

            return null;
        } catch (error) {
            console.error('Error getting current profile:', error);
            return null;
        }
    },

    createCompany: core.createCompany,
    updateCompany: core.updateCompany,
    switchCompany: core.switchCompany,

    // تهيئة البيانات الافتراضية للشركة
    async initializeCompanyData(companyId: string): Promise<void> {
        const now = getCurrentTimestamp();

        await (supabase as any).from('branches').insert({
            id: generateUUID(),
            company_id: companyId,
            name: 'الفرع الرئيسي',
            is_active: true,
            created_at: now
        });

        await (supabase as any).from('company_settings').insert({
            id: generateUUID(),
            company_id: companyId,
            currency: 'IQD',
            tax_enabled: false,
            tax_rate: 0,
            invoice_prefix: 'INV-',
            invoice_next_number: 1,
            fiscal_year_start: '01-01',
            created_at: now
        });

        await (supabase as any).from('partners').insert({
            id: generateUUID(),
            company_id: companyId,
            type: 'customer',
            name: 'عميل نقدي',
            current_balance: 0,
            is_active: true,
            created_at: now
        });

        const accountTypes = [
            { code: '1', name: 'الأصول', type: 'asset' },
            { code: '11', name: 'الأصول المتداولة', type: 'asset' },
            { code: '111', name: 'النقدية', type: 'asset' },
            { code: '112', name: 'البنك', type: 'asset' },
            { code: '113', name: 'الذمم المدينة', type: 'asset' },
            { code: '114', name: 'المخزون', type: 'asset' },
            { code: '2', name: 'الخصوم', type: 'liability' },
            { code: '21', name: 'الخصوم المتداولة', type: 'liability' },
            { code: '211', name: 'الذمم الدائنة', type: 'liability' },
            { code: '3', name: 'حقوق الملكية', type: 'equity' },
            { code: '31', name: 'رأس المال', type: 'equity' },
            { code: '32', name: 'الأرباح المحتجزة', type: 'equity' },
            { code: '4', name: 'الإيرادات', type: 'revenue' },
            { code: '41', name: 'إيرادات المبيعات', type: 'revenue' },
            { code: '5', name: 'المصروفات', type: 'expense' },
            { code: '51', name: 'مصروفات البضاعة المباعة', type: 'expense' },
            { code: '52', name: 'مصروفات تشغيلية', type: 'expense' }
        ];

        for (const acc of accountTypes) {
            await (supabase as any).from('accounts').insert({
                id: generateUUID(),
                company_id: companyId,
                code: acc.code,
                name: acc.name,
                account_type: acc.type,
                is_active: true,
                created_at: now
            });
        }
    },

    // User management
    addUserToCompany: users.addUserToCompany,
    removeUserFromCompany: users.removeUserFromCompany,
    getCompanyUsers: users.getCompanyUsers,
    changeUserRole: users.changeUserRole,
    hasAccessToCompany: users.hasAccessToCompany,

    async isAdmin(): Promise<boolean> {
        return users.isAdmin(this.getCurrentProfile.bind(this));
    },

    // Diagnostics
    diagnoseUserSetup: diagnostics.diagnoseUserSetup,
    ensureUserCompanyRoleExists: diagnostics.ensureUserCompanyRoleExists,

    // Helpers
    mapSupabaseCompany,
    clearCache
};

export default companyService;
