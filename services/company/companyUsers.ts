/**
 * Company Users - إدارة مستخدمي الشركات
 */

import { supabase, generateUUID } from '../../lib/supabaseClient';
import { authService } from '../authService';
import { profileService } from '../profileService';
import { UserProfile, UserRole, AddUserData } from './types';
import * as cache from './cache';

/**
 * إضافة مستخدم للشركة
 */
export async function addUserToCompany(
    companyId: string,
    userData: AddUserData
): Promise<boolean> {
    try {
        const user = await authService.getCurrentUser();
        if (!user) return false;

        // التحقق من الصلاحية
        const currentRole = await profileService.getUserRole(user.id, companyId);
        if (currentRole !== 'admin' && currentRole !== 'manager') {
            console.error('Insufficient permissions to add users');
            return false;
        }

        // إنشاء مستخدم جديد
        const newUserId = generateUUID();

        // إنشاء بروفايل
        await profileService.createProfile({
            user_id: newUserId,
            company_id: companyId,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role
        });

        console.log('✅ تم إضافة المستخدم:', userData.name);
        return true;
    } catch (error) {
        console.error('Error adding user to company:', error);
        return false;
    }
}

/**
 * إزالة مستخدم من الشركة
 */
export async function removeUserFromCompany(
    companyId: string,
    userId: string
): Promise<boolean> {
    try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) return false;

        // التحقق من الصلاحية
        const currentRole = await profileService.getUserRole(currentUser.id, companyId);
        if (currentRole !== 'admin' && currentRole !== 'manager') {
            console.error('Insufficient permissions to remove users');
            return false;
        }

        return await profileService.removeMembership(userId, companyId);
    } catch (error) {
        console.error('Error removing user from company:', error);
        return false;
    }
}

/**
 * الحصول على مستخدمي الشركة
 */
export async function getCompanyUsers(companyId: string): Promise<UserProfile[]> {
    try {
        const profiles = await profileService.getCompanyProfiles(companyId);
        return profiles.map(p => ({
            id: p.id,
            company_id: p.company_id,
            name: p.name,
            email: p.email,
            phone: p.phone,
            role: p.role,
            is_active: p.is_active,
            created_at: p.created_at
        }));
    } catch (error) {
        console.error('Error getting company users:', error);
        return [];
    }
}

/**
 * تغيير صلاحية مستخدم
 */
export async function changeUserRole(
    companyId: string,
    profileId: string,
    newRole: UserRole
): Promise<boolean> {
    try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) return false;

        // التحقق من الصلاحية
        const currentRole = await profileService.getUserRole(currentUser.id, companyId);
        if (currentRole !== 'admin') {
            console.error('Only admin can change user roles');
            return false;
        }

        const result = await profileService.changeRole(profileId, newRole);
        return result !== null;
    } catch (error) {
        console.error('Error changing user role:', error);
        return false;
    }
}

/**
 * التحقق من أن المستخدم له صلاحية على الشركة
 */
export async function hasAccessToCompany(companyId: string): Promise<boolean> {
    try {
        const user = await authService.getCurrentUser();
        if (!user) return false;

        return await profileService.isMember(user.id, companyId);
    } catch (error) {
        return false;
    }
}

/**
 * التحقق من أن المستخدم أدمن
 */
export async function isAdmin(getCurrentProfile: () => Promise<UserProfile | null>): Promise<boolean> {
    try {
        const profile = await getCurrentProfile();
        return profile?.role === 'admin';
    } catch {
        return false;
    }
}
