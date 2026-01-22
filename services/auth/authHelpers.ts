/**
 * Auth Helpers - دوال مساعدة للمصادقة
 * تحويل الأخطاء والمستخدمين
 */

import { AuthUser, AuthError } from '../../types/auth';
import { UserRole } from '../../types/organization';
import { rolesService } from '../rolesService';

/**
 * تحويل خطأ المصادقة لخطأ مخصص
 */
export const mapAuthError = (error: { message: string; code?: string } | null): AuthError | null => {
    if (!error) return null;

    const errorMap: Record<string, AuthError> = {
        'البريد الإلكتروني مسجل مسبقاً': {
            code: 'user_exists',
            message: 'هذا البريد الإلكتروني مسجل مسبقاً',
            field: 'email'
        },
        'الحساب معطل': {
            code: 'user_disabled',
            message: 'الحساب معطل'
        },
        'لا توجد جلسة نشطة': {
            code: 'no_session',
            message: 'لا توجد جلسة نشطة'
        }
    };

    const message = error.message || 'حدث خطأ غير متوقع';
    return errorMap[message] || {
        code: error.code || 'unknown',
        message: message
    };
};

/**
 * تحويل مستخدم لمستخدم التطبيق
 */
export const mapUserToAuthUser = async (user: {
    id: string;
    email?: string | null;
    name?: string;
    phone?: string;
    role?: string;
    company_id?: string;
    avatar_url?: string;
    is_active?: boolean;
    created_at?: string;
    user_metadata?: { name?: string; phone?: string };
}): Promise<AuthUser> => {
    const name = user.name || user.user_metadata?.name || user.email?.split('@')[0] || 'مستخدم';
    const phone = user.phone || user.user_metadata?.phone;

    let companyId = user.company_id;
    let userRole = user.role;

    if (!companyId || companyId === 'default-company-id') {
        try {
            const timeoutPromise = new Promise<null>((resolve) =>
                setTimeout(() => resolve(null), 5000)
            );

            const fetchInfoPromise = (async () => {
                const defaultCompanyId = await rolesService.getDefaultCompanyId(user.id);
                if (defaultCompanyId) {
                    const roleData = await rolesService.getUserCompanyRole(user.id, defaultCompanyId);
                    return { companyId: defaultCompanyId, role: roleData?.role?.name };
                }
                return null;
            })();

            const result = await Promise.race([fetchInfoPromise, timeoutPromise]);

            if (result) {
                companyId = result.companyId || companyId;
                userRole = result.role || userRole;
            }
        } catch (error) {
            console.warn('⚠️ Could not fetch profile/company info, using defaults:', error);
        }
    }

    return {
        id: user.id,
        companyId: companyId || 'default-company-id',
        email: user.email || '',
        name: name,
        avatar: user.avatar_url,
        phone: phone,
        role: (userRole as UserRole) || 'employee',
        isActive: user.is_active !== false,
        createdAt: user.created_at || new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
    };
};
