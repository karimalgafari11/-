/**
 * Session Service - خدمة الجلسات
 * إدارة جلسات المستخدم الحالي
 */

import { supabase } from '../../lib/supabaseClient';
import { AuthUser } from '../../types/auth';
import { mapUserToAuthUser } from './authHelpers';

/**
 * الحصول على المستخدم الحالي
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
    try {
        const { data } = await supabase.auth.getUser();
        if (!data?.user) return null;
        return await mapUserToAuthUser(data.user);
    } catch {
        return null;
    }
};

/**
 * الحصول على الجلسة الحالية
 */
export const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session || null;
};

/**
 * الاستماع لتغييرات حالة المصادقة
 */
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
    return supabase.auth.onAuthStateChange(async (event: string, session: any) => {
        if (session?.user) {
            const user = await mapUserToAuthUser(session.user);
            callback(user);
        } else {
            callback(null);
        }
    });
};

export const sessionService = {
    getCurrentUser,
    getSession,
    onAuthStateChange
};

export default sessionService;
