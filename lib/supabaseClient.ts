/**
 * Supabase Client - عميل سوبابيس
 * الاتصال المركزي بقاعدة البيانات والمصادقة
 */

import { createClient } from '@supabase/supabase-js';

// قراءة متغيرات البيئة
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// التحقق من وجود المتغيرات
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase configuration missing!');
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

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
        storageKey: 'alzhra_auth_session'
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
