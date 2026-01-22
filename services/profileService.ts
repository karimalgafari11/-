/**
 * Profile Service - خدمة إدارة الملفات الشخصية
 * 
 * ⚠️ تم تقسيم هذا الملف إلى ملفات أصغر في مجلد services/profile/
 * - localStorageHelpers.ts - دوال التخزين المحلي
 * - profileHelpers.ts - دوال التحويل
 * - membershipService.ts - إدارة العضويات
 */

import { supabase, generateUUID, getCurrentTimestamp, currentStorageMode } from '../lib/supabaseClient';
import { UserRole, UserProfile, CompanyMembership } from '../types/organization';

// Import from modular files
import {
    getLocalProfiles,
    saveLocalProfiles,
    mapSupabaseProfile,
    createMembership,
    getMembershipByUserAndCompany,
    getUserMemberships as getMemberships,
    getCompanyMemberships as getCompanyMems,
    isMember,
    isOwner,
    getUserRole,
    removeMembership
} from './profile';

export const profileService = {
    /**
     * إنشاء بروفايل جديد
     */
    async createProfile(data: {
        user_id: string;
        company_id: string;
        name: string;
        email?: string;
        phone?: string;
        role: UserRole;
    }): Promise<UserProfile> {
        const now = getCurrentTimestamp();
        const profile: UserProfile = {
            id: data.user_id,
            user_id: data.user_id,
            company_id: data.company_id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            is_active: true,
            created_at: now,
            updated_at: now
        };

        if (currentStorageMode === 'cloud') {
            console.log('📝 Creating profile for user:', data.user_id);
            const { error } = await (supabase as any).from('profiles').insert({
                id: data.user_id,
                company_id: profile.company_id,
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                role: profile.role,
                is_active: profile.is_active,
                created_at: profile.created_at,
                updated_at: profile.updated_at
            });
            if (error) {
                console.error('❌ Error creating profile:', error);
                if (error.code === '23505') {
                    console.log('⚠️ Profile already exists, updating instead...');
                    await (supabase as any).from('profiles').update({
                        company_id: profile.company_id,
                        name: profile.name,
                        role: profile.role,
                        updated_at: now
                    }).eq('id', data.user_id);
                }
            } else {
                console.log('✅ Profile created successfully');
            }
        } else {
            const profiles = getLocalProfiles();
            profiles.push(profile);
            saveLocalProfiles(profiles);
        }

        await createMembership({
            user_id: data.user_id,
            company_id: data.company_id,
            role: data.role,
            is_owner: data.role === 'admin' || data.role === 'manager'
        });

        return profile;
    },

    /**
     * الحصول على بروفايل المستخدم في شركة
     */
    async getProfile(userId: string, companyId: string): Promise<UserProfile | null> {
        if (currentStorageMode === 'cloud') {
            const { data, error } = await (supabase as any)
                .from('profiles')
                .select('*')
                .eq('company_id', companyId)
                .single();

            if (error || !data) return null;
            return mapSupabaseProfile(data, userId);
        } else {
            const profiles = getLocalProfiles();
            return profiles.find(p => p.user_id === userId && p.company_id === companyId) || null;
        }
    },

    /**
     * الحصول على جميع بروفايلات المستخدم
     */
    async getUserProfiles(userId: string): Promise<UserProfile[]> {
        if (currentStorageMode === 'cloud') {
            const { data, error } = await (supabase as any)
                .from('profiles')
                .select('*')
                .eq('id', userId);

            if (error || !data) return [];
            return data.map((p: any) => mapSupabaseProfile(p, userId));
        } else {
            const profiles = getLocalProfiles();
            return profiles.filter(p => p.user_id === userId);
        }
    },

    /**
     * الحصول على جميع مستخدمي شركة
     */
    async getCompanyProfiles(companyId: string): Promise<UserProfile[]> {
        if (currentStorageMode === 'cloud') {
            const { data, error } = await (supabase as any)
                .from('profiles')
                .select('*')
                .eq('company_id', companyId)
                .eq('is_active', true);

            if (error || !data) return [];
            return data.map((p: any) => mapSupabaseProfile(p, p.id));
        } else {
            const profiles = getLocalProfiles();
            return profiles.filter(p => p.company_id === companyId && p.is_active);
        }
    },

    /**
     * تحديث بروفايل
     */
    async updateProfile(profileId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
        const now = getCurrentTimestamp();

        if (currentStorageMode === 'cloud') {
            const { data, error } = await (supabase as any)
                .from('profiles')
                .update({ ...updates, updated_at: now })
                .eq('id', profileId)
                .select()
                .single();

            if (error || !data) return null;
            return mapSupabaseProfile(data, data.id);
        } else {
            const profiles = getLocalProfiles();
            const index = profiles.findIndex(p => p.id === profileId);

            if (index === -1) return null;

            profiles[index] = {
                ...profiles[index],
                ...updates,
                updated_at: now
            };

            saveLocalProfiles(profiles);
            return profiles[index];
        }
    },

    /**
     * تغيير صلاحية مستخدم
     */
    async changeRole(profileId: string, newRole: UserRole): Promise<UserProfile | null> {
        return this.updateProfile(profileId, { role: newRole });
    },

    /**
     * تعطيل/تفعيل بروفايل
     */
    async toggleActive(profileId: string, isActive: boolean): Promise<UserProfile | null> {
        return this.updateProfile(profileId, { is_active: isActive });
    },

    /**
     * حذف بروفايل
     */
    async deleteProfile(profileId: string): Promise<boolean> {
        if (currentStorageMode === 'cloud') {
            const { error } = await (supabase as any)
                .from('profiles')
                .delete()
                .eq('id', profileId);

            return !error;
        } else {
            const profiles = getLocalProfiles();
            const filtered = profiles.filter(p => p.id !== profileId);

            if (filtered.length === profiles.length) return false;

            saveLocalProfiles(filtered);
            return true;
        }
    },

    // =================== العضويات (delegated) ===================
    createMembership,
    getMembershipByUserAndCompany,

    async getUserMemberships(userId: string): Promise<CompanyMembership[]> {
        if (currentStorageMode === 'cloud') {
            const profile = await this.getProfile(userId, '');
            return profile ? [{
                id: profile.id,
                user_id: userId,
                company_id: profile.company_id,
                role: profile.role,
                is_owner: profile.role === 'admin',
                is_active: profile.is_active,
                joined_at: profile.created_at
            }] : [];
        }
        return getMemberships(userId);
    },

    async getCompanyMemberships(companyId: string): Promise<CompanyMembership[]> {
        return getCompanyMems(companyId, this.getCompanyProfiles.bind(this));
    },

    isMember,
    isOwner,
    getUserRole,
    removeMembership,
    mapSupabaseProfile
};

export default profileService;
