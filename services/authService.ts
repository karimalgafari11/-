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
// Cache to avoid repeated profile fetches - reduces server load and console noise
const profileCache = new Map<string, { profile: any; timestamp: number }>();
const PROFILE_CACHE_TTL = 30000; // 30 seconds cache

const mapSupabaseUser = async (user: User): Promise<AuthUser> => {
    // محاولة جلب بيانات الملف الشخصي
    let profile = null;

    // Check cache first
    const cached = profileCache.get(user.id);
    if (cached && Date.now() - cached.timestamp < PROFILE_CACHE_TTL) {
        profile = cached.profile;
    } else {
        try {
            // Create AbortController for proper cleanup
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // زيادة الوقت لـ 5 ثواني

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .abortSignal(controller.signal)
                .single();

            clearTimeout(timeoutId);

            if (!error && data) {
                profile = data;
                // Cache the result
                profileCache.set(user.id, { profile, timestamp: Date.now() });
            }
        } catch (e: any) {
            // Silently handle abort errors and profile fetch failures
            // User can still use the app with default values
        }
    }

    return {
        id: user.id,
        companyId: profile?.company_id || '', // Changed from 'cmp_default' which causes UUID error
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
        // TEST CREDENTIALS BYPASS - يستخدم معرف شركة حقيقي
        if (credentials.email === 'test@alzhra.com' && credentials.password === 'test123456') {
            console.log('Using Test Credentials Bypass');
            return {
                user: {
                    id: 'test-user-id-001',
                    companyId: 'a1111111-1111-1111-1111-111111111111', // معرف الشركة الحقيقي
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
            console.log('🔐 Starting signIn for:', credentials.email);

            // إنشاء Promise مع timeout لتجنب التعليق
            const signInPromise = supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password
            });

            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Connection timeout - تأكد من اتصالك بالإنترنت')), 15000)
            );

            const { data, error } = await Promise.race([signInPromise, timeoutPromise]);

            if (error) {
                console.error('❌ SignIn error:', error);
                return { user: null, error: mapAuthError(error) };
            }

            if (!data.user) {
                return { user: null, error: { code: 'no_user', message: 'لم يتم العثور على المستخدم' } };
            }

            console.log('✅ SignIn successful for:', data.user.email);
            const user = await mapSupabaseUser(data.user);
            return { user, error: null };
        } catch (err: any) {
            console.error('❌ SignIn exception:', err.message);
            return { user: null, error: mapAuthError(err as Error) };
        }
    },

    /**
     * إنشاء حساب جديد
     */
    async signUp(data: RegisterData): Promise<{ user: AuthUser | null; error: AuthError | null }> {
        try {
            console.log('🚀 Starting signUp process for:', data.email);

            // 1. إنشاء المستخدم في Supabase Auth
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
                console.error('❌ Auth signUp error:', error);
                return { user: null, error: mapAuthError(error) };
            }

            if (!authData.user) {
                console.error('❌ No user returned from signUp');
                return { user: null, error: { code: 'signup_failed', message: 'فشل في إنشاء الحساب' } };
            }

            console.log('✅ Auth user created:', authData.user.id);

            // 2. انتظار قليل للـ trigger ليعمل (إذا كان موجوداً)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 3. التحقق من وجود profile وcompany (قد يكون الـ trigger أنشأهما)
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id, company_id')
                .eq('id', authData.user.id)
                .single();

            let companyId = existingProfile?.company_id || null;
            console.log('📋 Existing profile check:', { hasProfile: !!existingProfile, companyId });

            // 4. إذا لم تكن هناك شركة، ننشئها
            if (!companyId) {
                const companyName = data.companyName || `${data.name} - شركة`;
                console.log('📦 Creating company with defaults:', companyName);

                // محاولة استخدام الدالة المخزنة أولاً
                const { data: rpcResult, error: rpcError } = await supabase
                    .rpc('create_company_with_defaults', {
                        p_name: companyName,
                        p_email: data.email,
                        p_user_id: authData.user.id
                    });

                if (!rpcError && rpcResult) {
                    companyId = rpcResult;
                    console.log('✅ Company created via RPC:', companyId);

                    // إنشاء الحسابات الافتراضية
                    await supabase.rpc('create_default_accounts', { p_company_id: companyId });
                    console.log('✅ Default accounts created');
                } else {
                    console.warn('⚠️ RPC failed, trying direct insert:', rpcError?.message);

                    // الطريقة البديلة: إنشاء الشركة مباشرة
                    const { data: newCompany, error: companyError } = await supabase
                        .from('companies')
                        .insert({
                            name: companyName,
                            email: data.email
                        })
                        .select()
                        .single();

                    if (companyError) {
                        console.error('❌ Error creating company:', companyError);
                        // نكمل بدون شركة - المستخدم يمكنه إنشاءها لاحقاً
                        console.warn('⚠️ Continuing without company - user can create it later');
                    } else {
                        companyId = newCompany.id;
                        console.log('✅ Company created directly:', companyId);
                    }
                }

                // تحديث الملف الشخصي بـ company_id إذا وجدت
                if (companyId) {
                    console.log('👤 Updating profile with company_id:', companyId);

                    const { error: profileError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: authData.user.id,
                            company_id: companyId,
                            name: data.name,
                            email: data.email,
                            phone: data.phone || null,
                            role: 'manager',
                            is_active: true
                        }, { onConflict: 'id' });

                    if (profileError) {
                        console.error('❌ Error updating profile:', profileError);
                    } else {
                        console.log('✅ Profile updated successfully');
                    }
                }
            } else {
                console.log('✅ Company already exists from trigger:', companyId);
            }

            // 5. إعادة جلب بيانات المستخدم مع الشركة
            // مسح الـ cache لضمان جلب البيانات المحدّثة
            profileCache.delete(authData.user.id);
            const user = await mapSupabaseUser(authData.user);
            if (user && companyId) {
                user.companyId = companyId;
            }

            console.log('✅ SignUp complete!', { userId: user?.id, companyId: user?.companyId });
            return { user, error: null };
        } catch (err) {
            console.error('❌ Exception in signUp:', err);
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
