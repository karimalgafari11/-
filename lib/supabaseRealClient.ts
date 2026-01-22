/**
 * Supabase Real Client - عميل Supabase الحقيقي
 * يتصل مباشرة بقاعدة البيانات السحابية
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase-database';

// الحصول على إعدادات Supabase من المتغيرات البيئية
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// التحقق من وجود الإعدادات
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables missing!');
}

// إنشاء عميل Supabase
export const supabaseReal: SupabaseClient<Database> = createClient<Database>(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
        global: {
            headers: {
                'x-client-info': 'alzhra-app',
            },
        },
        db: {
            schema: 'public',
        },
    }
);

// التحقق من اتصال Supabase
export const isSupabaseConnected = async (): Promise<boolean> => {
    try {
        if (!supabaseUrl || !supabaseAnonKey) return false;
        const { error } = await supabaseReal.from('companies').select('id').limit(1);
        return !error;
    } catch {
        return false;
    }
};

// تصدير الحالة
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export default supabaseReal;
