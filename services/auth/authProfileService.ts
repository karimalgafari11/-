/**
 * Auth Profile Service - خدمة الملف الشخصي
 * إدارة ملفات المستخدمين الشخصية
 */

import { supabase } from '../../lib/supabaseClient';
import { AuthError } from '../../types/auth';
import { mapAuthError } from './authHelpers';

/**
 * التحقق من وجود ملف شخصي وإنشاؤه إذا لم يوجد
 */
export const ensureProfileExists = async (user: any): Promise<void> => {
    try {
        const { data: existingProfile } = await (supabase as any)
            .from('profiles')
            .select('id')
            .eq('auth_user_id', user.id)
            .single();

        if (!existingProfile) {
            console.log('🛠️ Creating missing profile for:', user.id);
            const { error } = await (supabase as any)
                .from('profiles')
                .insert({
                    auth_user_id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.name || user.email?.split('@')[0],
                    phone: user.phone || user.user_metadata?.phone,
                    status: 'active'
                });

            if (error) console.error('❌ Failed to create profile:', error);
        }
    } catch (error) {
        console.error('Error ensuring profile:', error);
    }
};

/**
 * تحديث بيانات المستخدم
 */
export const updateProfile = async (
    userId: string,
    updates: { name?: string; phone?: string; avatar?: string }
): Promise<{ error: AuthError | null }> => {
    try {
        const { data: profile } = await (supabase as any)
            .from('profiles')
            .select('id')
            .eq('auth_user_id', userId)
            .single();

        if (profile) {
            const { error } = await (supabase as any)
                .from('profiles')
                .update({
                    full_name: updates.name,
                    phone: updates.phone,
                    avatar_url: updates.avatar,
                    updated_at: new Date().toISOString()
                })
                .eq('id', profile.id);
            return { error: mapAuthError(error) };
        }

        return { error: { code: 'not_found', message: 'Profile not found' } };
    } catch (err: any) {
        return { error: { code: 'unknown', message: err.message } };
    }
};

export const authProfileService = {
    ensureProfileExists,
    updateProfile
};

export default authProfileService;
