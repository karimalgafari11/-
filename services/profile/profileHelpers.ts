/**
 * Profile Helpers - دوال مساعدة للملفات الشخصية
 */

import { UserProfile } from '../../types/organization';

/**
 * تحويل بيانات Supabase للنوع المحلي
 */
export function mapSupabaseProfile(data: any, userId: string): UserProfile {
    return {
        id: data.id,
        user_id: userId,
        company_id: data.company_id || '',
        name: data.name || '',
        email: data.email,
        phone: data.phone,
        role: data.role || 'employee',
        avatar_url: data.avatar_url,
        is_active: data.is_active !== false,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
    };
}
