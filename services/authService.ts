/**
 * Auth Service - خدمة المصادقة
 * التعامل مع تسجيل الدخول والخروج وإدارة المستخدمين
 * 
 * ⚠️ تم تقسيم هذا الملف إلى ملفات أصغر في مجلد services/auth/
 * - authHelpers.ts - دوال مساعدة
 * - sessionService.ts - إدارة الجلسات
 * - authProfileService.ts - إدارة الملفات الشخصية
 * - authPermissionsService.ts - إدارة الصلاحيات
 */

import { supabase, generateUUID, getCurrentTimestamp } from '../lib/supabaseClient';
import { AuthUser, LoginCredentials, RegisterData, AuthError } from '../types/auth';

// Import from modular files
import { mapAuthError, mapUserToAuthUser } from './auth/authHelpers';
import { getCurrentUser, getSession, onAuthStateChange } from './auth/sessionService';
import { ensureProfileExists, updateProfile } from './auth/authProfileService';
import {
    hasPermission,
    hasAnyPermission,
    getUserRole,
    isAdmin,
    isManagerOrAbove
} from './auth/authPermissionsService';

/**
 * خدمة المصادقة
 */
export const authService = {
    // =================== Session (from sessionService) ===================
    getCurrentUser,
    getSession,
    onAuthStateChange,

    // =================== Profile (from authProfileService) ===================
    ensureProfileExists,
    updateProfile,

    // =================== Permissions (from authPermissionsService) ===================
    hasPermission,
    hasAnyPermission,
    getUserRole,
    isAdmin,
    isManagerOrAbove,

    // =================== Core Auth Functions ===================

    /**
     * تسجيل الدخول بالبريد وكلمة المرور
     */
    async signIn(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: AuthError | null }> {
        try {
            console.log('🔐 Starting signIn for:', credentials.email);

            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('انتهت مهلة الاتصال بالخادم')), 20000)
            );

            const signInPromise = supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password
            });

            const result = await Promise.race([signInPromise, timeoutPromise]);

            if (result.error) {
                console.error('❌ SignIn error:', result.error);
                return { user: null, error: mapAuthError(result.error) };
            }

            if (!result.data?.user) {
                return { user: null, error: { code: 'no_user', message: 'لم يتم العثور على المستخدم' } };
            }

            console.log('✅ SignIn successful for:', result.data.user.email);

            await ensureProfileExists(result.data.user);
            const user = await mapUserToAuthUser(result.data.user);
            return { user, error: null };
        } catch (err: any) {
            console.error('❌ SignIn exception:', err.message);
            return { user: null, error: { code: 'timeout', message: err.message || 'فشل الاتصال بالخادم' } };
        }
    },

    /**
     * إنشاء حساب جديد
     */
    async signUp(data: RegisterData): Promise<{ user: AuthUser | null; error: AuthError | null }> {
        try {
            console.log('🚀 Starting signUp for:', data.email);

            // 1. Create Auth User (Trigger will create Profile automatically)
            const result = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        name: data.name,
                        phone: data.phone
                    }
                }
            });

            if (result.error) {
                console.error('❌ SignUp error:', result.error);
                return { user: null, error: mapAuthError(result.error) };
            }

            if (!result.data?.user) {
                return { user: null, error: { code: 'signup_failed', message: 'فشل في إنشاء الحساب' } };
            }

            const userId = result.data.user.id;

            // 2. Wait for Profile Creation (by Trigger) - with retry logic
            let profileId = null;
            let attempts = 0;
            while (!profileId && attempts < 5) {
                const { data: profile } = await (supabase as any)
                    .from('profiles')
                    .select('id')
                    .eq('auth_user_id', userId)
                    .single();

                if (profile) {
                    profileId = profile.id;
                } else {
                    await new Promise(r => setTimeout(r, 1000)); // Wait 1s
                    attempts++;
                }
            }

            // Fallback: If trigger failed, create profile manually
            if (!profileId) {
                console.warn('⚠️ Trigger failed, creating profile manually...');
                const { data: newProfile, error: profileError } = await (supabase as any)
                    .from('profiles')
                    .insert({
                        id: userId,
                        email: data.email,
                        full_name: data.name,
                        phone: data.phone,
                        status: 'active'
                    })
                    .select()
                    .single();

                if (!profileError) profileId = newProfile.id;
            }

            // 3. Create Company & Assign Manager Role
            if (profileId) {
                const companyName = data.companyName || `${data.name} - شركة`;

                // Create Company
                const { data: newCompany, error: companyError } = await (supabase as any)
                    .from('companies')
                    .insert({
                        name: companyName,
                        email: data.email,
                        is_active: true
                    })
                    .select()
                    .single();

                if (newCompany && !companyError) {
                    const companyId = newCompany.id;

                    // Create Owner/Manager Role
                    const { data: managerRole } = await (supabase as any)
                        .from('roles')
                        .insert({
                            company_id: companyId,
                            name: 'manager',
                            name_ar: 'المدير',
                            description: 'صلاحيات كاملة',
                            permissions: ['*'] // Full permissions
                        })
                        .select()
                        .single();

                    if (managerRole) {
                        // Link User to Company as Owner
                        await (supabase as any).from('user_companies').insert({
                            user_id: profileId,
                            company_id: companyId,
                            role_id: managerRole.id,
                            is_owner: true,
                            is_default: true,
                            appointed_at: getCurrentTimestamp()
                        });

                        console.log('✅ Company setup complete:', companyId);

                        // Create Default Branch
                        await (supabase as any).from('branches').insert({
                            company_id: companyId,
                            name: 'الفرع الرئيسي',
                            is_main: true,
                            is_active: true
                        });
                    }
                }
            }

            const user = await mapUserToAuthUser(result.data.user);
            return { user, error: null };
        } catch (err: any) {
            console.error('❌ SignUp exception:', err.message);
            return { user: null, error: { code: 'unknown', message: err.message } };
        }
    },

    /**
     * تسجيل الخروج
     */
    async signOut(): Promise<{ error: AuthError | null }> {
        try {
            const { error } = await supabase.auth.signOut();
            return { error: mapAuthError(error) };
        } catch (err: any) {
            return { error: { code: 'unknown', message: err.message } };
        }
    },

    /**
     * إعادة تعيين كلمة المرور
     */
    async resetPassword(email: string): Promise<{ success: boolean; error: AuthError | null }> {
        console.log(`[Auth] Password reset requested for: ${email}`);
        return { success: true, error: null };
    }
};

export default authService;
