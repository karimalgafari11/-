/**
 * Local Auth Client - نظام المصادقة المحلي
 * بديل بسيط لـ Supabase Auth
 */

import { generateUUID, getCurrentTimestamp } from './localStorageClient';

// مفاتيح التخزين
const AUTH_SESSION_KEY = 'alzhra_auth_session';
const AUTH_USERS_KEY = 'alzhra_local_users';

// واجهة المستخدم
export interface LocalUser {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: 'manager' | 'accountant' | 'employee';
    company_id: string;
    avatar_url?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// واجهة الجلسة
export interface LocalSession {
    user: LocalUser;
    access_token: string;
    expires_at: number;
}

// واجهة خطأ المصادقة
export interface LocalAuthError {
    message: string;
    code?: string;
}

// واجهة نتيجة المصادقة
interface AuthResult<T> {
    data: T | null;
    error: LocalAuthError | null;
}

// الحصول على قائمة المستخدمين
function getUsers(): LocalUser[] {
    try {
        const data = localStorage.getItem(AUTH_USERS_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

// حفظ قائمة المستخدمين
function saveUsers(users: LocalUser[]): void {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

// الحصول على الجلسة الحالية
function getSession(): LocalSession | null {
    try {
        const data = localStorage.getItem(AUTH_SESSION_KEY);
        if (!data) return null;

        const session: LocalSession = JSON.parse(data);

        // التحقق من صلاحية الجلسة
        if (session.expires_at < Date.now()) {
            localStorage.removeItem(AUTH_SESSION_KEY);
            return null;
        }

        return session;
    } catch {
        return null;
    }
}

// حفظ الجلسة
function saveSession(session: LocalSession): void {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

// حذف الجلسة
function clearSession(): void {
    localStorage.removeItem(AUTH_SESSION_KEY);
}

// إنشاء جلسة جديدة
function createSession(user: LocalUser): LocalSession {
    return {
        user,
        access_token: generateUUID(),
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 ساعة
    };
}

// Callbacks للاستماع لتغييرات المصادقة
type AuthChangeCallback = (event: string, session: LocalSession | null) => void;
const authCallbacks: AuthChangeCallback[] = [];

// إخطار المستمعين
function notifyAuthChange(event: string, session: LocalSession | null): void {
    authCallbacks.forEach(callback => {
        try {
            callback(event, session);
        } catch (e) {
            console.error('Auth callback error:', e);
        }
    });
}

// خدمة المصادقة المحلية
export const localAuth = {
    /**
     * تسجيل الدخول بالبريد وكلمة المرور
     */
    async signInWithPassword(credentials: {
        email: string;
        password: string;
    }): Promise<AuthResult<{ user: LocalUser; session: LocalSession }>> {
        const { email, password } = credentials;

        // للنظام المحلي البسيط: قبول أي كلمة مرور
        // أو يمكن استخدام كلمة مرور ثابتة مثل "123456"

        let users = getUsers();
        let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        // إذا لم يوجد المستخدم، أنشئه تلقائياً
        if (!user) {
            // البحث عن شركة افتراضية أو إنشاؤها
            const defaultCompanyId = 'default-company-id';

            user = {
                id: generateUUID(),
                email: email.toLowerCase(),
                name: email.split('@')[0],
                role: 'manager',
                company_id: defaultCompanyId,
                is_active: true,
                created_at: getCurrentTimestamp(),
                updated_at: getCurrentTimestamp()
            };

            users.push(user);
            saveUsers(users);
        }

        if (!user.is_active) {
            return {
                data: null,
                error: { message: 'الحساب معطل', code: 'user_disabled' }
            };
        }

        const session = createSession(user);
        saveSession(session);

        // إخطار المستمعين
        notifyAuthChange('SIGNED_IN', session);

        return {
            data: { user, session },
            error: null
        };
    },

    /**
     * تسجيل مستخدم جديد
     */
    async signUp(data: {
        email: string;
        password: string;
        options?: {
            data?: {
                name?: string;
                phone?: string;
            }
        }
    }): Promise<AuthResult<{ user: LocalUser; session: LocalSession }>> {
        const { email, options } = data;
        const users = getUsers();

        // التحقق من عدم وجود المستخدم
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return {
                data: null,
                error: { message: 'البريد الإلكتروني مسجل مسبقاً', code: 'email_exists' }
            };
        }

        const defaultCompanyId = 'default-company-id';

        const user: LocalUser = {
            id: generateUUID(),
            email: email.toLowerCase(),
            name: options?.data?.name || email.split('@')[0],
            phone: options?.data?.phone,
            role: 'manager',
            company_id: defaultCompanyId,
            is_active: true,
            created_at: getCurrentTimestamp(),
            updated_at: getCurrentTimestamp()
        };

        users.push(user);
        saveUsers(users);

        const session = createSession(user);
        saveSession(session);

        // إخطار المستمعين
        notifyAuthChange('SIGNED_IN', session);

        return {
            data: { user, session },
            error: null
        };
    },

    /**
     * تسجيل الخروج
     */
    async signOut(): Promise<{ error: LocalAuthError | null }> {
        clearSession();
        notifyAuthChange('SIGNED_OUT', null);
        return { error: null };
    },

    /**
     * الحصول على الجلسة الحالية
     */
    async getSession(): Promise<AuthResult<{ session: LocalSession | null }>> {
        const session = getSession();
        return {
            data: { session },
            error: null
        };
    },

    /**
     * الحصول على المستخدم الحالي
     */
    async getUser(): Promise<AuthResult<{ user: LocalUser | null }>> {
        const session = getSession();
        return {
            data: { user: session?.user || null },
            error: null
        };
    },

    /**
     * تحديث بيانات المستخدم
     */
    async updateUser(updates: {
        data?: {
            name?: string;
            phone?: string;
            avatar_url?: string;
        }
    }): Promise<AuthResult<{ user: LocalUser }>> {
        const session = getSession();
        if (!session) {
            return {
                data: null,
                error: { message: 'لا توجد جلسة نشطة', code: 'no_session' }
            };
        }

        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === session.user.id);

        if (userIndex === -1) {
            return {
                data: null,
                error: { message: 'المستخدم غير موجود', code: 'user_not_found' }
            };
        }

        const updatedUser: LocalUser = {
            ...users[userIndex],
            ...updates.data,
            updated_at: getCurrentTimestamp()
        };

        users[userIndex] = updatedUser;
        saveUsers(users);

        // تحديث الجلسة
        const newSession = { ...session, user: updatedUser };
        saveSession(newSession);

        return {
            data: { user: updatedUser },
            error: null
        };
    },

    /**
     * إعادة تعيين كلمة المرور (غير مدعوم محلياً)
     */
    async resetPasswordForEmail(email: string): Promise<{ error: LocalAuthError | null }> {
        // في النظام المحلي، لا حاجة لإعادة تعيين كلمة المرور
        console.log(`[LocalAuth] Password reset requested for: ${email} (not implemented)`);
        return { error: null };
    },

    /**
     * الاستماع لتغييرات حالة المصادقة
     */
    onAuthStateChange(callback: AuthChangeCallback): { data: { subscription: { unsubscribe: () => void } } } {
        authCallbacks.push(callback);

        // إرسال الحالة الحالية
        const session = getSession();
        if (session) {
            setTimeout(() => callback('INITIAL_SESSION', session), 0);
        }

        return {
            data: {
                subscription: {
                    unsubscribe: () => {
                        const index = authCallbacks.indexOf(callback);
                        if (index > -1) {
                            authCallbacks.splice(index, 1);
                        }
                    }
                }
            }
        };
    },

    /**
     * تحديث الجلسة (تجديد التوكن)
     */
    async refreshSession(): Promise<AuthResult<{ session: LocalSession | null }>> {
        const session = getSession();
        if (!session) {
            return { data: { session: null }, error: null };
        }

        // تجديد الجلسة
        const newSession = {
            ...session,
            access_token: generateUUID(),
            expires_at: Date.now() + (24 * 60 * 60 * 1000)
        };

        saveSession(newSession);

        return { data: { session: newSession }, error: null };
    }
};

// تهيئة البيانات الافتراضية عند أول تشغيل
function initializeDefaultData(): void {
    // التحقق من وجود بيانات
    const users = getUsers();
    if (users.length > 0) return;

    // إنشاء شركة افتراضية
    const defaultCompanyId = 'default-company-id';
    const companies = localStorage.getItem('alzhra_local_companies');

    if (!companies) {
        const defaultCompany = {
            id: defaultCompanyId,
            name: 'شركتي',
            name_en: 'My Company',
            created_at: getCurrentTimestamp(),
            updated_at: getCurrentTimestamp()
        };
        localStorage.setItem('alzhra_local_companies', JSON.stringify([defaultCompany]));
    }

    // إنشاء إعدادات الشركة
    const settings = localStorage.getItem('alzhra_local_company_settings');
    if (!settings) {
        const defaultSettings = {
            id: generateUUID(),
            company_id: defaultCompanyId,
            currency: 'IQD',
            tax_enabled: false,
            tax_rate: 0,
            invoice_prefix: 'INV-',
            invoice_next_number: 1,
            fiscal_year_start: '01-01',
            settings_json: {},
            created_at: getCurrentTimestamp(),
            updated_at: getCurrentTimestamp()
        };
        localStorage.setItem('alzhra_local_company_settings', JSON.stringify([defaultSettings]));
    }

    // إنشاء فرع افتراضي
    const branches = localStorage.getItem('alzhra_local_branches');
    if (!branches) {
        const defaultBranch = {
            id: generateUUID(),
            company_id: defaultCompanyId,
            name: 'الفرع الرئيسي',
            is_active: true,
            created_at: getCurrentTimestamp()
        };
        localStorage.setItem('alzhra_local_branches', JSON.stringify([defaultBranch]));
    }

    // إنشاء دليل حسابات أساسي
    const accounts = localStorage.getItem('alzhra_local_accounts');
    if (!accounts) {
        const defaultAccounts = [
            { id: generateUUID(), company_id: defaultCompanyId, code: '1', name: 'الأصول', account_type: 'asset', is_active: true, balance: 0, created_at: getCurrentTimestamp() },
            { id: generateUUID(), company_id: defaultCompanyId, code: '11', name: 'النقدية', account_type: 'asset', is_active: true, balance: 0, created_at: getCurrentTimestamp() },
            { id: generateUUID(), company_id: defaultCompanyId, code: '12', name: 'العملاء', account_type: 'asset', is_active: true, balance: 0, created_at: getCurrentTimestamp() },
            { id: generateUUID(), company_id: defaultCompanyId, code: '13', name: 'المخزون', account_type: 'asset', is_active: true, balance: 0, created_at: getCurrentTimestamp() },
            { id: generateUUID(), company_id: defaultCompanyId, code: '2', name: 'الخصوم', account_type: 'liability', is_active: true, balance: 0, created_at: getCurrentTimestamp() },
            { id: generateUUID(), company_id: defaultCompanyId, code: '21', name: 'الموردون', account_type: 'liability', is_active: true, balance: 0, created_at: getCurrentTimestamp() },
            { id: generateUUID(), company_id: defaultCompanyId, code: '3', name: 'حقوق الملكية', account_type: 'equity', is_active: true, balance: 0, created_at: getCurrentTimestamp() },
            { id: generateUUID(), company_id: defaultCompanyId, code: '31', name: 'رأس المال', account_type: 'equity', is_active: true, balance: 0, created_at: getCurrentTimestamp() },
            { id: generateUUID(), company_id: defaultCompanyId, code: '4', name: 'الإيرادات', account_type: 'revenue', is_active: true, balance: 0, created_at: getCurrentTimestamp() },
            { id: generateUUID(), company_id: defaultCompanyId, code: '41', name: 'إيرادات المبيعات', account_type: 'revenue', is_active: true, balance: 0, created_at: getCurrentTimestamp() },
            { id: generateUUID(), company_id: defaultCompanyId, code: '5', name: 'المصروفات', account_type: 'expense', is_active: true, balance: 0, created_at: getCurrentTimestamp() },
            { id: generateUUID(), company_id: defaultCompanyId, code: '51', name: 'تكلفة البضاعة المباعة', account_type: 'expense', is_active: true, balance: 0, created_at: getCurrentTimestamp() },
            { id: generateUUID(), company_id: defaultCompanyId, code: '52', name: 'المصروفات العمومية', account_type: 'expense', is_active: true, balance: 0, created_at: getCurrentTimestamp() },
        ];
        localStorage.setItem('alzhra_local_accounts', JSON.stringify(defaultAccounts));
    }

    // إنشاء عميل عام
    const customers = localStorage.getItem('alzhra_local_customers');
    if (!customers) {
        const generalCustomer = {
            id: generateUUID(),
            company_id: defaultCompanyId,
            name: 'عميل نقدي',
            is_general: true,
            cash_only: true,
            is_active: true,
            balance: 0,
            created_at: getCurrentTimestamp(),
            updated_at: getCurrentTimestamp()
        };
        localStorage.setItem('alzhra_local_customers', JSON.stringify([generalCustomer]));
    }

    console.log('[LocalAuth] Default data initialized');
}

// تهيئة البيانات عند تحميل الملف
initializeDefaultData();

export default localAuth;
