/**
 * Membership Service - خدمة العضويات
 * إدارة عضويات المستخدمين في الشركات
 */

import { supabase, generateUUID, getCurrentTimestamp, currentStorageMode } from '../../lib/supabaseClient';
import { UserRole, CompanyMembership, UserProfile } from '../../types/organization';
import { getLocalMemberships, saveLocalMemberships } from './localStorageHelpers';

/**
 * إنشاء عضوية
 */
export async function createMembership(data: {
    user_id: string;
    company_id: string;
    role: UserRole;
    is_owner: boolean;
}): Promise<CompanyMembership> {
    const existing = await getMembershipByUserAndCompany(data.user_id, data.company_id);
    if (existing) return existing;

    const membership: CompanyMembership = {
        id: generateUUID(),
        user_id: data.user_id,
        company_id: data.company_id,
        role: data.role,
        is_owner: data.is_owner,
        is_active: true,
        joined_at: getCurrentTimestamp()
    };

    if (currentStorageMode === 'cloud') {
        console.log('Membership tracked via profile in cloud mode');
    } else {
        const memberships = getLocalMemberships();
        memberships.push(membership);
        saveLocalMemberships(memberships);
    }

    return membership;
}

/**
 * الحصول على عضوية بالمستخدم والشركة
 */
export async function getMembershipByUserAndCompany(
    userId: string,
    companyId: string
): Promise<CompanyMembership | null> {
    if (currentStorageMode === 'cloud') {
        const { data } = await (supabase as any)
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .eq('company_id', companyId)
            .single();

        if (!data) return null;
        return {
            id: data.id,
            user_id: userId,
            company_id: companyId,
            role: data.role,
            is_owner: data.role === 'admin' || data.role === 'manager',
            is_active: data.is_active,
            joined_at: data.created_at
        };
    } else {
        const memberships = getLocalMemberships();
        return memberships.find(m => m.user_id === userId && m.company_id === companyId) || null;
    }
}

/**
 * الحصول على عضويات المستخدم
 */
export async function getUserMemberships(userId: string): Promise<CompanyMembership[]> {
    if (currentStorageMode === 'cloud') {
        return []; // Handled via profiles in cloud mode
    } else {
        const memberships = getLocalMemberships();
        return memberships.filter(m => m.user_id === userId && m.is_active);
    }
}

/**
 * الحصول على أعضاء الشركة
 */
export async function getCompanyMemberships(
    companyId: string,
    getCompanyProfiles: (companyId: string) => Promise<UserProfile[]>
): Promise<CompanyMembership[]> {
    if (currentStorageMode === 'cloud') {
        const profiles = await getCompanyProfiles(companyId);
        return profiles.map(p => ({
            id: p.id,
            user_id: p.user_id || p.id,
            company_id: companyId,
            role: p.role,
            is_owner: p.role === 'admin',
            is_active: p.is_active,
            joined_at: p.created_at
        }));
    } else {
        const memberships = getLocalMemberships();
        return memberships.filter(m => m.company_id === companyId && m.is_active);
    }
}

/**
 * التحقق من أن المستخدم عضو في شركة
 */
export async function isMember(userId: string, companyId: string): Promise<boolean> {
    const membership = await getMembershipByUserAndCompany(userId, companyId);
    return membership !== null && membership.is_active;
}

/**
 * التحقق من أن المستخدم مالك الشركة
 */
export async function isOwner(userId: string, companyId: string): Promise<boolean> {
    const membership = await getMembershipByUserAndCompany(userId, companyId);
    return membership !== null && membership.is_owner && membership.is_active;
}

/**
 * الحصول على صلاحية المستخدم في شركة
 */
export async function getUserRole(userId: string, companyId: string): Promise<UserRole | null> {
    const membership = await getMembershipByUserAndCompany(userId, companyId);
    return membership?.role || null;
}

/**
 * إزالة عضوية (تعطيل)
 */
export async function removeMembership(userId: string, companyId: string): Promise<boolean> {
    if (currentStorageMode === 'cloud') {
        const { error } = await (supabase as any)
            .from('profiles')
            .update({ is_active: false })
            .eq('id', userId)
            .eq('company_id', companyId);

        return !error;
    } else {
        const memberships = getLocalMemberships();
        const index = memberships.findIndex(
            m => m.user_id === userId && m.company_id === companyId
        );

        if (index === -1) return false;

        memberships[index].is_active = false;
        saveLocalMemberships(memberships);
        return true;
    }
}

export const membershipService = {
    createMembership,
    getMembershipByUserAndCompany,
    getUserMemberships,
    getCompanyMemberships,
    isMember,
    isOwner,
    getUserRole,
    removeMembership
};

export default membershipService;
