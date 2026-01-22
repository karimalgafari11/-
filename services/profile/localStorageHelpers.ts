/**
 * Profile Local Storage - التخزين المحلي للملفات الشخصية
 */

import { UserProfile, CompanyMembership } from '../../types/organization';

const PROFILES_KEY = 'alzhra_local_profiles';
const MEMBERSHIPS_KEY = 'alzhra_local_memberships';

export function getLocalProfiles(): UserProfile[] {
    try {
        const data = localStorage.getItem(PROFILES_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function saveLocalProfiles(profiles: UserProfile[]): void {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function getLocalMemberships(): CompanyMembership[] {
    try {
        const data = localStorage.getItem(MEMBERSHIPS_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function saveLocalMemberships(memberships: CompanyMembership[]): void {
    localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(memberships));
}
