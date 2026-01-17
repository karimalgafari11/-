/**
 * Auth Service - خدمة المصادقة
 * التعامل مع تسجيل الدخول والخروج وإدارة المستخدمين
 */

import { supabase } from '../lib/supabaseClient';
import { AuthUser, LoginCredentials, RegisterData, AuthError } from '../types/auth';
import { UserRole } from '../types/organization';
import type { User, AuthError as SupabaseAuthError } from '@supabase/supabase-js';

// تحويل خطأ Supabase لخطأ مخصص
const mapAuthError = (error: SupabaseAuthError | Error | null): AuthError | null => {
    if (!error) return null;

    const errorMap: Record<string, AuthError> = {
        'Invalid login credentials': {
            code: 'invalid_credentials',
            message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        },
        'Email not confirmed': {
            code: 'email_not_confirmed',
            message: 'يرجى تأكيد بريدك الإلكتروني أولاً'
        },
        'User already registered': {
            code: 'user_exists',
            message: 'هذا البريد الإلكتروني مسجل مسبقاً',
            field: 'email'
        },
        'Password should be at least 6 characters': {
            code: 'weak_password',
            message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
            field: 'password'
        },
        'Invalid email': {
            code: 'invalid_email',
            message: 'صيغة البريد الإلكتروني غير صحيحة',
            field: 'email'
        }
    };

    const message = error.message || 'حدث خطأ غير متوقع';
    return errorMap[message] || {
        code: 'unknown',
        message: message
    };
};

// تحويل مستخدم Supabase لمستخدم التطبيق
const mapSupabaseUser = async (user: User): Promise<AuthUser> => {
    // محاولة جلب بيانات الملف الشخصي
    let profile = null;
    try {
        // إنشاء promise مع timeout لمنع التعليق
        const profilePromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
        );

        const result = await Promise.race([profilePromise, timeoutPromise]) as any;

        if (result && !result.error && result.data) {
            profile = result.data;
        }
    } catch (e) {
        console.warn('Could not fetch profile (timeout or error):', e);
    }

    return {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'مستخدم',
        avatar: profile?.avatar_url || user.user_metadata?.avatar_url,
        phone: profile?.phone || user.phone,
        role: (profile?.role as UserRole) || 'employee',
        isActive: profile?.is_active !== false,
        createdAt: user.created_at,
        lastLoginAt: user.last_sign_in_at || undefined
    };
};

/**
 * خدمة المصادقة
 */
export const authService = {
    /**
     * تسجيل الدخول بالبريد وكلمة المرور
     */
    async signIn(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: AuthError | null }> {
        // TEST CREDENTIALS BYPASS
        if (credentials.email === 'test@alzhra.com' && credentials.password === 'test123456') {
            console.log('Using Test Credentials Bypass');
            return {
                user: {
                    id: 'test-user-id',
                    email: 'test@alzhra.com',
                    name: 'Test Admin',
                    role: 'manager',
                    isActive: true,
                    createdAt: new Date().toISOString()
                },
                error: null
            };
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password
            });

            if (error) {
                return { user: null, error: mapAuthError(error) };
            }

            if (!data.user) {
                return { user: null, error: { code: 'no_user', message: 'لم يتم العثور على المستخدم' } };
            }

            const user = await mapSupabaseUser(data.user);
            return { user, error: null };
        } catch (err) {
            return { user: null, error: mapAuthError(err as Error) };
        }
    },

    /**
     * إنشاء حساب جديد
     */
    async signUp(data: RegisterData): Promise<{ user: AuthUser | null; error: AuthError | null }> {
        try {
            const { data: authData, error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        name: data.name,
                        phone: data.phone
                    }
                }
            });

            if (error) {
                return { user: null, error: mapAuthError(error) };
            }

            if (!authData.user) {
                return { user: null, error: { code: 'signup_failed', message: 'فشل في إنشاء الحساب' } };
            }

            // إنشاء ملف شخصي في جدول profiles
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    name: data.name,
                    email: data.email,
                    phone: data.phone || null,
                    role: 'employee',
                    is_active: true
                });

            if (profileError) {
                console.warn('Could not create profile:', profileError.message);
            }

            const user = await mapSupabaseUser(authData.user);
            return { user, error: null };
        } catch (err) {
            return { user: null, error: mapAuthError(err as Error) };
        }
    },

    /**
     * تسجيل الخروج
     */
    async signOut(): Promise<{ error: AuthError | null }> {
        try {
            const { error } = await supabase.auth.signOut();
            return { error: mapAuthError(error) };
        } catch (err) {
            return { error: mapAuthError(err as Error) };
        }
    },

    /**
     * إعادة تعيين كلمة المرور
     */
    async resetPassword(email: string): Promise<{ success: boolean; error: AuthError | null }> {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/#/reset-password`
            });

            if (error) {
                return { success: false, error: mapAuthError(error) };
            }

            return { success: true, error: null };
        } catch (err) {
            return { success: false, error: mapAuthError(err as Error) };
        }
    },

    /**
     * الحصول على المستخدم الحالي
     */
    async getCurrentUser(): Promise<AuthUser | null> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;
            return await mapSupabaseUser(user);
        } catch {
            return null;
        }
    },

    /**
     * الحصول على الجلسة الحالية
     */
    async getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    /**
     * الاستماع لتغييرات حالة المصادقة
     */
    onAuthStateChange(callback: (user: AuthUser | null) => void) {
        return supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const user = await mapSupabaseUser(session.user);
                callback(user);
            } else {
                callback(null);
            }
        });
    },

    /**
     * تحديث بيانات المستخدم
     */
    async updateProfile(userId: string, updates: { name?: string; phone?: string; avatar?: string }): Promise<{ error: AuthError | null }> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId);

            return { error: mapAuthError(error) };
        } catch (err) {
            return { error: mapAuthError(err as Error) };
        }
    }
};

export default authService;
