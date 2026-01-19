/**
 * Supabase Client - عميل سوبابيس
 * الاتصال المركزي بقاعدة البيانات والمصادقة
 */

import { createClient } from '@supabase/supabase-js';

// قراءة متغيرات البيئة
// @ts-ignore - Vite provides this
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
// @ts-ignore - Vite provides this
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// التحقق من وجود المتغيرات
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase configuration missing!');
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

// التحقق من صحة صيغة مفتاح Supabase
// مفتاح Supabase الصحيح يجب أن يكون JWT ويبدأ بـ eyJ
const isValidSupabaseKey = supabaseAnonKey.startsWith('eyJ');
if (supabaseAnonKey && !isValidSupabaseKey) {
    console.error('❌ Invalid Supabase Anon Key format!');
    console.error('The key should be a JWT token starting with "eyJ"');
    console.error('Current key starts with:', supabaseAnonKey.substring(0, 15) + '...');
    console.error('Please get the correct anon key from your Supabase project settings > API');
}

// تصدير متغير للتحقق من صحة الإعدادات
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && isValidSupabaseKey);

// إنشاء عميل Supabase
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
        // حفظ الجلسة في localStorage
        persistSession: true,
        // تحديث التوكن تلقائياً
        autoRefreshToken: true,
        // اكتشاف الجلسة من URL (للـ OAuth)
        detectSessionInUrl: true,
        // مفتاح التخزين
        storageKey: 'alzhra_auth_session',
        // رابط تدفق المصادقة
        flowType: 'implicit'
    },
    // تعطيل الرسائل التصحيحية في وحدة التحكم
    global: {
        headers: { 'x-my-custom-header': 'alzhra-app' }
    }
});

// نوع قاعدة البيانات (سيتم توسيعه لاحقاً)
export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    name: string;
                    email: string | null;
                    phone: string | null;
                    role: 'manager' | 'accountant' | 'employee';
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
            };
        };
    };
};

export default supabase;
